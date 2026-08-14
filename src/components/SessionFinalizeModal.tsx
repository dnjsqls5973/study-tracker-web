import { useState, useEffect } from 'react';
import { LogSummaryItem, LogNoteItem } from '../types';
import { getLogSummary, finalizeSession } from '../api/session';
import { color, radius, shadow } from '../theme';
import { Monitor, Globe, X } from 'lucide-react';

interface Props {
    sessionId: number;
    onComplete: () => void;
    onCancel: () => void;
}

const formatTime = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m > 0) return `${m}분 ${s}초`;
    return `${s}초`;
};

const categoryLabel: { [key: string]: string } = {
    STUDY: '공부',
    DISTRACT: '딴짓',
    NEUTRAL: '중립',
};

const categoryStyle: { [key: string]: React.CSSProperties } = {
    STUDY: { background: color.accent, color: color.onAccent },
    DISTRACT: { background: color.distract, color: color.onAccent },
    NEUTRAL: { background: color.neutral, color: color.onAccent },
};

const SessionFinalizeModal = ({ sessionId, onComplete, onCancel }: Props) => {
    const [items, setItems] = useState<LogSummaryItem[]>([]);
    const [notes, setNotes] = useState<LogNoteItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchLogSummary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchLogSummary = async () => {
        try {
            const data = await getLogSummary(sessionId);
            setItems(data);
            setNotes(data.map((item: LogSummaryItem) => ({
                logType: item.logType,
                logValue: item.logValue,
                category: item.category,
                memo: null,
            })));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const updateCategory = (index: number, category: string) => {
        setNotes(prev => prev.map((n, i) =>
            i === index ? { ...n, category, memo: category !== 'STUDY' ? null : n.memo } : n
        ));
    };

    const updateMemo = (index: number, memo: string) => {
        setNotes(prev => prev.map((n, i) =>
            i === index ? { ...n, memo } : n
        ));
    };

    const isValid = notes.every(n => {
        if (n.category === 'STUDY') {
            return n.memo && n.memo.trim().length >= 5;
        }
        return true;
    });

    const handleSubmit = async () => {
        if (!isValid) return;
        setSubmitting(true);
        setError('');
        try {
            await finalizeSession(sessionId, notes);
            onComplete();
        } catch (e: any) {
            setError(e.response?.data?.message || '저장 실패');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.overlay}>
                <div style={styles.modal}>
                    <p style={{ textAlign: 'center', color: color.inkTertiary }}>로딩 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <div>
                        <h3 style={styles.title}>세션 완료</h3>
                        <p style={styles.subtitle}>각 앱/사이트를 어떻게 사용했는지 선택해주세요.</p>
                    </div>
                    <button style={styles.closeBtn} onClick={onCancel} aria-label="나중에 입력하기">
                        <X size={18} strokeWidth={1.75} />
                    </button>
                </div>

                <div style={styles.list}>
                    {items.map((item, i) => (
                        <div key={i} style={styles.item}>
                            <div style={styles.itemHeader}>
                                <span style={styles.itemIcon}>
                                    {item.logType === 'APP'
                                        ? <Monitor size={15} strokeWidth={1.75} color={color.inkTertiary} />
                                        : <Globe size={15} strokeWidth={1.75} color={color.inkTertiary} />}
                                </span>
                                <span style={styles.itemValue}>{item.logValue}</span>
                                <span style={styles.itemTime}>{formatTime(item.totalSec)}</span>
                            </div>

                            <div style={styles.categoryRow}>
                                {(['STUDY', 'DISTRACT', 'NEUTRAL'] as const).map(cat => (
                                    <button
                                        key={cat}
                                        style={{
                                            ...styles.categoryBtn,
                                            ...(notes[i]?.category === cat
                                                ? categoryStyle[cat]
                                                : { background: color.surfaceMuted, color: color.inkSecondary })
                                        }}
                                        onClick={() => updateCategory(i, cat)}
                                    >
                                        {categoryLabel[cat]}
                                    </button>
                                ))}
                            </div>

                            {notes[i]?.category === 'STUDY' && (
                                <div style={styles.memoWrapper}>
                                    <input
                                        style={{
                                            ...styles.memoInput,
                                            borderColor: notes[i]?.memo && notes[i].memo!.trim().length >= 5
                                                ? color.accent : color.border
                                        }}
                                        placeholder="어떤 공부를 했나요? (5자 이상)"
                                        value={notes[i]?.memo || ''}
                                        onChange={e => updateMemo(i, e.target.value)}
                                    />
                                    {notes[i]?.memo && notes[i].memo!.trim().length < 5 && (
                                        <p style={styles.memoError}>
                                            5자 이상 입력해주세요 ({notes[i].memo!.trim().length}/5)
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {error && <p style={styles.error}>{error}</p>}

                <div style={styles.footerRow}>
                    <button style={styles.laterBtn} onClick={onCancel}>
                        나중에 입력
                    </button>
                    <button
                        style={{
                            ...styles.submitBtn,
                            opacity: isValid ? 1 : 0.4,
                            cursor: isValid ? 'pointer' : 'not-allowed',
                        }}
                        onClick={handleSubmit}
                        disabled={!isValid || submitting}
                    >
                        {submitting ? '저장 중...' : '완료'}
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
        width: '100%', maxWidth: '480px',
        maxHeight: '80vh', overflowY: 'auto',
        boxShadow: shadow.float,
    },
    header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '20px' },
    title: { margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: color.ink },
    subtitle: { margin: 0, fontSize: '13px', color: color.inkTertiary },
    closeBtn: {
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        width: '28px', height: '28px', border: 'none', borderRadius: radius.sm,
        background: color.surfaceMuted, color: color.inkSecondary, cursor: 'pointer',
    },
    list: { display: 'flex', flexDirection: 'column', gap: '16px' },
    item: {
        background: color.surfaceMuted, borderRadius: radius.md, padding: '12px',
    },
    itemHeader: {
        display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px',
    },
    itemIcon: { display: 'flex', alignItems: 'center' },
    itemValue: { flex: 1, fontSize: '14px', fontWeight: 600, color: color.ink },
    itemTime: { fontSize: '13px', color: color.inkTertiary },
    categoryRow: { display: 'flex', gap: '6px', marginBottom: '8px' },
    categoryBtn: {
        flex: 1, padding: '7px', border: 'none', borderRadius: radius.sm,
        cursor: 'pointer', fontSize: '13px', fontWeight: 600,
        transition: 'background 0.15s, color 0.15s',
    },
    memoWrapper: { marginTop: '6px' },
    memoInput: {
        width: '100%', padding: '8px 10px',
        border: '1.5px solid', borderRadius: radius.sm,
        fontSize: '13px', boxSizing: 'border-box',
        outline: 'none', background: color.surface, color: color.ink,
    },
    memoError: { margin: '4px 0 0', fontSize: '11px', color: color.distract },
    error: { color: color.distract, fontSize: '13px', margin: '12px 0 0' },
    footerRow: { display: 'flex', gap: '8px', marginTop: '20px' },
    laterBtn: {
        padding: '14px 16px', background: color.surfaceMuted, color: color.inkSecondary,
        border: 'none', borderRadius: radius.md, fontSize: '14px', cursor: 'pointer',
    },
    submitBtn: {
        flex: 1, padding: '14px',
        background: color.accent, color: color.onAccent,
        border: 'none', borderRadius: radius.md,
        fontSize: '15px', fontWeight: 700,
    },
};

export default SessionFinalizeModal;
