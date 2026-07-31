// src/pages/LoginPage.tsx
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { color } from '../theme';
import { BookOpen } from 'lucide-react';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID as string;

const LoginPage = () => {
    const { handleGoogleLogin, error } = useAuth();
    const navigate = useNavigate();
    const buttonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!window.google || !buttonRef.current) return;

        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response) => {
                const success = await handleGoogleLogin(response.credential);
                if (success) navigate('/');
            },
        });
        window.google.accounts.id.renderButton(buttonRef.current, { theme: 'outline', size: 'large' });
    }, [handleGoogleLogin, navigate]);

    return (
        <div className="login-shell" style={styles.shell}>
            <div className="login-brand" style={styles.brandPanel}>
                <div style={styles.brandInner}>
                    <div style={styles.brandMark}>
                        <BookOpen size={22} strokeWidth={1.75} color={color.onAccent} />
                        <span style={styles.brandMarkText}>Study Tracker</span>
                    </div>
                    <p style={styles.brandHeadline}>
                        오늘 무엇에<br />집중했는지 기록하세요.
                    </p>
                    <p style={styles.brandSub}>
                        PC와 브라우저 사용 기록을 자동으로 모아 순공 시간과 딴짓을 정리해드려요.
                    </p>
                </div>
            </div>

            <div style={styles.formPanel}>
                <div style={styles.card}>
                    <p style={styles.eyebrowMobile}>
                        <BookOpen size={18} strokeWidth={1.75} color={color.accent} />
                        Study Tracker
                    </p>
                    <h1 style={styles.title}>다시 오셨네요</h1>
                    <p style={styles.subtitle}>Google 계정으로 로그인해주세요.</p>

                    <div ref={buttonRef} />
                    {error && <p style={styles.error}>{error}</p>}
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    shell: { background: color.page },
    brandPanel: {
        flex: '0 0 42%', background: color.accent, color: color.onAccent,
        alignItems: 'center', justifyContent: 'center', padding: '48px',
    },
    brandInner: { maxWidth: '360px' },
    brandMark: { display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '40px' },
    brandMarkText: { fontSize: '16px', fontWeight: 700, letterSpacing: '-0.01em' },
    brandHeadline: {
        fontSize: '30px', fontWeight: 700, lineHeight: 1.35, letterSpacing: '-0.01em',
        margin: '0 0 16px', color: color.onAccent,
    },
    brandSub: { fontSize: '14px', lineHeight: 1.6, opacity: 0.82, margin: 0 },

    formPanel: {
        flex: 1, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
    },
    card: { width: '360px', maxWidth: '100%' },
    eyebrowMobile: {
        display: 'flex', alignItems: 'center', gap: '7px',
        fontSize: '13px', fontWeight: 700, color: color.accent, margin: '0 0 20px',
    },
    title: { margin: '0 0 6px', fontSize: '24px', fontWeight: 700, color: color.ink, letterSpacing: '-0.01em' },
    subtitle: { margin: '0 0 24px', color: color.inkSecondary, fontSize: '14px' },
    error: { color: color.distract, fontSize: '13px', marginTop: '12px' },
};

export default LoginPage;
