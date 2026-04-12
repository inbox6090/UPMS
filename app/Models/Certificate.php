<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    protected $fillable = ['citizen_id', 'reference_no', 'status'];

    public function citizen()
    {
        return $this->belongsTo(Citizen::class);
    }
}
