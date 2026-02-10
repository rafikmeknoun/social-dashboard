<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analytics_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('property_id');
            $table->string('property_name');
            $table->string('website_url')->nullable();
            $table->string('credentials_path');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique('property_id');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_accounts');
    }
};
