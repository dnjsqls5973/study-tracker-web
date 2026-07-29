// src/api/auth.ts
import client from './client';
import { TokenResponse, DeviceTokenResponse } from '../types';

export const login = async (email: string, password: string): Promise<TokenResponse> => {
    const response = await client.post('/api/auth/login', { email, password });
    return response.data;
};

export const register = async (
    email: string, name: string, password: string
): Promise<TokenResponse> => {
    const response = await client.post('/api/auth/register', { email, name, password });
    return response.data;
};

export const registerDevice = async (
    deviceName: string, deviceType: string
): Promise<DeviceTokenResponse> => {
    const response = await client.post('/api/auth/device', { deviceName, deviceType });
    return response.data;
};