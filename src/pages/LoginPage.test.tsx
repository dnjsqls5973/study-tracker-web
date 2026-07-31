import { render, screen, act } from '@testing-library/react';
import LoginPage from './LoginPage';
import { useAuth } from '../hooks/useAuth';

const mockNavigate = jest.fn();

jest.mock('../hooks/useAuth');
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

describe('LoginPage - Google Identity Services 초기화', () => {
    const mockUseAuth = useAuth as jest.Mock;
    const originalGoogle = window.google;

    beforeEach(() => {
        jest.clearAllMocks();
        mockNavigate.mockClear();
        window.google = undefined;
        mockUseAuth.mockReturnValue({ handleGoogleLogin: jest.fn(), error: null });
    });

    afterEach(() => {
        window.google = originalGoogle;
        jest.useRealTimers();
    });

    it('handleGoogleLogin 참조가 리렌더마다 바뀌어도 Google 버튼은 한 번만 렌더링된다', () => {
        const initialize = jest.fn();
        const renderButton = jest.fn();
        window.google = { accounts: { id: { initialize, renderButton } } };

        const { rerender } = render(<LoginPage />);

        expect(initialize).toHaveBeenCalledTimes(1);
        expect(renderButton).toHaveBeenCalledTimes(1);

        // useAuth() returning a brand-new handleGoogleLogin reference simulates
        // the re-render that happens the instant a user clicks the button
        // (setLoading(true) fires synchronously before the await resolves).
        mockUseAuth.mockReturnValue({ handleGoogleLogin: jest.fn(), error: null });
        rerender(<LoginPage />);

        // The init effect must NOT re-run, or GIS would append a second button
        // into the same div instead of replacing the first one.
        expect(initialize).toHaveBeenCalledTimes(1);
        expect(renderButton).toHaveBeenCalledTimes(1);
    });

    it('마운트 시점에 window.google이 아직 없으면 폴링 후 로드되는 대로 버튼을 렌더링한다', () => {
        jest.useFakeTimers();
        render(<LoginPage />);

        act(() => {
            window.google = {
                accounts: { id: { initialize: jest.fn(), renderButton: jest.fn() } },
            };
            jest.advanceTimersByTime(200);
        });

        expect(window.google.accounts.id.initialize).toHaveBeenCalledTimes(1);
        expect(window.google.accounts.id.renderButton).toHaveBeenCalledTimes(1);
    });

    it('제한 시간 내에 window.google이 로드되지 않으면 안내 메시지를 보여준다', () => {
        jest.useFakeTimers();
        render(<LoginPage />);

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(
            screen.getByText('Google 로그인을 불러오지 못했어요. 새로고침해주세요.').textContent
        ).toBe('Google 로그인을 불러오지 못했어요. 새로고침해주세요.');
    });

    it('Google 자격 증명 콜백이 호출되면 로그인 처리 후 홈으로 이동한다', async () => {
        const handleGoogleLogin = jest.fn().mockResolvedValue(true);
        mockUseAuth.mockReturnValue({ handleGoogleLogin, error: null });

        const initialize = jest.fn();
        const renderButton = jest.fn();
        window.google = { accounts: { id: { initialize, renderButton } } };

        render(<LoginPage />);

        expect(initialize).toHaveBeenCalledTimes(1);
        const config = initialize.mock.calls[0][0];

        await act(async () => {
            await config.callback({ credential: 'fake-id-token' });
        });

        expect(handleGoogleLogin).toHaveBeenCalledWith('fake-id-token');
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('로그인 처리가 실패하면 홈으로 이동하지 않는다', async () => {
        const handleGoogleLogin = jest.fn().mockResolvedValue(false);
        mockUseAuth.mockReturnValue({ handleGoogleLogin, error: null });

        const initialize = jest.fn();
        const renderButton = jest.fn();
        window.google = { accounts: { id: { initialize, renderButton } } };

        render(<LoginPage />);

        const config = initialize.mock.calls[0][0];

        await act(async () => {
            await config.callback({ credential: 'fake-id-token' });
        });

        expect(handleGoogleLogin).toHaveBeenCalledWith('fake-id-token');
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
