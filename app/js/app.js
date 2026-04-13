// app.js
// Main UI logic, form submissions, and offline sync features

document.addEventListener('DOMContentLoaded', async () => {
    // Only init if we are on dashboard
    if (!document.getElementById('sec-dashboard')) return;

    // Initialize Local IndexedDB
    try {
        if(window.dbEngine) {
            await window.dbEngine.init();
            console.log("IndexedDB Initialized");
            syncPendingData();
        }
    } catch (e) {
        console.error("DB Init error", e);
    }

    // Network status listeners
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus();

    // UI Listeners
    setupCitizenForm();
    initChart();
    loadDashboardStats();
    
    // Tab routing based on URL hash if needed
    if (window.location.hash) {
        switchTab(window.location.hash.substring(1));
    }
});

function switchTab(tabId) {
    // Hide all sections
    document.querySelectorAll('main section').forEach(sec => sec.classList.add('section-hidden'));
    
    // Remove active state from nav
    document.querySelectorAll('#sidebar a').forEach(a => a.classList.remove('sidebar-active'));
    
    // Show selected section
    const targetSec = document.getElementById(`sec-${tabId}`);
    if (targetSec) targetSec.classList.remove('section-hidden');
    
    // Activate nav
    const targetNav = document.getElementById(`nav-${tabId}`);
    if (targetNav) targetNav.classList.add('sidebar-active');
    
    window.location.hash = tabId;
}

function updateNetworkStatus() {
    const indicator = document.getElementById('networkStatusIndicator');
    const text = document.getElementById('networkStatusText');
    if(!indicator || !text) return;

    if (navigator.onLine) {
        indicator.classList.remove('bg-red-400');
        indicator.classList.add('bg-green-400');
        text.textContent = 'Online';
        syncPendingData(); // Auto sync when coming online
    } else {
        indicator.classList.remove('bg-green-400');
        indicator.classList.add('bg-red-400');
        text.textContent = 'Offline (Antigravity Mode)';
    }
}

// ========================
// Citizen Form Logic
// ========================
function setupCitizenForm() {
    const form = document.getElementById('citizenForm');
    const sameAdd = document.getElementById('sameAddressCheck');
    const perm = document.getElementById('permAddr');
    const pres = document.getElementById('presAddr');
    
    if (!form) return;

    sameAdd.addEventListener('change', (e) => {
        if(e.target.checked) {
            pres.value = perm.value;
            pres.readOnly = true;
            pres.classList.add('bg-gray-100');
        } else {
            pres.value = '';
            pres.readOnly = false;
            pres.classList.remove('bg-gray-100');
        }
    });

    perm.addEventListener('input', () => {
        if(sameAdd.checked) {
            pres.value = perm.value;
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submitCitizenBtn');
        const spinner = document.getElementById('btnSpinner');
        const errorDiv = document.getElementById('formError');
        const successDiv = document.getElementById('formSuccess');
        
        btn.disabled = true; spinner.classList.remove('hidden');
        errorDiv.classList.add('hidden'); successDiv.classList.add('hidden');

        const formData = new FormData(form);
        const citizenData = Object.fromEntries(formData.entries());

        try {
            // Check NID duplication locally first
            if(window.dbEngine) {
               const allLocals = await window.dbEngine.getCitizens();
               const isDup = allLocals.find(c => c.nid === citizenData.nid);
               if(isDup) throw new Error("Duplicate NID detected locally.");
               
               // Save to local indexedDB
               await window.dbEngine.insertCitizen(citizenData);
            }

            // Sync to server if online
            if (navigator.onLine) {
                const res = await fetchPOST('addCitizen', citizenData);
                if(res.status === 'error') throw new Error(res.message);
                
                // Mark local as synced
                if(window.dbEngine) {
                    // Update syncState logic would go here
                }
            }
            
            successDiv.textContent = navigator.onLine ? "Citizen saved and synced successfully." : "Saved offline. Will sync when online.";
            successDiv.classList.remove('hidden');
            form.reset();
            sameAdd.checked = false;
            pres.readOnly = false; pres.classList.remove('bg-gray-100');
            
            loadDashboardStats(); // update charts
            
        } catch (err) {
            errorDiv.textContent = err.message || "An error occurred during save.";
            errorDiv.classList.remove('hidden');
        } finally {
            btn.disabled = false; spinner.classList.add('hidden');
        }
    });
}

// ========================
// Background Sync
// ========================
async function syncPendingData() {
    if(!navigator.onLine || !window.dbEngine) return;
    
    try {
        const pending = await window.dbEngine.getPendingCitizens();
        for (const data of pending) {
            console.log("Attempting to sync citizen:", data.nid);
            const res = await fetchPOST('addCitizen', data);
            if (res.status === 'success' || res.message.includes('Duplicate')) {
                data.syncState = 'synced';
                await window.dbEngine.updateCitizen(data);
            }
        }
    } catch(e) {
        console.log("Sync error", e);
    }
}

// ========================
// Stats & Charts
// ========================
function loadDashboardStats() {
    if(!document.getElementById('statTotalCitizens')) return;
    
    // Fallback Mock values if Google API not fetched yet
    document.getElementById('statTotalCitizens').innerText = Math.floor(Math.random() * 500) + 1200;
    document.getElementById('statPendingApps').innerText = Math.floor(Math.random() * 50) + 10;
    document.getElementById('statApprovedApps').innerText = Math.floor(Math.random() * 400) + 800;
}

function initChart() {
    const ctx = document.getElementById('activityChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Applications Processed',
                data: [65, 59, 80, 81, 56, 55],
                fill: true,
                borderColor: '#15803d',
                backgroundColor: 'rgba(21, 128, 61, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

function openNewApplicationModal() {
    alert("This will open a modal to create a new application, generate AI Bangla draft, and issue the QR Serial.");
}
