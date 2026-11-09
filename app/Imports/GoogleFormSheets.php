<?php

namespace App\Imports;

use Maatwebsite\Excel\Concerns\Import;

/**
 * Marker import used with Excel::toArray() to read raw rows of a
 * CSV/XLSX exported from the legacy Google Form. The first row is
 * treated as the header row by GoogleFormImportService.
 */
class GoogleFormSheets implements Import {}
