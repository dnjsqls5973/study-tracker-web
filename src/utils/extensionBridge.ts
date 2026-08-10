export const EXTENSION_ID = 'ggmeldiabekaddjjbcfacgghfpcjcolk';

// Chrome 확장 프로그램(Study Tracker)에 로그인 상태를 알려서, 확장 프로그램이
// 자체 로그인 절차 없이 이 accessToken으로 기기 등록까지 자동으로 마치게 한다.
// 확장 프로그램이 설치돼 있지 않은 사용자가 대다수이므로 실패는 항상 조용히 무시한다.
export const notifyExtensionOfLogin = (accessToken: string): void => {
    const chromeRuntime = (window as any).chrome?.runtime;
    if (!chromeRuntime?.sendMessage) return;

    try {
        chromeRuntime.sendMessage(EXTENSION_ID, { type: 'WEB_LOGIN', accessToken }, () => {
            void chromeRuntime.lastError;
        });
    } catch {
        // 확장 프로그램 미설치/비활성화 등 — 무시
    }
};
