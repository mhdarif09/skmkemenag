<?php

use App\Http\Controllers\SurveyController;
use Illuminate\Support\Facades\Route;

Route::get('/', [SurveyController::class, 'index'])->name('home');
Route::get('/survei', [SurveyController::class, 'create'])->name('survey.create');
Route::post('/survei', [SurveyController::class, 'store'])
    ->middleware('throttle:5,60')
    ->name('survey.store');
Route::get('/survei/terima-kasih', [SurveyController::class, 'thankYou'])->name('survey.thankyou');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::prefix('admin')->name('admin.')->middleware(['auth', 'verified', 'role:super_admin|admin_unit|viewer'])->group(function () {
    Route::get('/', [App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');
});

require __DIR__.'/settings.php';
