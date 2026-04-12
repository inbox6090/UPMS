<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Citizen extends Model
{
    protected $fillable = ['name', 'nid', 'address'];

    public function certificate()
    {
        return $this->hasOne(Certificate::class);
    }
}
