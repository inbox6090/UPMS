<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Certificate;
use App\Models\ActivityLog;
use Illuminate\Support\Str;

class CertificateController extends Controller
{
    /**
     * Generate new certificate (Operator role)
     */
    public function generate(Request $request)
    {
        $validated = $request->validate([
            'citizen_id' => 'required|exists:citizens,id'
        ]);

        $refNo = 'UDC-' . time() . '-' . strtoupper(Str::random(4));
        
        $certificate = Certificate::create([
            'citizen_id' => $validated['citizen_id'],
            'reference_no' => $refNo,
            'status' => 'pending'
        ]);

        ActivityLog::create([
            'user_id' => auth()->id() ?? 1,
            'action' => "Generated certificate $refNo"
        ]);

        return response()->json(['message' => 'Generated', 'reference_no' => $refNo], 201);
    }

    /**
     * Approve certificate (Chairman role)
     */
    public function approve(Request $request)
    {
        $validated = $request->validate([
            'reference_no' => 'required|string'
        ]);

        $certificate = Certificate::where('reference_no', $validated['reference_no'])->firstOrFail();
        $certificate->update(['status' => 'approved']);

        ActivityLog::create([
            'user_id' => auth()->id() ?? 1,
            'action' => "Approved certificate {$certificate->reference_no}"
        ]);

        return response()->json(['message' => 'Certificate approved']);
    }
}
