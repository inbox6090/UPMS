<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Certificate;

class VerifyController extends Controller
{
    /**
     * Public API to verify a certificate by reference number
     */
    public function verify($ref)
    {
        $certificate = Certificate::with('citizen')->where('reference_no', $ref)->first();

        if (!$certificate) {
            return response()->json([
                'status' => 'Not Found ❌',
                'message' => 'Invalid reference number'
            ], 404);
        }

        if ($certificate->status === 'approved') {
            return response()->json([
                'status' => 'Verified ✅',
                'citizen_name' => $certificate->citizen->name,
                'reference_no' => $certificate->reference_no
            ]);
        }

        return response()->json([
            'status' => 'Pending ⚠️',
            'citizen_name' => $certificate->citizen->name,
            'message' => 'Certificate is not approved yet'
        ]);
    }
}
