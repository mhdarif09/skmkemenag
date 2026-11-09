<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ImporterController;
use App\Http\Controllers\Admin\LaporanController;
use App\Http\Controllers\Admin\ServiceUnitController;
use App\Http\Controllers\SurveyController;
use Illuminate\Support\Facades\Route;

Route::get('/', [SurveyController::class, 'index'])->name('home');
Route::get('/survei', [SurveyController::class, 'create'])->name('survey.create');
Route::post('/survei', [SurveyController::class, 'store'])
    ->middleware('throttle:5,60')
    ->name('survey.store');
Route::get('/survei/terima-kasih', [SurveyController::class, 'thankYou'])->name('survey.thankyou');

// Redirect Fortify's post-login path to the real admin panel,
// and keep any legacy /dashboard links alive.
Route::redirect('/dashboard', '/admin')->name('dashboard');

Route::prefix('admin')->name('admin.')->middleware(['auth', 'verified', 'role:super_admin|admin_unit|viewer'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    Route::prefix('laporan')->name('laporan.')->group(function () {
        Route::get('/', [LaporanController::class, 'index'])->name('index');
        Route::get('/export/excel', [LaporanController::class, 'exportExcel'])->name('excel');
        Route::get('/export/pdf', [LaporanController::class, 'exportPdf'])->name('pdf');
    });

    Route::prefix('importer')->name('importer.')->group(function () {
        Route::get('/', [ImporterController::class, 'index'])
            ->name('index');
        Route::get('/template', [ImporterController::class, 'template'])
            ->name('template');
        Route::post('/preview', [ImporterController::class, 'preview'])
            ->middleware('role:super_admin|admin_unit')
            ->name('preview');
        Route::post('/commit', [ImporterController::class, 'commit'])
            ->middleware('role:super_admin|admin_unit')
            ->name('commit');
    });

    // Master data: admin can add/edit/delete service units themselves.
    Route::prefix('units')->name('units.')->group(function () {
        Route::get('/', [ServiceUnitController::class, 'index'])->name('index');
        Route::post('/', [ServiceUnitController::class, 'store'])
            ->middleware('role:super_admin|admin_unit')
            ->name('store');
        Route::put('/{unit}', [ServiceUnitController::class, 'update'])
            ->middleware('role:super_admin|admin_unit')
            ->name('update');
        Route::delete('/{unit}', [ServiceUnitController::class, 'destroy'])
            ->middleware('role:super_admin|admin_unit')
            ->name('destroy');
    });
});

require __DIR__.'/settings.php';
