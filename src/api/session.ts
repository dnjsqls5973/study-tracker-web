// src/api/session.ts
import client from './client';
import { Session, LogNote } from '../types';

export const startSession = async (
    studyType: string, targetSec?: number
): Promise<Session> => {
    const response = await client.post('/api/sessions', { studyType, targetSec });
    return response.data;
};

export const endSession = async (sessionId: number): Promise<Session> => {
    const response = await client.patch(`/api/sessions/${sessionId}/end`);
    return response.data;
};

export const pauseSession = async (sessionId: number): Promise<Session> => {
    const response = await client.patch(`/api/sessions/${sessionId}/pause`);
    return response.data;
};

export const resumeSession = async (
    sessionId: number, pausedSec: number
): Promise<Session> => {
    const response = await client.patch(
        `/api/sessions/${sessionId}/resume`,
        null,
        { params: { pausedSec } }
    );
    return response.data;
};

export const extendSession = async (
    sessionId: number, additionalSec: number
): Promise<Session> => {
    const response = await client.patch(
        `/api/sessions/${sessionId}/extend`,
        { additionalSec }
    );
    return response.data;
};

export const getActiveSession = async (): Promise<Session> => {
    const response = await client.get('/api/sessions/active');
    return response.data;
};

export const getSessionNotes = async (sessionId: number): Promise<LogNote[]> => {
    const response = await client.get(`/api/sessions/${sessionId}/notes`);
    return response.data;
};

export const getLogSummary = async (sessionId: number) => {
    const response = await client.get(`/api/sessions/${sessionId}/log-summary`);
    return response.data;
};

export const finalizeSession = async (sessionId: number, notes: {
    logType: string;
    logValue: string;
    category: string;
    memo: string | null;
}[]) => {
    const response = await client.post(`/api/sessions/${sessionId}/finalize`, { notes });
    return response.data;
};