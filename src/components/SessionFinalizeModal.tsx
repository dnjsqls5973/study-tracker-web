import { useState, useEffect } from 'react';
import { LogSummaryItem, LogNoteItem } from '../types';
import { getLogSummary, finalizeSession } from '../api/session';

interface Props {
    sessionId: number;
    onComplete: () => void;
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

const categoryColor: { [key: string]: React.CSSProperties } = {
    STUDY: { background: '#1976d2', color: 'white' },
    DISTRACT: { background: '#e53935', color: 'white' },
    NEUTRAL: { background: '#9e9e9e', color: 'white' },
};

const SessionFinalizeModal = ({ sessionId, onComplete }: Props) => {
    const [items, setItems] = useState<LogSummaryItem[]>([]);
    const [notes, setNotes] = useState<LogNoteItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchLogSummary();
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

    // 완료 버튼 활성화 조건
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
                    <p style={{ textAlign: 'center', color: '#666' }}>로딩 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h3 style={styles.title}>세션 완료</h3>
                <p style={styles.subtitle}>
                    각 앱/사이트를 어떻게 사용했는지 선택해주세요.
                </p>

                <div style={styles.list}>
                    {items.map((item, i) => (
                        <div key={i} style={styles.item}>
                            <div style={styles.itemHeader}>
                                <span style={styles.itemIcon}>
                                    {item.logType === 'APP' ? '💻' : '🌐'}
                                </span>
                                <span style={styles.itemValue}>{item.logValue}</span>
                                <span style={styles.itemTime}>
                                    {formatTime(item.totalSec)}
                                </span>
                            </div>

                            {/* 카테고리 선택 버튼 */}
                            <div style={styles.categoryRow}>
                                {(['STUDY', 'DISTRACT', 'NEUTRAL'] as const).map(cat => (
                                    <button
                                        key={cat}
                                        style={{
                                            ...styles.categoryBtn,
                                            ...(notes[i]?.category === cat
                                                ? categoryColor[cat]
                                                : { background: '#f5f5f5', color: '#666' })
                                        }}
                                        onClick={() => updateCategory(i, cat)}
                                    >
                                        {categoryLabel[cat]}
                                    </button>
                                ))}
                            </div>

                            {/* 메모 입력 (공부일 때만) */}
                            {notes[i]?.category === 'STUDY' && (
                                <div style={styles.memoWrapper}>
                                    <input
                                        style={{
                                            ...styles.memoInput,
                                            borderColor: notes[i]?.memo && notes[i].memo!.trim().length >= 5
                                                ? '#1976d2' : '#ddd'
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
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, padding: '16px',
    },
    modal: {
        background: 'white', borderRadius: '16px', padding: '24px',
        width: '100%', maxWidth: '480px',
        maxHeight: '80vh', overflowY: 'auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    },
    title: { margin: '0 0 4px', fontSize: '18px', fontWeight: 'bold' },
    subtitle: { margin: '0 0 20px', fontSize: '13px', color: '#888' },
    list: { display: 'flex', flexDirection: 'column', gap: '16px' },
    item: {
        background: '#f9f9f9', borderRadius: '10px', padding: '12px',
    },
    itemHeader: {
        display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px',
    },
    itemIcon: { fontSize: '16px' },
    itemValue: { flex: 1, fontSize: '14px', fontWeight: 'bold' },
    itemTime: { fontSize: '13px', color: '#888' },
    categoryRow: { display: 'flex', gap: '6px', marginBottom: '8px' },
    categoryBtn: {
        flex: 1, padding: '7px', border: 'none', borderRadius: '6px',
        cursor: 'pointer', fontSize: '13px', fontWeight: 'bold',
        transition: 'all 0.15s',
    },
    memoWrapper: { marginTop: '6px' },
    memoInput: {
        width: '100%', padding: '8px 10px',
        border: '1.5px solid #ddd', borderRadius: '6px',
        fontSize: '13px', boxSizing: 'border-box',
        outline: 'none',
    },
    memoError: { margin: '4px 0 0', fontSize: '11px', color: '#e53935' },
    error: { color: '#e53935', fontSize: '13px', margin: '12px 0 0' },
    submitBtn: {
        width: '100%', padding: '14px', marginTop: '20px',
        background: '#1976d2', color: 'white',
        border: 'none', borderRadius: '10px',
        fontSize: '15px', fontWeight: 'bold',
    },
};

export default SessionFinalizeModal;