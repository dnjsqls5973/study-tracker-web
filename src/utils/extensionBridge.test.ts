import { notifyExtensionOfLogin, EXTENSION_ID } from './extensionBridge';

describe('notifyExtensionOfLogin', () => {
    afterEach(() => {
        delete (window as any).chrome;
    });

    it('확장 프로그램이 설치돼 있으면 WEB_LOGIN 메시지로 accessToken을 전달한다', () => {
        const sendMessage = jest.fn();
        (window as any).chrome = { runtime: { sendMessage } };

        notifyExtensionOfLogin('test-access-token');

        expect(sendMessage).toHaveBeenCalledWith(
            EXTENSION_ID,
            { type: 'WEB_LOGIN', accessToken: 'test-access-token' },
            expect.any(Function)
        );
    });

    it('확장 프로그램이 설치돼 있지 않으면 아무 것도 하지 않는다', () => {
        expect(() => notifyExtensionOfLogin('test-access-token')).not.toThrow();
    });

    it('메시지 전송 중 예외가 나도 조용히 무시한다', () => {
        (window as any).chrome = {
            runtime: {
                sendMessage: () => {
                    throw new Error('확장 프로그램을 찾을 수 없음');
                },
            },
        };

        expect(() => notifyExtensionOfLogin('test-access-token')).not.toThrow();
    });
});
