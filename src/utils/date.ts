const HAS_TIMEZONE = /Z$|[+-]\d{2}:\d{2}$/;

// 백엔드가 LocalDateTime.now()(서버가 UTC라 UTC 시각)를 타임존 표시 없이 내려주므로,
// 명시적 오프셋이 없으면 UTC로 간주해서 파싱한다.
export const parseServerDateTime = (dateTimeStr: string): Date => {
    return new Date(HAS_TIMEZONE.test(dateTimeStr) ? dateTimeStr : `${dateTimeStr}Z`);
};
