<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan IKM - {{ $organizationName }}</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: 'Inter', 'Plus Jakarta Sans', sans-serif; font-size: 11pt; color: #1F2937; line-height: 1.4; margin: 0; }
        .kop { border-bottom: 6px double #1B7F3B; border-top: 2px solid #F2B705; padding: 16px 20px; margin-bottom: 18px; }
        .kop img.logo { height: 48px; }
        .kop h1 { font-size: 16pt; color: #1B7F3B; margin: 4px 0 2px 0; text-transform: uppercase; }
        .kop h2 { font-size: 11pt; color: #4B5563; margin: 0; }
        .kop .instansi { font-size: 9pt; color: #6B7280; margin-top: 4px; }
        .title { text-align: center; font-size: 13pt; font-weight: bold; margin-bottom: 12px; color: #1F2937; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        th { background: #1B7F3B; color: #FFFFFF; padding: 6px 8px; font-size: 9pt; text-align: left; border: 1px solid #1B7F3B; }
        td { padding: 5px 8px; border: 1px solid #D1D5DB; font-size: 9pt; vertical-align: top; }
        tr:nth-child(even) td { background: #F3F4F6; }
        .grade { padding: 2px 8px; border-radius: 3px; font-weight: bold; font-size: 10pt; }
        .grade-a { background: #1B7F3B; color: #fff; }
        .grade-b { background: #2E8B57; color: #fff; }
        .grade-c { background: #F59E0B; color: #fff; }
        .grade-d { background: #C62828; color: #fff; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 8pt; font-weight: bold; }
        .badge-a { background: #1B7F3B; color: #fff; }
        .badge-b { background: #2E8B57; color: #fff; }
        .badge-c { background: #F59E0B; color: #fff; }
        .badge-d { background: #C62828; color: #fff; }
        .section-title { font-size: 11pt; font-weight: bold; color: #1B7F3B; margin: 16px 0 8px 0; border-bottom: 2px solid #1B7F3B; padding-bottom: 4px; }
        .summary-row { display: flex; gap: 12px; margin-bottom: 10px; }
        .card { border: 1px solid #E5E7EB; border-radius: 6px; padding: 10px 14px; flex: 1; background: #FFFFFF; }
        .card .label { font-size: 8pt; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; }
        .card .value { font-size: 16pt; font-weight: bold; color: #1F2937; }
        .svg-chart { width: 100%; height: 260px; margin: 10px 0; }
        .conclusion { background: #E6F4EA; border-left: 4px solid #1B7F3B; padding: 10px 14px; margin: 14px 0; font-size: 9.5pt; }
        .recommendation { background: #FFF7E6; border-left: 4px solid #F2B705; padding: 10px 14px; margin: 10px 0 18px 0; font-size: 9.5pt; }
        .signature-col { width: 120px; height: 40px; border: 1px solid #9CA3AF; text-align: center; vertical-align: bottom; font-size: 8pt; color: #6B7280; padding-top: 6px; }
        .page-break { page-break-before: always; }
        .small { font-size: 8pt; color: #6B7280; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
    </style>
</head>
<body>
    <!-- Kop Instansi -->
    <div class="kop">
        <div style="display: flex; align-items: center; gap: 14px;">
            @if ($logoPath)
                <img src="{{ $logoPath }}" alt="Logo" class="logo">
            @else
                <div style="width:48px;height:48px;border-radius:8px;background:#1B7F3B;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:16pt;">KA</div>
            @endif
            <div>
                <h1>{{ $organizationName }}</h1>
                <h2>Laporan Indeks Kepuasan Masyarakat (IKM) dan Persepsi Anti Korupsi</h2>
                <div class="instansi">Survei Kepuasan Masyarakat (SKM) &amp; Persepsi Anti Korupsi</div>
            </div>
        </div>
    </div>

    <div class="title text-center">Laporan Hasil Survei Kepuasan Masyarakat</div>

    <!-- Info filter -->
    <table>
        <tr><td style="width:28%;font-weight:bold;">Periode</td><td>{{ $periodName }}</td></tr>
        <tr><td style="width:28%;font-weight:bold;">Unit Layanan</td><td>{{ $unitName }}</td></tr>
        <tr><td style="width:28%;font-weight:bold;">Tanggal Cetak</td><td>{{ \Carbon\Carbon::now()->format('d/m/Y H:i:s') }}</td></tr>
    </table>

    <!-- IKM Summary Cards -->
    <div class="section-title">Ringkasan Indeks Kepuasan Masyarakat</div>
    <div class="summary-row">
        <div class="card">
            <div class="label">IKM Total</div>
            <div class="value">{{ $ikm ? number_format($ikm['ikm_total'], 2, ',', '.') : '-' }}</div>
        </div>
        <div class="card">
            <div class="label">IKM Pelayanan</div>
            <div class="value">{{ $ikm ? number_format($ikm['ikm_pelayanan'], 2, ',', '.') : '-' }}</div>
        </div>
        <div class="card">
            <div class="label">Indeks Anti Korupsi</div>
            <div class="value">{{ $ikm ? number_format($ikm['ikm_anti_corruption'], 2, ',', '.') : '-' }}</div>
        </div>
        <div class="card">
            <div class="label">Mutu Pelayanan</div>
            <div class="value grade grade-{{ strtolower($ikm['grade'] ?? 'd') }}">{{ $ikm['grade'] ?? '-' }}</div>
        </div>
        <div class="card">
            <div class="label">Jumlah Responden</div>
            <div class="value">{{ $ikm ? $ikm['respondent_count'] : 0 }}</div>
        </div>
    </div>

    <!-- NRR Table -->
    <div class="section-title">Nilai Rata-Rata Responden (NRR) per Pertanyaan</div>
    <table>
        <thead>
            <tr>
                <th style="width:6%;">No</th>
                <th>Pertanyaan</th>
                <th style="width:16%;">Kelompok</th>
                <th style="width:14%;" class="text-right">NRR</th>
                <th style="width:16%;" class="text-right">Indeks (×25)</th>
                <th style="width:14%;">Grade</th>
                <th class="signature-col">Tanda Tangan</th>
            </tr>
        </thead>
        <tbody>
            @php $no = 1; @endphp
            @foreach ($nrrPerQuestion as $q)
                <tr>
                    <td class="text-center">{{ $no++ }}</td>
                    <td>{{ $q['text'] }}</td>
                    <td><span class="badge badge-{{ strtolower($q['group']) }}">{{ $q['group'] === 'A' ? 'Pelayanan' : 'Anti Korupsi' }}</span></td>
                    <td class="text-right">{{ number_format($q['nrr'], 2, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($q['ikm'], 2, ',', '.') }}</td>
                    <td class="text-center"><span class="badge badge-{{ strtolower($q['grade'] ?? 'd') }}">{{ $q['grade'] ?? '-' }}</span></td>
                    <td class="signature-col">Tanda Tangan</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Server-side SVG Chart (NRR per question) -->
    <div class="section-title">Grafik NRR per Pertanyaan (Terendah &rarr; Tertinggi)</div>
    <div class="svg-chart">
        <svg width="100%" height="260" viewBox="0 0 700 260" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="700" height="260" fill="#ffffff" />
            @php
                $maxNrr = 4;
                $chartW = 700;
                $chartH = 260;
                $pad = 60;
                $barH = 24;
                $gap = 14;
                $colors = ['A' => '#1B7F3B', 'B' => '#2E8B57', 'C' => '#F59E0B', 'D' => '#C62828'];
                $startY = 40;
            @endphp
            @foreach ($nrrPerQuestion as $i => $q)
                @php
                    $barW = ($q['nrr'] / $maxNrr) * ($chartW - $pad - 120);
                    $y = $startY + ($i * ($barH + $gap));
                    $color = $colors[$q['group']] ?? '#6B7280';
                    $labelY = $y + $barH / 2 + 5;
                @endphp
                <text x="10" y="{{ $labelY }}" font-size="9" fill="#1F2937">{{ $q['nrr'] }}</text>
                <rect x="{{ $pad }}" y="{{ $y }}" width="{{ $barW }}" height="{{ $barH }}" fill="{{ $color }}" rx="2" />
                <text x="{{ $pad + $barW + 6 }}" y="{{ $labelY }}" font-size="8" fill="#6B7280">{{ $q['ikm'] }}</text>
                <text x="10" y="{{ $y + $barH - 4 }}" font-size="7" fill="#6B7280">{{ $q['text'] }}</text>
            @endforeach
        </svg>
    </div>

    <!-- Conclusion & Recommendation -->
    @if ($conclusion)
        <div class="conclusion"><strong>Kesimpulan:</strong> {{ $conclusion }}</div>
    @endif
    @if ($recommendation)
        <div class="recommendation"><strong>Rekomendasi:</strong> {{ $recommendation }}</div>
    @endif

    <!-- Comments -->
    <div class="section-title">Komentar dan Saran Responden</div>
    @if ($comments->count())
        <table>
            <thead>
                <tr>
                    <th style="width:6%;">No</th>
                    <th>Nama</th>
                    <th style="width:14%;">Kelamin</th>
                    <th style="width:16%;">Kota</th>
                    <th>Komentar / Saran</th>
                    <th class="signature-col">Tanda Tangan</th>
                </tr>
            </thead>
            <tbody>
                @php $cno = 1; @endphp
                @foreach ($comments as $c)
                    <tr>
                        <td class="text-center">{{ $cno++ }}</td>
                        <td>{{ $c->name ?? 'Anonim' }}</td>
                        <td>{{ $c->gender === 'L' ? 'Laki-laki' : 'Perempuan' }}</td>
                        <td>{{ $c->city }}</td>
                        <td>{{ $c->comment }}</td>
                        <td class="signature-col">Tanda Tangan</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <p class="small text-center">Tidak ada komentar atau saran dari responden.</p>
    @endif

    <!-- Signature footer -->
    <div style="margin-top: 30px; border-top: 2px solid #1B7F3B; padding-top: 12px;">
        <table style="width: 100%; border: none;">
            <tr>
                <td style="width: 50%; border: none; padding: 10px 0; text-align: center;">
                    <div class="signature-col" style="border: none; height: auto; padding-top: 0;">Mengetahui,</div>
                    <div style="height: 40px;"></div>
                    <div style="font-weight: bold;">Kepala Kementerian Agama Kota Palembang</div>
                    <div class="small">..........................</div>
                </td>
                <td style="width: 50%; border: none; padding: 10px 0; text-align: center;">
                    <div class="signature-col" style="border: none; height: auto; padding-top: 0;">Membuat,</div>
                    <div style="height: 40px;"></div>
                    <div style="font-weight: bold;">Petugas Survei Kepuasan Masyarakat</div>
                    <div class="small">..........................</div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
