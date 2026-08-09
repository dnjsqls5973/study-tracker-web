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
