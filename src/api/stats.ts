import client from './client';
import { TodaySummary, DailyStat, Session, CalendarData, NoteDailySummary } from '../types';

export const getTodaySummary = async (): Promise<TodaySummary> => {
    const response = await client.get('/api/stats/today');
    return response.data;
};

export const getSessions = async (date: string): Promise<Session[]> => {
    const response = await client.get('/api/stats/sessions', { params: { date } });
    return response.data;
};

export const getWeeklyStats = async (startDate: string): Promise<DailyStat[]> => {
    const response = await client.get('/api/stats/weekly', { params: { startDate } });
    return response.data;
};

export const getMonthlyStats = async (year: number, month: number): Promise<DailyStat[]> => {
    const response = await client.get('/api/stats/monthly', { params: { year, month } });
    return response.data;
};

export const getCalendar = async (year: number, month: number): Promise<CalendarData> => {
    const response = await client.get('/api/stats/calendar', { params: { year, month } });
    return response.data;
};

export const getWeeklyNotes = async (startDate: string): Promise<NoteDailySummary[]> => {
    const response = await client.get('/api/stats/weekly-notes', { params: { startDate } });
    return response.data;
};

export const getMonthlyNotes = async (year: number, month: number): Promise<NoteDailySummary[]> => {
    const response = await client.get('/api/stats/monthly-notes', { params: { year, month } });
    return response.data;
};