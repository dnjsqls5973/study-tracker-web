import { parseServerDateTime } from './date';

describe('parseServerDateTime', () => {
    it('타임존 정보가 없는 문자열은 UTC로 해석한다', () => {
        const result = parseServerDateTime('2026-08-09T07:58:23');
        expect(result.toISOString()).toBe('2026-08-09T07:58:23.000Z');
    });

    it('이미 Z가 붙어있는 문자열은 그대로 UTC로 파싱한다', () => {
        const result = parseServerDateTime('2026-08-09T07:58:23Z');
        expect(result.toISOString()).toBe('2026-08-09T07:58:23.000Z');
    });

    it('오프셋이 붙어있는 문자열은 오프셋 기준으로 파싱한다', () => {
        const result = parseServerDateTime('2026-08-09T16:58:23+09:00');
        expect(result.toISOString()).toBe('2026-08-09T07:58:23.000Z');
    });
});
