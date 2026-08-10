// src/hooks/useAuth.ts
import { useState } from 'react';
import { loginWithGoogle } from '../api/auth';
import { TokenResponse } from '../types';
import { notifyExtensionOfLogin } from '../utils/extensionBridge';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isLoggedIn = (): boolean => {
        return !!localStorage.getItem('accessToken');
    };

    const handleGoogleLogin = async (idToken: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            const data: TokenResponse = await loginWithGoogle(idToken);
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('userId', String(data.userId));
            localStorage.setItem('userName', data.name);
            notifyExtensionOfLogin(data.accessToken);
            return true;
        } catch (e: any) {
            setError(e.response?.data?.message || 'Google 로그인에 실패했습니다.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return { isLoggedIn, handleGoogleLogin, handleLogout, loading, error };
};
