<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('period_id')->constrained();
            $table->foreignId('service_unit_id')->constrained();
            $table->foreignId('occupation_id')->constrained();
            $table->string('name')->nullable();
            $table->enum('gender', ['L', 'P']);
            $table->string('city')->default('Palembang');
            $table->text('need');
            $table->text('comment')->nullable();
            $table->string('follow_up_status')->default('pending'); // pending | done
            $table->text('follow_up_note')->nullable();
            $table->string('ip_hash')->nullable()->index();
            $table->string('user_agent')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['period_id', 'service_unit_id']);
            $table->index(['period_id', 'submitted_at']);
            $table->index('submitted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('responses');
    }
};
