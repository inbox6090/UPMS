// Role Based Access Control

const RoleManager = {
    applyRoles: () => {
        const user = window.Auth.getCurrentUser();
        if(!user) return;

        // Apply visual name changes in UI
        const nameBadges = document.querySelectorAll('.auth-user-name');
        nameBadges.forEach(el => el.textContent = `${user.name} (${user.role})`);

        // Get all elements that require a specific role
        const restrictedElements = document.querySelectorAll('[data-role-required]');
        
        restrictedElements.forEach(el => {
            const requiredRoles = el.getAttribute('data-role-required').split(',');
            // If the user's role is not in the required roles list, hide it completely.
            if (!requiredRoles.includes(user.role)) {
                el.style.display = 'none';
            } else {
                el.style.display = ''; // retain default display
            }
        });
    },

    isChairman: () => {
        const user = window.Auth.getCurrentUser();
        return user && user.role === 'Chairman';
    },

    isOperator: () => {
        const user = window.Auth.getCurrentUser();
        return user && user.role === 'Operator';
    }
};

window.RoleManager = RoleManager;
