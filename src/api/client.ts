import axios from 'axios';

const client = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
};

// ACCESS 토큰 만료(401) 시 REFRESH 토큰으로 재발급을 시도한다.
// 동시에 여러 요청이 401을 받아도 refresh 호출은 한 번만 나가도록 in-flight promise를 공유한다.
let refreshPromise: Promise<string> | null = null;
const retriedRequests = new WeakSet<object>();

const refreshAccessToken = async (): Promise<string> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        throw new Error('저장된 refresh 토큰이 없습니다.');
    }
    const response = await client.post('/api/auth/refresh', { refreshToken });
    const newAccessToken = response.data.accessToken;
    localStorage.setItem('accessToken', newAccessToken);
    return newAccessToken;
};

client.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const isAuthEndpoint: boolean = originalRequest?.url?.includes('/api/auth/');

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !isAuthEndpoint &&
            !retriedRequests.has(originalRequest)
        ) {
            retriedRequests.add(originalRequest);
            try {
                if (!refreshPromise) {
                    refreshPromise = refreshAccessToken().finally(() => {
                        refreshPromise = null;
                    });
                }
                const newAccessToken = await refreshPromise;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return client.request(originalRequest);
            } catch (refreshError) {
                logout();
                return Promise.reject(refreshError);
            }
        }

        if (error.response?.status === 401) {
            logout();
        }
        return Promise.reject(error);
    }
);

export default client;