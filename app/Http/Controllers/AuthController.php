<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\ActivityLog;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            
            $user = Auth::user();
            ActivityLog::create([
                'user_id' => $user->id,
                'action' => "User {$user->name} logged in"
            ]);

            // Auto redirect based on role
            return response()->json([
                'message' => 'Logged in successfully',
                'role' => $user->role,
                'redirect' => '/dashboard'
            ]);
        }

        return response()->json([
            'message' => 'The provided credentials do not match our records.'
        ], 401);
    }

    public function logout(Request $request)
    {
        $user = Auth::user();
        if ($user) {
            ActivityLog::create([
                'user_id' => $user->id,
                'action' => "User {$user->name} logged out"
            ]);
        }

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully']);
    }
}
