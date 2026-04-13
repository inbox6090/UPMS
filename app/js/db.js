const DB_NAME = 'SmartUDCDB';
const DB_VERSION = 1;

let db;

const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('Database error: ', event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Store for citizens
            if (!db.objectStoreNames.contains('citizens')) {
                const objectStore = db.createObjectStore('citizens', { keyPath: 'id', autoIncrement: true });
                objectStore.createIndex('nid', 'nid', { unique: true });
                objectStore.createIndex('name', 'name', { unique: false });
                objectStore.createIndex('syncState', 'syncState', { unique: false }); // pending, synced
            }

            // Store for applications
            if (!db.objectStoreNames.contains('applications')) {
                const appStore = db.createObjectStore('applications', { keyPath: 'id', autoIncrement: true });
                appStore.createIndex('citizen_id', 'citizen_id', { unique: false });
                appStore.createIndex('syncState', 'syncState', { unique: false });
            }
        };
    });
};

const _transaction = (storeName, mode) => {
    return db.transaction([storeName], mode).objectStore(storeName);
};

const insertRecord = (storeName, data) => {
    return new Promise((resolve, reject) => {
        data.syncState = 'pending';
        data.createdAt = new Date().toISOString();
        const request = _transaction(storeName, 'readwrite').add(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
    });
};

const getAllRecords = (storeName) => {
    return new Promise((resolve, reject) => {
        const request = _transaction(storeName, 'readonly').getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
    });
};

const updateRecord = (storeName, data) => {
    return new Promise((resolve, reject) => {
        const request = _transaction(storeName, 'readwrite').put(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
    });
};

const getPendingSync = (storeName) => {
    return new Promise((resolve, reject) => {
        const store = _transaction(storeName, 'readonly');
        const index = store.index('syncState');
        const request = index.getAll('pending');
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
    });
};

window.dbEngine = {
    init: initDB,
    insertCitizen: (data) => insertRecord('citizens', data),
    getCitizens: () => getAllRecords('citizens'),
    getPendingCitizens: () => getPendingSync('citizens'),
    updateCitizen: (data) => updateRecord('citizens', data),
    
    insertApp: (data) => insertRecord('applications', data),
    getApps: () => getAllRecords('applications'),
    getPendingApps: () => getPendingSync('applications'),
    updateApp: (data) => updateRecord('applications', data),
};
