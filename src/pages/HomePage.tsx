import { useState, useEffect } from 'react';
import { useSession } from '../hooks/useSession';
import { getTodaySummary } from '../api/stats';
import { TodaySummary } from '../types';
import SessionFinalizeModal from '../components/SessionFinalizeModal';
import AppShell from '../components/AppShell';
import { color, radius, shadow } from '../theme';
import {
    Play, Pause, Plus, Square, Monitor, Globe, StickyNote, X, ChevronRight,
} from 'lucide-react';

const formatTime = (sec: number): string => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}시간 ${m}분`;
    if (m > 0) return `${m}분 ${s}초`;
    return `${s}초`;
};

const HomePage = () => {
    const {
        session, loading, error, elapsedSec, isPaused,
        handleStart, handleEnd, handlePause, handleResume, handleExtend
    } = useSession();

    const [showFinalizeModal, setShowFinalizeModal] = useState(false);
    const [finalizedSessionId, setFinalizedSessionId] = useState<number | null>(null);
    const [detailModal, setDetailModal] = useState<'STUDY' | 'DISTRACT' | null>(null);

    const [summary, setSummary] = useState<TodaySummary | null>(null);
    const [showStartModal, setShowStartModal] = useState(false);
    const [studyType, setStudyType] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');
    const [targetHour, setTargetHour] = useState(2);

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
    const recentStudyNotes = (summary?.recentNotes || []).filter(n => n.category === 'STUDY');

    return (
        <AppShell>
            <div className="content-grid two-col">
                {/* 왼쪽: 오늘의 핵심 지표 + 세션 컨트롤 */}
                <div style={styles.col}>
                    <div style={styles.heroCard}>
                        <p style={styles.heroLabel}>오늘 순공 시간</p>
                        <button style={styles.heroValueBtn} onClick={() => setDetailModal('STUDY')}>
                            <span style={styles.heroValue}>{formatTime(summary?.totalStudySec || 0)}</span>
                            <ChevronRight size={20} strokeWidth={1.75} color={color.inkTertiary} />
                        </button>
                        <div style={styles.heroStatsRow}>
                            <button style={styles.heroStat} onClick={() => setDetailModal('DISTRACT')}>
                                <span style={styles.heroStatLabel}>딴짓</span>
                                <span style={{ ...styles.heroStatValue, color: color.distract }}>
                                    {formatTime(summary?.totalDistractSec || 0)}
                                </span>
                            </button>
                            <div style={styles.heroStatDivider} />
                            <div style={styles.heroStat}>
                                <span style={styles.heroStatLabel}>세션</span>
                                <span style={styles.heroStatValue}>{summary?.sessionCount || 0}회</span>
                            </div>
                        </div>
                    </div>

                    {isActive ? (
                        <div style={styles.sessionCard}>
                            <p style={styles.sessionLabel}>{isPaused ? '일시정지 중' : '측정 중'}</p>
                            <h2 style={styles.sessionTime}>{formatTime(elapsedSec)}</h2>
                            {session.targetSec && (
                                <p style={styles.targetTime}>목표 {formatTime(session.targetSec)}</p>
                            )}
                            <div style={styles.btnRow}>
                                {isPaused ? (
                                    <button style={styles.btnResume} onClick={handleResume}>
                                        <Play size={15} strokeWidth={2} /> 재개
                                    </button>
                                ) : (
                                    <button style={styles.btnPause} onClick={handlePause}>
                                        <Pause size={15} strokeWidth={2} /> 일시정지
                                    </button>
                                )}
                                <button style={styles.btnExtend} onClick={() => handleExtend(1800)}>
                                    <Plus size={15} strokeWidth={2} /> 30분
                                </button>
                                <button style={styles.btnEnd} onClick={async () => {
                                    await handleEnd();
                                    if (session) {
                                        setFinalizedSessionId(session.sessionId);
                                        setShowFinalizeModal(true);
                                    }
                                }}>
                                    <Square size={13} strokeWidth={2} /> 종료
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button style={styles.startBtn} onClick={() => setShowStartModal(true)}>
                            <Play size={18} strokeWidth={2} fill={color.onAccent} />
                            공부 시작
                        </button>
                    )}
                </div>

                {/* 오른쪽: 딴짓 TOP + 최근 공부 내용 */}
                <div style={styles.col}>
                    {summary && summary.topDistracts.length > 0 && (
                        <div style={styles.panelCard}>
                            <p style={styles.panelTitle}>오늘 딴짓 TOP</p>
                            {summary.topDistracts.map((item, i) => (
                                <div key={i} style={styles.distractItem}>
                                    <span style={styles.distractName}>{item.name}</span>
                                    <span style={{ color: color.distract, fontWeight: 600, fontSize: '13px' }}>
                                        {formatTime(item.totalSec)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {recentStudyNotes.length > 0 && (
                        <div style={styles.panelCard}>
                            <p style={styles.panelTitle}>
                                <StickyNote size={15} strokeWidth={1.75} /> 최근 공부 내용
                            </p>
                            {recentStudyNotes.map((note, i) => (
                                <div key={i} style={styles.recentItem}>
                                    <span style={styles.recentIcon}>
                                        {note.logType === 'APP'
                                            ? <Monitor size={15} strokeWidth={1.75} color={color.inkTertiary} />
                                            : <Globe size={15} strokeWidth={1.75} color={color.inkTertiary} />}
                                    </span>
                                    <div style={styles.recentTextWrap}>
                                        <span style={styles.recentValue}>{note.logValue}</span>
                                        <span style={styles.recentMemo}>{note.memo}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!summary?.topDistracts.length && !recentStudyNotes.length && (
                        <div style={styles.emptyPanel}>
                            <p style={styles.empty}>공부를 시작하면 오늘의 기록이 여기에 쌓여요.</p>
                        </div>
                    )}
                </div>
            </div>

            {showStartModal && (
                <div style={styles.modalOverlay} onClick={() => setShowStartModal(false)}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>공부 시작</h3>
                            <button style={styles.modalCloseIcon} onClick={() => setShowStartModal(false)}>
                                <X size={18} strokeWidth={1.75} />
                            </button>
                        </div>

                        <p style={styles.modalLabel}>공부 유형</p>
                        <div style={styles.typeRow}>
                            <button
                                style={studyType === 'ONLINE' ? styles.typeSelected : styles.typeBtn}
                                onClick={() => setStudyType('ONLINE')}>
                                온라인
                            </button>
                            <button
                                style={studyType === 'OFFLINE' ? styles.typeSelected : styles.typeBtn}
                                onClick={() => setStudyType('OFFLINE')}>
                                오프라인
                            </button>
                        </div>

                        <p style={styles.modalLabel}>목표 시간</p>
                        <div style={styles.typeRow}>
                            {[1, 2, 3, 4].map(h => (
                                <button
                                    key={h}
                                    style={targetHour === h ? styles.typeSelected : styles.typeBtn}
                                    onClick={() => setTargetHour(h)}>
                                    {h}시간
                                </button>
                            ))}
                        </div>

                        {error && <p style={styles.error}>{error}</p>}

                        <div style={styles.modalBtnRow}>
                            <button style={styles.modalCancel} onClick={() => setShowStartModal(false)}>
                                취소
                            </button>
                            <button style={styles.modalStart} onClick={handleStartSession} disabled={loading}>
                                시작
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {detailModal && (
                <div style={styles.modalOverlay} onClick={() => setDetailModal(null)}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>
                                {detailModal === 'STUDY' ? '공부 상세' : '딴짓 상세'}
                            </h3>
                            <button style={styles.modalCloseIcon} onClick={() => setDetailModal(null)}>
                                <X size={18} strokeWidth={1.75} />
                            </button>
                        </div>
                        {(detailModal === 'STUDY' ? summary?.studyDetails : summary?.distractDetails)?.length ? (
                            (detailModal === 'STUDY' ? summary!.studyDetails : summary!.distractDetails)
                                .map((item, i) => (
                                    <div key={i} style={styles.detailItem}>
                                        <span>{item.name}</span>
                                        <span style={{
                                            fontWeight: 600,
                                            color: detailModal === 'STUDY' ? color.accent : color.distract
                                        }}>
                                            {formatTime(item.totalSec)}
                                        </span>
                                    </div>
                                ))
                        ) : (
                            <p style={styles.empty}>기록이 없어요</p>
                        )}
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
                    onCancel={() => {
                        setShowFinalizeModal(false);
                        setFinalizedSessionId(null);
                        fetchSummary();
                    }}
                />
            )}
        </AppShell>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    col: { display: 'flex', flexDirection: 'column', gap: '16px' },

    heroCard: {
        background: color.surface, border: `1px solid ${color.border}`,
        borderRadius: radius.lg, padding: '28px',
    },
    heroLabel: { margin: '0 0 10px', fontSize: '13px', color: color.inkTertiary, fontWeight: 500 },
    heroValueBtn: {
        display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none',
        cursor: 'pointer', padding: 0, marginBottom: '20px',
    },
    heroValue: {
        fontSize: '48px', fontWeight: 700, color: color.ink, letterSpacing: '-0.02em',
        fontVariantNumeric: 'tabular-nums', lineHeight: 1,
    },
    heroStatsRow: { display: 'flex', alignItems: 'center', gap: '20px' },
    heroStat: {
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px',
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
    },
    heroStatDivider: { width: '1px', height: '28px', background: color.border },
    heroStatLabel: { fontSize: '12px', color: color.inkTertiary },
    heroStatValue: { fontSize: '15px', fontWeight: 700, color: color.ink },

    sessionCard: {
        background: color.surface, border: `1px solid ${color.border}`, borderRadius: radius.lg,
        padding: '24px', textAlign: 'center',
    },
    sessionLabel: { margin: '0 0 8px', fontSize: '13px', color: color.inkTertiary, fontWeight: 500 },
    sessionTime: {
        margin: '0 0 4px', fontSize: '34px', fontWeight: 700, color: color.ink,
        fontVariantNumeric: 'tabular-nums',
    },
    targetTime: { margin: '0 0 16px', fontSize: '13px', color: color.inkTertiary },
    btnRow: { display: 'flex', gap: '8px', justifyContent: 'center' },
    btnPause: {
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '10px 16px', background: color.surfaceMuted, color: color.ink,
        border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontSize: '13px', fontWeight: 500,
    },
    btnResume: {
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '10px 16px', background: color.positiveSoft, color: color.positive,
        border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontSize: '13px', fontWeight: 500,
    },
    btnExtend: {
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '10px 16px', background: color.accentSoft, color: color.accentStrong,
        border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontSize: '13px', fontWeight: 500,
    },
    btnEnd: {
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '10px 16px', background: color.distractSoft, color: color.distract,
        border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontSize: '13px', fontWeight: 500,
    },
    startBtn: {
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        width: '100%', padding: '18px', background: color.accent, color: color.onAccent,
        border: 'none', borderRadius: radius.lg, fontSize: '16px', fontWeight: 600, cursor: 'pointer',
    },

    panelCard: {
        background: color.surface, border: `1px solid ${color.border}`, borderRadius: radius.md,
        padding: '18px',
    },
    panelTitle: {
        display: 'flex', alignItems: 'center', gap: '6px',
        margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: color.ink,
    },
    distractItem: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '9px 0', borderBottom: `1px solid ${color.surfaceMuted}`, fontSize: '13px',
    },
    distractName: { color: color.ink },
    recentItem: {
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        padding: '9px 0', borderBottom: `1px solid ${color.surfaceMuted}`,
    },
    recentIcon: { display: 'flex', alignItems: 'center', paddingTop: '2px' },
    recentTextWrap: { display: 'flex', flexDirection: 'column', gap: '2px' },
    recentValue: { fontSize: '13px', fontWeight: 600, color: color.ink },
    recentMemo: { fontSize: '13px', color: color.inkSecondary },
    emptyPanel: {
        background: color.surfaceMuted, border: `1px dashed ${color.borderStrong}`,
        borderRadius: radius.md, padding: '24px',
    },

    modalOverlay: {
        position: 'fixed', inset: 0, background: 'rgba(28,27,24,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px',
    },
    modal: {
        background: color.surface, borderRadius: radius.lg, padding: '24px',
        width: '320px', maxWidth: '100%', boxShadow: shadow.float,
    },
    modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
    modalTitle: { margin: 0, fontSize: '16px', fontWeight: 700, color: color.ink },
    modalCloseIcon: {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '28px', height: '28px', border: 'none', borderRadius: radius.sm,
        background: 'none', color: color.inkTertiary, cursor: 'pointer',
    },
    modalLabel: { margin: '0 0 8px', fontSize: '13px', color: color.inkSecondary },
    typeRow: { display: 'flex', gap: '8px', marginBottom: '16px' },
    typeBtn: {
        flex: 1, padding: '10px', background: color.surfaceMuted, color: color.ink,
        border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontSize: '14px',
    },
    typeSelected: {
        flex: 1, padding: '10px', background: color.accent, color: color.onAccent,
        border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontSize: '14px', fontWeight: 600,
    },
    modalBtnRow: { display: 'flex', gap: '8px', marginTop: '16px' },
    modalCancel: {
        flex: 1, padding: '12px', background: color.surfaceMuted, color: color.ink,
        border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontSize: '14px',
    },
    modalStart: {
        flex: 1, padding: '12px', background: color.accent, color: color.onAccent,
        border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontSize: '14px', fontWeight: 600,
    },
    error: { color: color.distract, fontSize: '13px', margin: '8px 0' },
    detailItem: {
        display: 'flex', justifyContent: 'space-between',
        padding: '10px 0', borderBottom: `1px solid ${color.surfaceMuted}`, fontSize: '14px',
    },
    empty: { color: color.inkTertiary, fontSize: '14px', textAlign: 'center', padding: '8px 0' },
};

export default HomePage;
