<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Citizen;
use App\Models\Certificate;
use App\Models\ActivityLog;
use Illuminate\Support\Str;

class CitizenController extends Controller
{
    /**
     * Handle single citizen creation
     */
    public function save(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'nid' => 'required|string',
            'address' => 'required|string'
        ]);

        return $this->processCitizen($validated);
    }

    /**
     * Handle bulk sync from Antigravity Mode (Offline)
     */
    public function bulkSync(Request $request)
    {
        $citizensData = $request->input('citizens', []);
        $savedCount = 0;

        foreach ($citizensData as $data) {
            // Check to avoid duplicates based on NID
            $exists = Citizen::where('nid', $data['nid'])->exists();
            if (!$exists) {
                $this->processCitizen($data);
                $savedCount++;
            }
        }

        return response()->json(['message' => "$savedCount records synced successfully"]);
    }

    private function processCitizen($data)
    {
        // 1. Save Citizen
        $citizen = Citizen::create([
            'name' => $data['name'],
            'nid' => $data['nid'],
            'address' => $data['address']
        ]);

        // 2. Audit Log
        ActivityLog::create([
            'user_id' => auth()->id() ?? 1,
            'action' => "Created citizen {$citizen->name}"
        ]);

        return response()->json([
            'message' => 'Citizen saved successfully',
            'citizen_id' => $citizen->id
        ], 201);
    }
}
