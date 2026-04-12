# Smart Unified Management System (UDC Baheratail)

A PWA-enabled, offline-first ("Antigravity Mode") management system built with Laravel and pure JavaScript/Bootstrap.

## Features

- **Antigravity Mode (Offline First)**: Save citizen data even when your internet is disconnected. Data is stored in IndexedDB and automatically synced with the server when you go back online.
- **Bulk CSV Import**: Import legacy data seamlessly using the PapaParse CSV integration.
- **Audit Logs**: All creations and approvals are logged in the `activity_logs` table.
- **QR Code Verification**: Every approved certificate receives a unique Reference Number (e.g., UDC-1712-XYZA) and an auto-generated QR code for public verification.
- **PWA Ready**: Can be installed on Android, iOS, or PC as an application. It works entirely offline with cached logic.
- **Dynamic UX**: Floating connection statuses, offline fallbacks, loading animations, and audio cues upon synchronization.

## Folder Structure (Custom Built)

- `public/`: Contains the SPA frontend, PWA Service Worker, Manifest, and offline core logic (`antigravity.js`).
- `routes/api.php`: API definitions for Auth, Citizen Sync, and QR Verification.
- `app/Models/`: Eloquent models defining database relations (`Citizen`, `Certificate`, `ActivityLog`).
- `app/Http/Controllers/`: Holds business logic for syncing data and issuing certificates.
- `database/migrations/`: Database schema matching the structural needs.

## Setup Instructions

Since this repository currently contains only the core specific files to merge into a Laravel environment, please follow these steps to run the application:

1. Create a fresh Laravel application in a temporary location or use your existing system:
   ```bash
   composer create-project laravel/laravel udc-system
   ```

2. Copy the contents created in this repository (`app/`, `database/`, `routes/`, `public/`) over the default Laravel codebase.

3. Install dependencies and set up the SQLite database:
   ```bash
   composer install
   php artisan migrate
   ```

4. Start the Application:
   ```bash
   php artisan serve --host=0.0.0.0
   ```
   *Note: Using `--host=0.0.0.0` makes the development server accessible over your local LAN (so you can test mobile PWA features).*

## API Endpoints Overview

- `POST /api/citizen/save` - Save single citizen (Operator).
- `POST /api/citizen/bulk-sync` - Sync batch from Antigravity Mode (Operator).
- `POST /api/certificate/{id}/approve` - Approve Pending Certs (Chairman).
- `GET /api/verify/{ref}` - Validate QR code status (Public).
