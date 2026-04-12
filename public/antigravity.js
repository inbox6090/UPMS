// Antigravity Mode & Core Frontend Logic
const dbName = "SmartUDC";
const storeName = "pending_citizens";
let db;

// 1. Initialize PWA Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('Service Worker Registered'))
        .catch(err => console.log('Service Worker Error', err));
}

// 2. Initialize IndexedDB
const request = indexedDB.open(dbName, 1);
request.onupgradeneeded = event => {
    db = event.target.result;
    if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
    }
};
request.onsuccess = event => {
    db = event.target.result;
    updatePendingCount();
};

// 3. Network State Manager (Antigravity Mode)
const statusBadge = document.getElementById('connection-status');
const floatMsg = document.getElementById('floating-msg');
const pendingCountEl = document.getElementById('pending-count');

function updateNetworkStatus() {
    if (navigator.onLine) {
        statusBadge.className = 'status-badge online';
        statusBadge.innerHTML = '🌐 Online Mode';
        floatMsg.style.display = 'none';
        syncAntigravityData(); // Auto-sync when back online
    } else {
        statusBadge.className = 'status-badge offline';
        statusBadge.innerHTML = '🌌 Antigravity Mode (Offline)';
        floatMsg.style.display = 'block';
    }
}
window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);
updateNetworkStatus();

// Play sound helper
function playSuccessSound() {
    // Fallback if audio file is not present yet
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
}

// 4. Save Data (Offline & Online)
function saveToDatabase(citizen) {
    document.getElementById('save-loader').style.display = 'inline-block';
    
    if (navigator.onLine) {
        // Direct API call
        fetch('/api/citizen/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(citizen)
        })
        .then(res => res.json())
        .then(data => {
            playSuccessSound();
            refreshTable();
            document.getElementById('citizen-form').reset();
            document.getElementById('save-loader').style.display = 'none';
        }).catch(err => {
            // Fallback to IndexedDB if API fails
            saveOffline(citizen);
        });
    } else {
        // Antigravity Save
        saveOffline(citizen);
    }
}

function saveOffline(citizen) {
    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    citizen.offline_ts = new Date().getTime();
    store.add(citizen);
    transaction.oncomplete = () => {
        playSuccessSound();
        document.getElementById('citizen-form').reset();
        document.getElementById('save-loader').style.display = 'none';
        updatePendingCount();
    };
}

// 5. Sync Logic
function syncAntigravityData() {
    if (!db) return;
    const transaction = db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    const getAll = store.getAll();

    getAll.onsuccess = () => {
        const items = getAll.result;
        if (items.length === 0) return;

        // Push in bulk or individually
        fetch('/api/citizen/bulk-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ citizens: items })
        })
        .then(res => res.json())
        .then(data => {
            // Clear IndexedDB after successful sync
            const clearTx = db.transaction([storeName], "readwrite");
            clearTx.objectStore(storeName).clear();
            updatePendingCount();
            refreshTable();
            alert(`Synchronized ${items.length} offline records to server!`);
        })
        .catch(err => console.log('Sync failed, keeping data offline.', err));
    };
}

function updatePendingCount() {
    if (!db) return;
    const tx = db.transaction([storeName], "readonly");
    const req = tx.objectStore(storeName).count();
    req.onsuccess = () => {
        pendingCountEl.innerText = req.result;
    };
}

// 6. UI Bindings
document.getElementById('citizen-form').addEventListener('submit', e => {
    e.preventDefault();
    const citizen = {
        name: document.getElementById('c-name').value,
        nid: document.getElementById('c-nid').value,
        address: document.getElementById('c-address').value
    };
    saveToDatabase(citizen);
});

document.getElementById('force-sync-btn').addEventListener('click', syncAntigravityData);

// 7. CSV Upload (PapaParse)
document.getElementById('import-btn').addEventListener('click', () => {
    const file = document.getElementById('csv-file').files[0];
    if (!file) return alert('Select a CSV file first');
    
    Papa.parse(file, {
        header: true,
        complete: function(results) {
            const data = results.data;
            if(data.length > 0) {
                // Save sequentially to trigger sync/offline logic
                data.forEach(row => {
                    if(row.name && row.nid) {
                        saveOffline(row); // Save offline first, then force sync
                    }
                });
                alert(`Imported ${data.length} records into pending queue. Syncing...`);
                syncAntigravityData();
            }
        }
    });
});

// 8. Auth Logic (Mocked for SPA Flow) 
const authSection = document.getElementById('auth-section');
const dashSection = document.getElementById('dashboard-section');

document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    // Simulate login API call
    localStorage.setItem('udc_token', 'mock_token');
    localStorage.setItem('udc_role', 'Operator');
    checkAuth();
});

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('udc_token');
    checkAuth();
});

function checkAuth() {
    const token = localStorage.getItem('udc_token');
    if (token) {
        authSection.style.display = 'none';
        dashSection.style.display = 'block';
        refreshTable();
    } else {
        authSection.style.display = 'flex';
        dashSection.style.display = 'none';
    }
}
checkAuth(); // Call on load

// 9. Table & QR Generation
let qrCodeInstance = null;

function refreshTable() {
    // In missing API, mock data
    const mockData = [
        { ref: 'UDC-170123-A', name: 'Md. Abdur Rahman', nid: '1234567890', status: 'Approved' }
    ];
    
    const tbody = document.getElementById('cert-table-body');
    tbody.innerHTML = '';
    
    mockData.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.ref}</td>
            <td>${item.name}</td>
            <td>${item.nid}</td>
            <td><span class="badge bg-success">${item.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-dark" onclick="showQR('${item.ref}')">View QR</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.showQR = function(ref) {
    const modal = new bootstrap.Modal(document.getElementById('qrModal'));
    const container = document.getElementById('qrcode-container');
    container.innerHTML = ''; // Clear previous
    document.getElementById('qr-ref-display').innerText = `Ref: ${ref}`;
    
    // Generate QR
    qrCodeInstance = new QRCode(container, {
        text: `https://udc.example.com/verify/${ref}`,
        width: 128,
        height: 128
    });
    
    modal.show();
}
