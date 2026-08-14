import client from './client';
import { UserMe } from '../types';

export const getMe = async (): Promise<UserMe> => {
    const response = await client.get('/api/users/me');
    return response.data;
};

export const updateDayChangeHour = async (dayChangeHour: number): Promise<void> => {
    await client.patch('/api/users/me/day-change-hour', { dayChangeHour });
};

export const deleteAccount = async (): Promise<void> => {
    await client.delete('/api/users/me');
};
