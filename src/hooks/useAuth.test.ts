import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import * as authApi from '../api/auth';

jest.mock('../api/auth');

describe('useAuth.handleGoogleLogin', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    it('로그인 성공 시 토큰을 저장하고 true를 반환한다', async () => {
        (authApi.loginWithGoogle as jest.Mock).mockResolvedValue({
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            userId: 1,
            name: '테스트유저',
        });

        const { result } = renderHook(() => useAuth());

        let success = false;
        await act(async () => {
            success = await result.current.handleGoogleLogin('google-id-token');
        });

        expect(success).toBe(true);
        expect(localStorage.getItem('accessToken')).toBe('access-token');
        expect(localStorage.getItem('userName')).toBe('테스트유저');
    });

    it('로그인 실패 시 false를 반환하고 에러 메시지를 설정한다', async () => {
        (authApi.loginWithGoogle as jest.Mock).mockRejectedValue({
            response: { data: { message: 'Google 로그인 실패' } },
        });

        const { result } = renderHook(() => useAuth());

        let success = true;
        await act(async () => {
            success = await result.current.handleGoogleLogin('bad-token');
        });

        expect(success).toBe(false);
        expect(result.current.error).toBe('Google 로그인 실패');
    });
});
