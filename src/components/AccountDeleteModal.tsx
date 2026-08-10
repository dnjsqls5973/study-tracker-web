import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteAccount } from '../api/user';
import { color, radius, shadow } from '../theme';

interface Props {
    onCancel: () => void;
}

const AccountDeleteModal = ({ onCancel }: Props) => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const submittingRef = useRef(submitting);
    submittingRef.current = submitting;

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !submittingRef.current) onCancel();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleConfirm = async () => {
        setSubmitting(true);
        setError('');
        try {
            await deleteAccount();
            localStorage.clear();
            navigate('/login');
        } catch (e: any) {
            setError(e.response?.data?.message || '계정 삭제에 실패했어요. 잠시 후 다시 시도해주세요.');
            setSubmitting(false);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h3 style={styles.title}>계정을 삭제할까요?</h3>
                <p style={styles.desc}>
                    계정과 모든 학습 기록, 세션, 분류 규칙이 즉시 삭제되며 되돌릴 수 없어요.
                </p>

                {error && <p style={styles.error}>{error}</p>}

                <div style={styles.footerRow}>
                    <button style={styles.cancelBtn} onClick={onCancel} disabled={submitting}>
                        취소
                    </button>
                    <button style={styles.confirmBtn} onClick={handleConfirm} disabled={submitting}>
                        {submitting ? '삭제 중...' : '삭제'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(28,27,24,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, padding: '16px',
    },
    modal: {
        background: color.surface, borderRadius: radius.lg, padding: '24px',
        width: '100%', maxWidth: '400px',
        boxShadow: shadow.float,
    },
    title: { margin: '0 0 8px', fontSize: '17px', fontWeight: 700, color: color.ink },
    desc: { margin: 0, fontSize: '13px', lineHeight: 1.6, color: color.inkSecondary },
    error: { color: color.distract, fontSize: '13px', margin: '12px 0 0' },
    footerRow: { display: 'flex', gap: '8px', marginTop: '20px' },
    cancelBtn: {
        flex: 1, padding: '12px', background: color.surfaceMuted, color: color.inkSecondary,
        border: 'none', borderRadius: radius.md, fontSize: '14px', cursor: 'pointer',
    },
    confirmBtn: {
        flex: 1, padding: '12px', background: color.distract, color: color.onAccent,
        border: 'none', borderRadius: radius.md, fontSize: '14px', fontWeight: 700, cursor: 'pointer',
    },
};

export default AccountDeleteModal;
