// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { color, radius } from '../theme';
import { BookOpen, ArrowRight } from 'lucide-react';

const LoginPage = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const { handleLogin, handleRegister, loading, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let success = false;
        if (isRegister) {
            success = await handleRegister(email, name, password);
        } else {
            success = await handleLogin(email, password);
        }
        if (success) navigate('/');
    };

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
                    <h1 style={styles.title}>{isRegister ? '계정 만들기' : '다시 오셨네요'}</h1>
                    <p style={styles.subtitle}>
                        {isRegister ? '몇 가지만 입력하면 바로 시작할 수 있어요.' : '이메일로 로그인해주세요.'}
                    </p>

                    <form onSubmit={handleSubmit}>
                        <input
                            style={styles.input}
                            type="email"
                            placeholder="이메일"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                        {isRegister && (
                            <input
                                style={styles.input}
                                type="text"
                                placeholder="이름"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        )}
                        <input
                            style={styles.input}
                            type="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                        {error && <p style={styles.error}>{error}</p>}
                        <button style={styles.button} type="submit" disabled={loading}>
                            {loading ? '처리 중...' : isRegister ? '가입하기' : '로그인'}
                            {!loading && <ArrowRight size={16} strokeWidth={2} />}
                        </button>
                    </form>

                    <button style={styles.toggle} onClick={() => setIsRegister(!isRegister)}>
                        {isRegister ? '이미 계정이 있어요' : '계정이 없어요'}
                    </button>
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
    input: {
        width: '100%', padding: '12px 14px', marginBottom: '10px',
        border: `1px solid ${color.border}`, borderRadius: radius.sm,
        fontSize: '14px', boxSizing: 'border-box', color: color.ink, background: color.surface,
    },
    button: {
        width: '100%', padding: '13px', background: color.accent, color: color.onAccent,
        border: 'none', borderRadius: radius.sm, fontSize: '15px', fontWeight: 600,
        cursor: 'pointer', marginTop: '6px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    },
    toggle: {
        width: '100%', padding: '8px', background: 'none', border: 'none',
        color: color.accent, cursor: 'pointer', marginTop: '16px', fontSize: '13px', fontWeight: 500,
    },
    error: { color: color.distract, fontSize: '13px', marginBottom: '8px' },
};

export default LoginPage;
