<?php

use App\Support\NumberFormatter;

it('formats a value with an Indonesian decimal comma', function () {
    expect((new NumberFormatter)->format(87.456))->toBe('87,46');
});

it('formats a whole number with two decimals', function () {
    expect((new NumberFormatter)->format(100.0))->toBe('100,00');
});

it('formats thousands with the Indonesian grouping', function () {
    expect((new NumberFormatter)->format(1234.5))->toBe('1.234,50');
});
