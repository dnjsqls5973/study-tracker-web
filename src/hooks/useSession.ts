// src/hooks/useSession.ts
import { useState, useEffect, useRef } from 'react';
import { Session } from '../types';
import {
    startSession, endSession, pauseSession,
    resumeSession, extendSession, getActiveSession
} from '../api/session';
import { parseServerDateTime } from '../utils/date';

export const useSession = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [elapsedSec, setElapsedSec] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const pausedAccumRef = useRef(0);        // 누적 일시정지 시간(초)
    const pauseStartRef = useRef<Date | null>(null);
    const isPausedRef = useRef(false);        // 타이머 클로저용
    const startedAtRef = useRef<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startTimer = (startedAt: string) => {
        startedAtRef.current = startedAt;
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            if (isPausedRef.current || !startedAtRef.current) return;
            const total = Math.floor(
                (Date.now() - parseServerDateTime(startedAtRef.current).getTime()) / 1000
            );
            setElapsedSec(total - pausedAccumRef.current);
        }, 1000);
    };

    const fetchActiveSession = async () => {
        try {
            const data = await getActiveSession();
            setSession(data);
            pausedAccumRef.current = data.pauseSec || 0;
            startTimer(data.startedAt);
        } catch {
            setSession(null);
        }
    };

    useEffect(() => {
        fetchActiveSession();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleStart = async (studyType: string, targetSec?: number) => {
        setLoading(true);
        setError(null);
        try {
            const data = await startSession(studyType, targetSec);
            setSession(data);
            setElapsedSec(0);
            pausedAccumRef.current = 0;
            isPausedRef.current = false;
            setIsPaused(false);
            startTimer(data.startedAt);
        } catch (e: any) {
            setError(e.response?.data?.message || '세션 시작 실패');
        } finally {
            setLoading(false);
        }
    };

    const handleEnd = async () => {
        if (!session) return;
        setLoading(true);
        try {
            const data = await endSession(session.sessionId);
            setSession(data);
            if (timerRef.current) clearInterval(timerRef.current);
            // 상태 초기화
            isPausedRef.current = false;
            setIsPaused(false);
            pauseStartRef.current = null;
            pausedAccumRef.current = 0;
            setElapsedSec(0);
        } catch (e: any) {
            setError(e.response?.data?.message || '세션 종료 실패');
        } finally {
            setLoading(false);
        }
    };

    const handlePause = async () => {
        if (!session) return;
        try {
            await pauseSession(session.sessionId);
            isPausedRef.current = true;
            setIsPaused(true);
            pauseStartRef.current = new Date();
        } catch (e: any) {
            setError(e.response?.data?.message || '일시정지 실패');
        }
    };

    const handleResume = async () => {
        if (!session || !pauseStartRef.current) return;
        const pausedSec = Math.floor(
            (Date.now() - pauseStartRef.current.getTime()) / 1000
        );
        try {
            const data = await resumeSession(session.sessionId, pausedSec);
            setSession(data);
            pausedAccumRef.current += pausedSec;   // 일시정지 시간 누적
            isPausedRef.current = false;
            setIsPaused(false);
            pauseStartRef.current = null;
        } catch (e: any) {
            setError(e.response?.data?.message || '재개 실패');
        }
    };

    const handleExtend = async (additionalSec: number) => {
        if (!session) return;
        try {
            const data = await extendSession(session.sessionId, additionalSec);
            setSession(data);
        } catch (e: any) {
            setError(e.response?.data?.message || '연장 실패');
        }
    };

    return {
        session, loading, error, elapsedSec, isPaused,
        handleStart, handleEnd, handlePause, handleResume, handleExtend
    };
};