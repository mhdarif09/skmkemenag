export function formatNumber(value: number): string {
    const rounded = Math.round(value * 100) / 100;

    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(rounded);
}
