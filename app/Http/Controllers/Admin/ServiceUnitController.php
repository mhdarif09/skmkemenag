<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceUnit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceUnitController extends Controller
{
    public function index()
    {
        $units = ServiceUnit::query()
            ->withCount('responses')
            ->orderBy('name')
            ->get(['id', 'name', 'description', 'responses_count']);

        return Inertia::render('admin/units/index', [
            'units' => $units,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:service_units,name'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        ServiceUnit::create($validated);

        return redirect()->route('admin.units.index')
            ->with('success', "Unit '{$validated['name']}' ditambahkan.");
    }

    public function update(Request $request, ServiceUnit $unit): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:service_units,name,'.$unit->id],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        $unit->update($validated);

        return redirect()->route('admin.units.index')
            ->with('success', "Unit '{$validated['name']}' disimpan.");
    }

    public function destroy(ServiceUnit $unit): RedirectResponse
    {
        if ($unit->responses()->exists()) {
            return redirect()->route('admin.units.index')
                ->with('error', "Unit '{$unit->name}' tidak bisa dihapus karena sudah ada data survei.");
        }

        $name = $unit->name;
        $unit->delete();

        return redirect()->route('admin.units.index')
            ->with('success', "Unit '{$name}' dihapus.");
    }
}
