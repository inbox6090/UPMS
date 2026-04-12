<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CitizenController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\VerifyController;

use App\Http\Controllers\AuthController;

// Public QR Verification
Route::get('/verify/{ref}', [VerifyController::class, 'verify']);

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Protected Operator Routes
Route::middleware(['auth:sanctum', 'role:Operator'])->group(function () {
    Route::post('/citizen/save', [CitizenController::class, 'save']);
    Route::post('/citizen/bulk-sync', [CitizenController::class, 'bulkSync']);
    Route::post('/certificate/generate', [CertificateController::class, 'generate']);
});

// Protected Chairman Routes
Route::middleware(['auth:sanctum', 'role:Chairman'])->group(function () {
    Route::post('/certificate/approve', [CertificateController::class, 'approve']);
});
