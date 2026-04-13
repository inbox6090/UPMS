// auth.js
// Handles authentication and Session Management

const USERS = {
    'Baheratailunion@gmail.com': { password: '482300', role: 'Chairman', name: 'Mosharaf Hossain' },
    'inbox6090@gmail.com': { password: '482300', role: 'Operator', name: 'Md Jubaer Hossen' }
};

document.addEventListener('DOMContentLoaded', () => {
    // Check if on login page
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        // If already logged in, redirect to dashboard
        if (isLoggedIn()) {
            window.location.href = 'dashboard.html';
        }

        loginForm.addEventListener('submit', handleLogin);
    } else {
        // If on a protected page (not login/index)
        if (!isLoggedIn() && window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'login.html';
        } else {
            applyRBAC();
        }

        // Setup logout button if it exists
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    }
});

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();
    const errorMsg = document.getElementById('loginError');
    const btn = document.getElementById('loginBtn');
    const spinner = document.getElementById('loadingSpinner');

    // UI Loading state
    btn.disabled = true;
    spinner.classList.remove('hidden');
    errorMsg.classList.add('hidden');

    setTimeout(() => {
        // Mock server validation delay
        const user = USERS[email];
        if (user && user.password === password) {
            // Success
            const sessionData = {
                email: email,
                role: user.role,
                name: user.name,
                loginTime: new Date().getTime()
            };
            localStorage.setItem('udc_session', JSON.stringify(sessionData));
            window.location.href = 'dashboard.html';
        } else {
            // Failure
            errorMsg.classList.remove('hidden');
            btn.disabled = false;
            spinner.classList.add('hidden');
        }
    }, 800);
}

function handleLogout() {
    localStorage.removeItem('udc_session');
    window.location.href = 'login.html';
}

function isLoggedIn() {
    const session = localStorage.getItem('udc_session');
    if (!session) return false;
    
    try {
        const data = JSON.parse(session);
        // Optional: Session expiry logic here (e.g., 24 hours)
        const ONE_DAY = 24 * 60 * 60 * 1000;
        if (new Date().getTime() - data.loginTime > ONE_DAY) {
            localStorage.removeItem('udc_session');
            return false;
        }
        return true;
    } catch (e) {
        return false;
    }
}

function getUserSession() {
    const session = localStorage.getItem('udc_session');
    return session ? JSON.parse(session) : null;
}

function applyRBAC() {
    const session = getUserSession();
    if (!session) return;

    // Show user info in UI if elements exist
    const userNameEl = document.getElementById('ui_userName');
    const userRoleEl = document.getElementById('ui_userRole');
    if (userNameEl) userNameEl.textContent = session.name;
    if (userRoleEl) userRoleEl.textContent = session.role;

    // Restrict elements based on role
    // Anything with class 'role-chairman-only' will be hidden for Operators
    if (session.role === 'Operator') {
        const restrictedElements = document.querySelectorAll('.role-chairman-only');
        restrictedElements.forEach(el => {
            el.style.display = 'none';
        });
    }
}
