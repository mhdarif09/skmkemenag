<?php

namespace Database\Seeders;

use App\Models\Question;
use Illuminate\Database\Seeder;

class QuestionSeeder extends Seeder
{
    /**
     * @var list<array{group: string, text: string}>
     */
    public const QUESTIONS = [
        ['group' => Question::GROUP_SERVICE, 'text' => 'Jenis persyaratan yang harus saya penuhi sudah sesuai dengan kualitas pelayanan yang saya terima'],
        ['group' => Question::GROUP_SERVICE, 'text' => 'Alur prosedur pelayanan di Kemenag Palembang dapat saya ikuti dengan mudah dan efisien'],
        ['group' => Question::GROUP_SERVICE, 'text' => 'Jenis-jenis pelayanan di Kemenag Palembang telah berjalan tepat waktu dan sesuai jadwal yang ditentukan'],
        ['group' => Question::GROUP_SERVICE, 'text' => 'Tidak ada pungutan liar yang harus saya bayarkan untuk menerima pelayanan di Kemenag Palembang'],
        ['group' => Question::GROUP_SERVICE, 'text' => 'Spesifikasi jenis produk Kemenag Palembang sudah sesuai dengan SOP pelayanan'],
        ['group' => Question::GROUP_SERVICE, 'text' => 'Petugas layanan di Kemenag Palembang kompeten dan terampil dalam menjalankan tugasnya'],
        ['group' => Question::GROUP_SERVICE, 'text' => 'Petugas layanan di Kemenag Palembang berlaku adil, sopan dan ramah terhadap pemohon'],
        ['group' => Question::GROUP_SERVICE, 'text' => 'Petugas layanan di Kemenag Palembang berlaku adil, sopan dan ramah terhadap tamu'],
        ['group' => Question::GROUP_SERVICE, 'text' => 'Penanganan pengaduan, saran dan masukan selama pengajuan permohonan pelayanan telah sesuai prosedur dan dapat memudahkan pemohon'],
        ['group' => Question::GROUP_SERVICE, 'text' => 'Sarana dan prasarana di Kemenag Palembang sudah baik dan menunjang pelaksanaan pelayanan'],
        ['group' => Question::GROUP_ANTI_CORRUPTION, 'text' => 'Tidak ada diskriminasi pelayanan pada unit layanan ini'],
        ['group' => Question::GROUP_ANTI_CORRUPTION, 'text' => 'Tidak ada pelayanan di luar prosedur/kecurangan pelayanan pada unit layanan ini'],
        ['group' => Question::GROUP_ANTI_CORRUPTION, 'text' => 'Tidak ada penerimaan imbalan uang/barang/fasilitas di luar ketentuan yang berlaku pada unit layanan ini'],
        ['group' => Question::GROUP_ANTI_CORRUPTION, 'text' => 'Tidak ada pungutan liar (pungli) pada unit layanan ini'],
        ['group' => Question::GROUP_ANTI_CORRUPTION, 'text' => 'Tidak ada percaloan/perantara tidak resmi pada unit layanan ini'],
    ];

    public function run(): void
    {
        foreach (self::QUESTIONS as $index => $question) {
            Question::create([
                'group' => $question['group'],
                'text' => $question['text'],
                'order' => $index + 1,
                'is_active' => true,
            ]);
        }
    }
}
