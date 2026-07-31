// src/api/auth.ts
import client from './client';
import { TokenResponse, DeviceTokenResponse } from '../types';

export const loginWithGoogle = async (idToken: string): Promise<TokenResponse> => {
    const response = await client.post('/api/auth/google', { idToken });
    return response.data;
};

export const registerDevice = async (
    deviceName: string, deviceType: string
): Promise<DeviceTokenResponse> => {
    const response = await client.post('/api/auth/device', { deviceName, deviceType });
    return response.data;
};
