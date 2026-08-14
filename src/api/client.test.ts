describe('api client baseURL', () => {
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...ORIGINAL_ENV };
    });

    afterAll(() => {
        process.env = ORIGINAL_ENV;
    });

    it('REACT_APP_API_BASE_URL이 설정되면 그 값을 baseURL로 사용한다', () => {
        process.env.REACT_APP_API_BASE_URL = 'https://api.studytracker.cloud';
        const client = require('./client').default;
        expect(client.defaults.baseURL).toBe('https://api.studytracker.cloud');
    });

    it('REACT_APP_API_BASE_URL이 없으면 localhost:8080으로 폴백한다', () => {
        delete process.env.REACT_APP_API_BASE_URL;
        const client = require('./client').default;
        expect(client.defaults.baseURL).toBe('http://localhost:8080');
    });
});

describe('api client 401 응답 인터셉터 - REFRESH 토큰 재시도', () => {
    const originalLocation = window.location;

    beforeEach(() => {
        jest.resetModules();
        localStorage.clear();
        // @ts-ignore - 테스트에서 location.href 대입을 관찰하기 위해 임시 교체
        delete window.location;
        // @ts-ignore
        window.location = { href: '' };
    });

    afterEach(() => {
        window.location = originalLocation;
    });

    const getRejectedHandler = (client: any) =>
        client.interceptors.response.handlers[0].rejected;

    it('401을 받으면 refreshToken으로 재발급받아 원 요청을 새 토큰으로 재시도한다', async () => {
        const client = require('./client').default;
        localStorage.setItem('refreshToken', 'refresh-abc');
        localStorage.setItem('accessToken', 'old-access');

        jest.spyOn(client, 'post').mockResolvedValue({
            data: { accessToken: 'new-access', refreshToken: 'refresh-abc', userId: 1, name: 'A' },
        });
        const requestSpy = jest.spyOn(client, 'request').mockResolvedValue({ data: 'ok' });

        const rejected = getRejectedHandler(client);
        const originalRequest: any = { url: '/api/stats/today', headers: {} };
        const error = { response: { status: 401 }, config: originalRequest };

        const result = await rejected(error);

        expect(client.post).toHaveBeenCalledWith('/api/auth/refresh', { refreshToken: 'refresh-abc' });
        expect(localStorage.getItem('accessToken')).toBe('new-access');
        expect(originalRequest.headers.Authorization).toBe('Bearer new-access');
        expect(requestSpy).toHaveBeenCalledWith(originalRequest);
        expect(result).toEqual({ data: 'ok' });
    });

    it('refresh 자체가 실패하면 로그아웃 처리(localStorage 초기화 + /login 이동)한다', async () => {
        const client = require('./client').default;
        localStorage.setItem('refreshToken', 'expired-refresh');
        localStorage.setItem('accessToken', 'old-access');

        jest.spyOn(client, 'post').mockRejectedValue({ response: { status: 401 } });

        const rejected = getRejectedHandler(client);
        const originalRequest: any = { url: '/api/stats/today', headers: {} };
        const error = { response: { status: 401 }, config: originalRequest };

        await expect(rejected(error)).rejects.toBeTruthy();

        expect(localStorage.getItem('accessToken')).toBeNull();
        expect(window.location.href).toBe('/login');
    });

    it('/api/auth/refresh 요청 자체의 401은 재시도하지 않고 바로 로그아웃한다', async () => {
        const client = require('./client').default;
        localStorage.setItem('accessToken', 'old-access');

        const rejected = getRejectedHandler(client);
        const originalRequest: any = { url: '/api/auth/refresh', headers: {} };
        const error = { response: { status: 401 }, config: originalRequest };

        await expect(rejected(error)).rejects.toBeTruthy();

        expect(localStorage.getItem('accessToken')).toBeNull();
        expect(window.location.href).toBe('/login');
    });
});
