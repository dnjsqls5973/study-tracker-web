// src/hooks/useAuth.ts
import { useState } from 'react';
import { login, register } from '../api/auth';
import { TokenResponse } from '../types';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isLoggedIn = (): boolean => {
        return !!localStorage.getItem('accessToken');
    };

    const handleLogin = async (email: string, password: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            const data: TokenResponse = await login(email, password);
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('userId', String(data.userId));
            localStorage.setItem('userName', data.name);
            return true;
        } catch (e: any) {
            setError(e.response?.data?.message || '로그인에 실패했습니다.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (
        email: string, name: string, password: string
    ): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            const data: TokenResponse = await register(email, name, password);
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('userId', String(data.userId));
            localStorage.setItem('userName', data.name);
            return true;
        } catch (e: any) {
            setError(e.response?.data?.message || '회원가입에 실패했습니다.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return { isLoggedIn, handleLogin, handleRegister, handleLogout, loading, error };
};