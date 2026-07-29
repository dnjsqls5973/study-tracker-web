// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

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
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>📚 Study Tracker</h1>
                <p style={styles.subtitle}>
                    {isRegister ? '회원가입' : '로그인'}
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
                    </button>
                </form>

                <button
                    style={styles.toggle}
                    onClick={() => setIsRegister(!isRegister)}
                >
                    {isRegister ? '이미 계정이 있어요' : '계정이 없어요'}
                </button>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
    },
    card: {
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        width: '360px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
    },
    title: {
        margin: '0 0 4px',
        fontSize: '24px',
        textAlign: 'center',
    },
    subtitle: {
        margin: '0 0 24px',
        color: '#666',
        textAlign: 'center',
        fontSize: '14px',
    },
    input: {
        width: '100%',
        padding: '12px',
        marginBottom: '12px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '14px',
        boxSizing: 'border-box',
    },
    button: {
        width: '100%',
        padding: '12px',
        background: '#1976d2',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        cursor: 'pointer',
        marginTop: '4px',
    },
    toggle: {
        width: '100%',
        padding: '8px',
        background: 'none',
        border: 'none',
        color: '#1976d2',
        cursor: 'pointer',
        marginTop: '12px',
        fontSize: '13px',
    },
    error: {
        color: '#e53935',
        fontSize: '13px',
        marginBottom: '8px',
    },
};

export default LoginPage;