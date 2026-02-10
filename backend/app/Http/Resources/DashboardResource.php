<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'layout_config' => $this->layout_config,
            'widgets' => $this->widgets,
            'is_default' => $this->is_default,
            'is_shared' => $this->is_shared,
            'share_token' => $this->when($this->is_shared, $this->share_token),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
