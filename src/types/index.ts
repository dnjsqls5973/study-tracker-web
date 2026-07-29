// src/types/index.ts

export interface Session {
    sessionId: number;
    studyType: string;
    startedAt: string;
    endedAt: string | null;
    targetSec: number | null;
    totalSec: number;
    studySec: number;
    distractSec: number;
    pauseSec: number;
    ended: boolean;
}

export interface TodaySummary {
    totalStudySec: number;
    totalDistractSec: number;
    sessionCount: number;
    topDistracts: DistractItem[];
}

export interface DistractItem {
    name: string;
    totalSec: number;
}

export interface DailyStat {
    date: string;
    totalStudySec: number;
    totalDistractSec: number;
    sessionCount: number;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    userId: number;
    name: string;
}

export interface DeviceTokenResponse {
    deviceToken: string;
    deviceId: number;
}

export interface LogSummaryItem {
    logType: string;    // APP / DOMAIN
    logValue: string;   // idea64.exe / youtube.com
    totalSec: number;
    category: string;   // 자동 분류 기본값
}

export interface LogNoteItem {
    logType: string;
    logValue: string;
    category: string;
    memo: string | null;
}