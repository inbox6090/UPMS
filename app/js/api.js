// api.js
// Handles communication with the Google Apps Script Backend

const API_URL = 'https://script.google.com/macros/s/AKfycbzypOed-w1FojVlzl8m6D4iE_e3e0UYFgum9HxSkvq-MQxZs8RfmWQfn_XUHczgQ5Rk/exec'; 

// Simple wrapper for GET requests
async function fetchGET(action, params = {}) {
    const url = new URL(API_URL);
    url.searchParams.append('action', action);
    for (const key in params) {
        url.searchParams.append(key, params[key]);
    }
    
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (e) {
        console.error("GET Request Failed", e);
        throw e;
    }
}

// Simple wrapper for POST requests
async function fetchPOST(action, data) {
    try {
        const payload = { action, data };
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            // 'no-cors' mode might be required if dealing with Google Script redirects without exact CORS headers, 
            // but standard 'cors' often works if returning JSON properly from Script.
            // Using text/plain avoids CORS preflight on Google Apps Script. 
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', 
            }
        });
        return await response.json();
    } catch (e) {
        console.error("POST Request Failed", e);
        throw e;
    }
}
