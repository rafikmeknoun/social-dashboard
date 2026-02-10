<?php

namespace App\Providers;

use App\Models\Dashboard;
use App\Models\SocialAccount;
use App\Policies\DashboardPolicy;
use App\Policies\SocialAccountPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Dashboard::class => DashboardPolicy::class,
        SocialAccount::class => SocialAccountPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        //
    }
}
