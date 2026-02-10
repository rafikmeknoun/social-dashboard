<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return redirect('/app');
});

// Serve Vue.js app
Route::get('/app/{any?}', function () {
    return file_get_contents(public_path('frontend/index.html'));
})->where('any', '.*');
