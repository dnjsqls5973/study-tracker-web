// src/theme.ts
// 차분한 생산성(calm productivity) 톤의 디자인 토큰.
// 색상은 반드시 이 팔레트에서만 가져다 쓴다 — 페이지별로 hex를 새로 짓지 않는다.

export const color = {
    // 배경
    page: '#F6F4EF',
    surface: '#FFFFFF',
    surfaceMuted: '#F0EEE8',
    sidebar: '#FBFAF7',

    // 테두리
    border: '#E7E2D8',
    borderStrong: '#D9D3C4',

    // 텍스트 (모두 흰 배경에서 4.5:1 이상)
    ink: '#1C1B18',
    inkSecondary: '#57534A',
    inkTertiary: '#726C60',
    onAccent: '#FFFFFF',

    // 액센트 — 공부/기본 동작
    accent: '#4B47B0',
    accentSoft: '#EDECF9',
    accentStrong: '#37337F',

    // 딴짓/경고 (차분한 테라코타)
    distract: '#B5573F',
    distractSoft: '#F7E9E4',

    // 중립 카테고리
    neutral: '#8C8676',
    neutralSoft: '#EFEDE6',

    // 긍정/재개
    positive: '#4C7A5D',
    positiveSoft: '#E7F0E9',
} as const;

export const radius = {
    sm: '8px',
    md: '12px',
    lg: '16px',
    pill: '999px',
} as const;

export const shadow = {
    // 카드는 기본적으로 테두리만 쓰고, 모달처럼 화면 위로 뜨는 요소에만 그림자를 준다.
    float: '0 8px 24px rgba(28, 27, 24, 0.10)',
    hairline: '0 1px 2px rgba(28, 27, 24, 0.04)',
} as const;

export const font = {
    display: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Pretendard", Roboto, sans-serif',
} as const;
