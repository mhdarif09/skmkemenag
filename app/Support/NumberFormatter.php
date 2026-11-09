<?php

namespace App\Support;

class NumberFormatter
{
    /**
     * Format a numeric value into Indonesian notation, using a comma as the
     * decimal separator and a dot as the thousands separator, with two decimals.
     */
    public function format(float $value): string
    {
        return number_format(round($value, 2), 2, ',', '.');
    }
}
