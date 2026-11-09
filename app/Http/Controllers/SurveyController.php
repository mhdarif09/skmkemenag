<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSurveyResponseRequest;
use App\Models\Occupation;
use App\Models\Period;
use App\Models\Question;
use App\Models\Response;
use App\Models\ServiceUnit;
use App\Models\Setting;
use App\Services\IkmCalculator;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class SurveyController extends Controller
{
    public function index()
    {
        $showPublicIkm = Setting::getValue(Setting::SHOW_PUBLIC_IKM, '1') === '1';
        $ikm = null;
        $period = null;

        if ($showPublicIkm) {
            $period = Period::query()->where('is_active', true)->first();
            if ($period) {
                $ikm = (new IkmCalculator)->calculate($period->id);
            }
        }

        $renderer = new ImageRenderer(new RendererStyle(200), new SvgImageBackEnd());
        $writer = new Writer($renderer);
        $qrCode = $writer->writeString(route('survey.create'));

        return Inertia::render('survey/landing', [
            'organizationName' => Setting::getValue(Setting::ORGANIZATION_NAME, 'Kementerian Agama Kota Palembang'),
            'logoPath' => Setting::getValue(Setting::LOGO_PATH),
            'welcomeText' => Setting::getValue(Setting::WELCOME_TEXT),
            'showPublicIkm' => $showPublicIkm,
            'ikm' => $ikm,
            'period' => $period,
            'qrCode' => $qrCode,
        ]);
    }

    public function create()
    {
        $period = Period::query()->where('is_active', true)->firstOrFail();
        $anonymousMode = Setting::getValue(Setting::ANONYMOUS_MODE, '1') === '1';

        return Inertia::render('survey/wizard', [
            'period' => $period,
            'serviceUnits' => ServiceUnit::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'occupations' => Occupation::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'questions' => Question::query()->where('is_active', true)->orderBy('group')->orderBy('order')->get(['id', 'group', 'text', 'order']),
            'anonymousMode' => $anonymousMode,
            'organizationName' => Setting::getValue(Setting::ORGANIZATION_NAME, 'Kementerian Agama Kota Palembang'),
            'logoPath' => Setting::getValue(Setting::LOGO_PATH),
            'turnstileSiteKey' => config('services.turnstile.site_key'),
        ]);
    }

    public function store(StoreSurveyResponseRequest $request)
    {
        $data = $request->validated();

        // Honeypot already validated (website must be empty).

        // Cloudflare Turnstile (optional).
        $siteKey = config('services.turnstile.site_key');
        $secretKey = config('services.turnstile.secret_key');
        if ($siteKey && $secretKey) {
            $token = $data['turnstile_token'] ?? null;
            if (! $token) {
                return back()->withErrors(['turnstile_token' => 'Verifikasi keamanan wajib diisi.']);
            }

            $response = Http::asForm()->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                'secret' => $secretKey,
                'response' => $token,
                'remoteip' => $request->ip(),
            ]);

            if (! ($response->json('success') === true)) {
                return back()->withErrors(['turnstile_token' => 'Verifikasi keamanan gagal. Silakan coba lagi.']);
            }
        }

        // Duplicate detection: same name + service unit + need within 10 minutes.
        if (! empty($data['name'])) {
            $duplicate = Response::query()
                ->where('service_unit_id', $data['service_unit_id'])
                ->where('name', $data['name'])
                ->where('need', $data['need'])
                ->where('submitted_at', '>=', now()->subMinutes(10))
                ->exists();

            if ($duplicate) {
                return back()->withErrors(['duplicate' => 'Anda sudah mengirim survei yang sama dalam 10 menit terakhir. Terima kasih.']);
            }
        }

        $period = Period::query()->findOrFail($data['period_id']);

        $response = Response::create([
            'period_id' => $period->id,
            'service_unit_id' => $data['service_unit_id'],
            'occupation_id' => $data['occupation_id'],
            'name' => $data['name'] ?? null,
            'gender' => $data['gender'],
            'city' => $data['city'],
            'need' => $data['need'],
            'comment' => $data['comment'] ?? null,
            'follow_up_status' => Response::FOLLOW_UP_PENDING,
            'ip_hash' => hash('sha256', (string) $request->ip()),
            'user_agent' => $request->userAgent(),
            'submitted_at' => now(),
        ]);

        foreach ($data['answers'] as $answer) {
            $response->answers()->create([
                'question_id' => $answer['question_id'],
                'score' => $answer['score'],
            ]);
        }

        return redirect()->route('survey.thankyou');
    }

    public function thankYou()
    {
        return Inertia::render('survey/thankyou', [
            'organizationName' => Setting::getValue(Setting::ORGANIZATION_NAME, 'Kementerian Agama Kota Palembang'),
            'logoPath' => Setting::getValue(Setting::LOGO_PATH),
        ]);
    }
}
