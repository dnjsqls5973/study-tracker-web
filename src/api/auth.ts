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

// REFRESH 토큰으로 새 ACCESS 토큰을 받는 로직은 api/client.ts의 401 응답 인터셉터
// 안에서 자체적으로 처리한다 (client.ts <-> auth.ts 순환 import를 피하기 위함).
// 컴포넌트에서 직접 refresh를 트리거할 일은 없어서 여기 별도로 노출하지 않음.
