// Local-First IndexedDB Database & Background Cloud Sync Manager

const DB = {
  dbName: 'NERDementiaDB',
  version: 2,
  db: null,
  isOnline: true,
  isSyncing: false,
  
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        
        if (!db.objectStoreNames.contains('patients')) {
          db.createObjectStore('patients', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('game_sessions')) {
          const store = db.createObjectStore('game_sessions', { keyPath: 'id' });
          store.createIndex('patient_id', 'patient_id', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
        if (!db.objectStoreNames.contains('reminder_logs')) {
          const store = db.createObjectStore('reminder_logs', { keyPath: 'id' });
          store.createIndex('patient_id', 'patient_id', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
        if (!db.objectStoreNames.contains('scheduled_reminders')) {
          const store = db.createObjectStore('scheduled_reminders', { keyPath: 'id' });
          store.createIndex('patient_id', 'patient_id', { unique: false });
          store.createIndex('reminder_time', 'reminder_time', { unique: false });
        }
        if (!db.objectStoreNames.contains('alerts')) {
          const store = db.createObjectStore('alerts', { keyPath: 'id' });
          store.createIndex('patient_id', 'patient_id', { unique: false });
        }
        if (!db.objectStoreNames.contains('doctor_notes')) {
          const store = db.createObjectStore('doctor_notes', { keyPath: 'id' });
          store.createIndex('patient_id', 'patient_id', { unique: false });
        }
        if (!db.objectStoreNames.contains('sync_outbox')) {
          db.createObjectStore('sync_outbox', { keyPath: 'outbox_id', autoIncrement: true });
        }
      };
      
      request.onsuccess = async (e) => {
        this.db = e.target.result;
        
        // Listen to browser online/offline events
        window.addEventListener('online', () => this.handleNetworkChange(true));
        window.addEventListener('offline', () => this.handleNetworkChange(false));
        this.isOnline = navigator.onLine;
        
        // Seed initial data from server if connected or fallback to local
        await this.syncDownInitialData();
        resolve(this.db);
      };
      
      request.onerror = (e) => {
        console.error('IndexedDB open error:', e);
        reject(e);
      };
    });
  },
  
  handleNetworkChange(online) {
    this.isOnline = online;
    this.updateNetworkUI();
    if (online) {
      this.triggerBackgroundSync();
    }
  },
  
  toggleSimulatedNetwork() {
    this.isOnline = !this.isOnline;
    this.updateNetworkUI();
    if (this.isOnline) {
      this.triggerBackgroundSync();
    }
  },
  
  updateNetworkUI() {
    const badge = document.getElementById('network-status-badge');
    if (badge) {
      if (this.isOnline) {
        badge.className = 'status-badge online';
        badge.innerHTML = `<span class="pulse-dot green"></span> <span data-i18n="online_status">${I18N.t('online_status')}</span>`;
      } else {
        badge.className = 'status-badge offline';
        badge.innerHTML = `<span class="pulse-dot orange"></span> <span data-i18n="offline_status">${I18N.t('offline_status')}</span>`;
      }
    }
  },
  
  // Generic IndexedDB Put
  async putItem(storeName, item) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve(item);
      req.onerror = (e) => reject(e);
    });
  },
  
  // Generic IndexedDB Get
  async getItem(storeName, key) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = (e) => reject(e);
    });
  },
  
  // Generic IndexedDB GetAll
  async getAllItems(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e);
    });
  },
  
  // Queue item for background sync
  async queueForSync(type, data) {
    const outboxItem = {
      type: type, // patient, game_session, reminder_log, alert, doctor_note, scheduled_reminder
      data: data,
      created_at: new Date().toISOString()
    };
    
    // Save to local object store first (Local-First principle)
    const storeMap = {
      'patient': 'patients',
      'game_session': 'game_sessions',
      'reminder_log': 'reminder_logs',
      'alert': 'alerts',
      'doctor_note': 'doctor_notes',
      'scheduled_reminder': 'scheduled_reminders'
    };
    if (storeMap[type]) {
      await this.putItem(storeMap[type], data);
    }
    
    // Add to outbox
    const tx = this.db.transaction('sync_outbox', 'readwrite');
    const store = tx.objectStore('sync_outbox');
    store.add(outboxItem);
    
    // If online, immediately trigger background sync
    if (this.isOnline) {
      this.triggerBackgroundSync();
    }
  },

  async deleteScheduledReminder(reminder) {
    const tx = this.db.transaction(['scheduled_reminders', 'sync_outbox'], 'readwrite');
    tx.objectStore('scheduled_reminders').delete(reminder.id);
    tx.objectStore('sync_outbox').add({
      type: 'scheduled_reminder_delete',
      data: { id: reminder.id, patient_id: reminder.patient_id },
      created_at: new Date().toISOString()
    });
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    if (this.isOnline) this.triggerBackgroundSync();
  },
  
  // Sync background outbox to server
  async triggerBackgroundSync() {
    if (this.isSyncing || !this.isOnline) return;
    this.isSyncing = true;
    
    try {
      const outboxItems = await this.getAllItems('sync_outbox');
      if (outboxItems.length === 0) {
        this.isSyncing = false;
        return;
      }
      
      const payload = {
        patients: [],
        game_sessions: [],
        reminder_logs: [],
        alerts: [],
        doctor_notes: [],
        scheduled_reminders: [],
        deleted_scheduled_reminder_ids: []
      };
      
      outboxItems.forEach(item => {
        if (item.type === 'patient') payload.patients.push(item.data);
        else if (item.type === 'game_session') payload.game_sessions.push(item.data);
        else if (item.type === 'reminder_log') payload.reminder_logs.push(item.data);
        else if (item.type === 'alert') payload.alerts.push(item.data);
        else if (item.type === 'doctor_note') payload.doctor_notes.push(item.data);
        else if (item.type === 'scheduled_reminder') payload.scheduled_reminders.push(item.data);
        else if (item.type === 'scheduled_reminder_delete') payload.deleted_scheduled_reminder_ids.push(item.data.id);
      });
      
      const res = await fetch('/api/sync/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        // Clear synced outbox items
        const tx = this.db.transaction('sync_outbox', 'readwrite');
        tx.objectStore('sync_outbox').clear();
        console.log('Background sync completed successfully:', await res.json());
      }
    } catch (err) {
      console.warn('Sync attempt failed (will retry when connection stabilizes):', err);
    } finally {
      this.isSyncing = false;
    }
  },
  
  // Initial sync down from server
  async syncDownInitialData() {
    try {
      const res = await fetch('/api/patients');
      if (res.ok) {
        const patients = await res.json();
        for (const p of patients) {
          await this.putItem('patients', p);
        }
      }
      
      const alertRes = await fetch('/api/alerts');
      if (alertRes.ok) {
        const alerts = await alertRes.json();
        for (const a of alerts) {
          await this.putItem('alerts', a);
        }
      }

      const schedulesRes = await fetch('/api/scheduled-reminders');
      if (schedulesRes.ok) {
        const schedules = await schedulesRes.json();
        for (const schedule of schedules) {
          await this.putItem('scheduled_reminders', schedule);
        }
      }
    } catch (e) {
      console.log('Starting in standalone offline mode (using local IndexedDB cache).');
    }
  }
};
