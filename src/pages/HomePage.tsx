import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { getTodaySummary } from '../api/stats';
import { TodaySummary } from '../types';
import SessionFinalizeModal from '../components/SessionFinalizeModal';

const formatTime = (sec: number): string => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}시간 ${m}분`;
    if (m > 0) return `${m}분 ${s}초`;
    return `${s}초`;
};

const HomePage = () => {
    const navigate = useNavigate();
    const {
        session, loading, error, elapsedSec, isPaused,
        handleStart, handleEnd, handlePause, handleResume, handleExtend
    } = useSession();

    const [showFinalizeModal, setShowFinalizeModal] = useState(false);
    const [finalizedSessionId, setFinalizedSessionId] = useState<number | null>(null);

    const [summary, setSummary] = useState<TodaySummary | null>(null);
    const [showStartModal, setShowStartModal] = useState(false);
    const [studyType, setStudyType] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');
    const [targetHour, setTargetHour] = useState(2);
    const userName = localStorage.getItem('userName') || '사용자';

    useEffect(() => {
        fetchSummary();
    }, [session]);

    const fetchSummary = async () => {
        try {
            const data = await getTodaySummary();
            setSummary(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleStartSession = async () => {
        await handleStart(studyType, targetHour * 3600);
        setShowStartModal(false);
    };

    const isActive = session && !session.ended;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <span style={styles.headerTitle}>Study Tracker</span>
                <div style={styles.headerRight}>
                    <span style={styles.userName}>{userName}</span>
                    <button style={styles.navBtn} onClick={() => navigate('/stats')}>
                        통계
                    </button>
                    <button style={styles.navBtn} onClick={() => navigate('/classifications')}>
                        설정
                    </button>
                    <button style={styles.logoutBtn} onClick={() => {
                        localStorage.clear();
                        navigate('/login');
                    }}>
                        로그아웃
                    </button>
                </div>
            </div>

            <div style={styles.summaryCard}>
                <p style={styles.summaryLabel}>오늘 순공 시간</p>
                <h1 style={styles.summaryTime}>
                    {formatTime(summary?.totalStudySec || 0)}
                </h1>
                <div style={styles.summaryRow}>
                    <div style={styles.summaryItem}>
                        <span style={styles.summaryItemLabel}>딴짓</span>
                        <span style={{ ...styles.summaryItemValue, color: '#e53935' }}>
                            {formatTime(summary?.totalDistractSec || 0)}
                        </span>
                    </div>
                    <div style={styles.summaryItem}>
                        <span style={styles.summaryItemLabel}>세션</span>
                        <span style={styles.summaryItemValue}>
                            {summary?.sessionCount || 0}회
                        </span>
                    </div>
                </div>
            </div>

            {isActive ? (
                <div style={styles.sessionCard}>
                    <p style={styles.sessionLabel}>
                        {isPaused ? '일시정지 중' : '측정 중'}
                    </p>
                    <h2 style={styles.sessionTime}>{formatTime(elapsedSec)}</h2>
                    {session.targetSec && (
                        <p style={styles.targetTime}>
                            목표 {formatTime(session.targetSec)}
                        </p>
                    )}
                    <div style={styles.btnRow}>
                        {isPaused ? (
                            <button style={styles.btnResume} onClick={handleResume}>
                                재개
                            </button>
                        ) : (
                            <button style={styles.btnPause} onClick={handlePause}>
                                일시정지
                            </button>
                        )}
                        <button style={styles.btnExtend}
                            onClick={() => handleExtend(1800)}>
                            +30분
                        </button>
                        <button style={styles.btnEnd} onClick={async () => {
                            await handleEnd();
                            if (session) {
                                setFinalizedSessionId(session.sessionId);
                                setShowFinalizeModal(true);
                            }
                        }}>
                            종료
                        </button>
                    </div>
                </div>
            ) : (
                <button style={styles.startBtn}
                    onClick={() => setShowStartModal(true)}>
                    공부 시작
                </button>
            )}

            {summary && summary.topDistracts.length > 0 && (
                <div style={styles.distractCard}>
                    <p style={styles.distractTitle}>오늘 딴짓 TOP</p>
                    {summary.topDistracts.map((item, i) => (
                        <div key={i} style={styles.distractItem}>
                            <span>{item.name}</span>
                            <span style={{ color: '#e53935' }}>
                                {formatTime(item.totalSec)}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {showStartModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3 style={{ margin: '0 0 16px' }}>공부 시작</h3>

                        <p style={styles.modalLabel}>공부 유형</p>
                        <div style={styles.typeRow}>
                            <button
                                style={studyType === 'ONLINE'
                                    ? styles.typeSelected : styles.typeBtn}
                                onClick={() => setStudyType('ONLINE')}>
                                온라인
                            </button>
                            <button
                                style={studyType === 'OFFLINE'
                                    ? styles.typeSelected : styles.typeBtn}
                                onClick={() => setStudyType('OFFLINE')}>
                                오프라인
                            </button>
                        </div>

                        <p style={styles.modalLabel}>목표 시간</p>
                        <div style={styles.typeRow}>
                            {[1, 2, 3, 4].map(h => (
                                <button
                                    key={h}
                                    style={targetHour === h
                                        ? styles.typeSelected : styles.typeBtn}
                                    onClick={() => setTargetHour(h)}>
                                    {h}시간
                                </button>
                            ))}
                        </div>

                        {error && <p style={styles.error}>{error}</p>}

                        <div style={styles.modalBtnRow}>
                            <button style={styles.modalCancel}
                                onClick={() => setShowStartModal(false)}>
                                취소
                            </button>
                            <button style={styles.modalStart}
                                onClick={handleStartSession}
                                disabled={loading}>
                                시작
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showFinalizeModal && finalizedSessionId && (
                <SessionFinalizeModal
                    sessionId={finalizedSessionId}
                    onComplete={() => {
                        setShowFinalizeModal(false);
                        setFinalizedSessionId(null);
                        fetchSummary();
                    }}
                />
            )}

        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: { maxWidth: '480px', margin: '0 auto', padding: '0 16px 40px' },
    header: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 0', borderBottom: '1px solid #eee', marginBottom: '20px'
    },
    headerTitle: { fontSize: '18px', fontWeight: 'bold' },
    headerRight: { display: 'flex', alignItems: 'center', gap: '8px' },
    userName: { fontSize: '13px', color: '#666' },
    navBtn: {
        padding: '6px 12px', background: '#e3f2fd', color: '#1976d2',
        border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
    },
    logoutBtn: {
        padding: '6px 12px', background: '#f5f5f5', color: '#666',
        border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
    },
    summaryCard: {
        background: '#1976d2', color: 'white', borderRadius: '16px',
        padding: '28px', marginBottom: '16px', textAlign: 'center'
    },
    summaryLabel: { margin: '0 0 8px', fontSize: '14px', opacity: 0.8 },
    summaryTime: { margin: '0 0 16px', fontSize: '42px', fontWeight: 'bold' },
    summaryRow: { display: 'flex', justifyContent: 'center', gap: '32px' },
    summaryItem: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    summaryItemLabel: { fontSize: '12px', opacity: 0.8 },
    summaryItemValue: { fontSize: '16px', fontWeight: 'bold', color: 'white' },
    sessionCard: {
        background: 'white', borderRadius: '16px', padding: '24px',
        marginBottom: '16px', textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    },
    sessionLabel: { margin: '0 0 8px', fontSize: '13px', color: '#666' },
    sessionTime: { margin: '0 0 4px', fontSize: '36px', fontWeight: 'bold' },
    targetTime: { margin: '0 0 16px', fontSize: '13px', color: '#999' },
    btnRow: { display: 'flex', gap: '8px', justifyContent: 'center' },
    btnPause: {
        padding: '10px 20px', background: '#fff3e0', color: '#e65100',
        border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
    },
    btnResume: {
        padding: '10px 20px', background: '#e8f5e9', color: '#2e7d32',
        border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
    },
    btnExtend: {
        padding: '10px 20px', background: '#e3f2fd', color: '#1565c0',
        border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
    },
    btnEnd: {
        padding: '10px 20px', background: '#ffebee', color: '#c62828',
        border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
    },
    startBtn: {
        width: '100%', padding: '18px', background: '#1976d2', color: 'white',
        border: 'none', borderRadius: '12px', fontSize: '18px',
        cursor: 'pointer', marginBottom: '16px'
    },
    distractCard: {
        background: 'white', borderRadius: '12px', padding: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    },
    distractTitle: { margin: '0 0 12px', fontSize: '14px', fontWeight: 'bold' },
    distractItem: {
        display: 'flex', justifyContent: 'space-between',
        padding: '8px 0', borderBottom: '1px solid #f5f5f5', fontSize: '14px'
    },
    modalOverlay: {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
    },
    modal: {
        background: 'white', borderRadius: '16px', padding: '24px',
        width: '320px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
    },
    modalLabel: { margin: '0 0 8px', fontSize: '13px', color: '#666' },
    typeRow: { display: 'flex', gap: '8px', marginBottom: '16px' },
    typeBtn: {
        flex: 1, padding: '10px', background: '#f5f5f5', color: '#333',
        border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
    },
    typeSelected: {
        flex: 1, padding: '10px', background: '#1976d2', color: 'white',
        border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
    },
    modalBtnRow: { display: 'flex', gap: '8px', marginTop: '16px' },
    modalCancel: {
        flex: 1, padding: '12px', background: '#f5f5f5', color: '#333',
        border: 'none', borderRadius: '8px', cursor: 'pointer'
    },
    modalStart: {
        flex: 1, padding: '12px', background: '#1976d2', color: 'white',
        border: 'none', borderRadius: '8px', cursor: 'pointer'
    },
    error: { color: '#e53935', fontSize: '13px', margin: '8px 0' },
};

export default HomePage;