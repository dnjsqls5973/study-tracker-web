// src/pages/StatsPage.tsx
import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getWeeklyStats, getMonthlyStats, getSessions } from '../api/stats';
import { getSessionNotes } from '../api/session';
import { DailyStat, Session, LogNote } from '../types';
import HistoryTab from '../components/HistoryTab';
import AppShell from '../components/AppShell';
import { color, radius } from '../theme';
import { Monitor, BookOpen, ChevronDown, ChevronUp, Globe } from 'lucide-react';

const formatTime = (sec: number): string => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (h > 0) return `${h}시간 ${m}분`;
    return `${m}분`;
};

const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
};

const StatsPage = () => {
    const [tab, setTab] = useState<'weekly' | 'monthly' | 'history'>('weekly');
    const [weeklyStats, setWeeklyStats] = useState<DailyStat[]>([]);
    const [monthlyStats, setMonthlyStats] = useState<DailyStat[]>([]);
    const [todaySessions, setTodaySessions] = useState<Session[]>([]);
    const [expandedSessionId, setExpandedSessionId] = useState<number | null>(null);
    const [sessionNotes, setSessionNotes] = useState<{ [sessionId: number]: LogNote[] }>({});
    const [notesLoading, setNotesLoading] = useState(false);

    useEffect(() => {
        fetchWeekly();
        fetchMonthly();
        fetchTodaySessions();
    }, []);

    const fetchWeekly = async () => {
        try {
            const today = new Date();
            const day = today.getDay(); // 0(일) ~ 6(토)
            const diffToMonday = day === 0 ? -6 : 1 - day; // 일요일이면 6일 전 월요일
            const monday = new Date(today);
            monday.setDate(today.getDate() + diffToMonday);
            const startDate = monday.toISOString().slice(0, 10);
            const data = await getWeeklyStats(startDate);
            setWeeklyStats(data);
        } catch (e) {
            console.error('주간 통계 조회 실패', e);
            setWeeklyStats([]);
        }
    };

    const fetchMonthly = async () => {
        try {
            const today = new Date();
            const data = await getMonthlyStats(today.getFullYear(), today.getMonth() + 1);
            setMonthlyStats(data);
        } catch (e) {
            console.error('월간 통계 조회 실패', e);
            setMonthlyStats([]);
        }
    };

    const fetchTodaySessions = async () => {
        try {
            const today = new Date().toISOString().slice(0, 10);
            const data = await getSessions(today);
            setTodaySessions(data);
        } catch (e) {
            console.error('세션 조회 실패', e);
            setTodaySessions([]);
        }
    };

    const toggleSession = async (sessionId: number) => {
        if (expandedSessionId === sessionId) {
            setExpandedSessionId(null);
            return;
        }
        setExpandedSessionId(sessionId);
        if (!sessionNotes[sessionId]) {
            setNotesLoading(true);
            try {
                const notes = await getSessionNotes(sessionId);
                setSessionNotes(prev => ({ ...prev, [sessionId]: notes }));
            } catch (e) {
                console.error('세션 노트 조회 실패', e);
            } finally {
                setNotesLoading(false);
            }
        }
    };

    const chartData = (tab === 'weekly' ? weeklyStats : monthlyStats).map(s => ({
        date: formatDate(s.date),
        순공: Math.round(s.totalStudySec / 60),
        딴짓: Math.round(s.totalDistractSec / 60),
    }));

    const totalStudy = (tab === 'weekly' ? weeklyStats : monthlyStats)
        .reduce((acc, s) => acc + s.totalStudySec, 0);

    return (
        <AppShell>
            <div style={styles.header}>
                <span style={styles.headerTitle}>통계</span>
            </div>

            <div style={styles.tabRow}>
                <button
                    style={tab === 'weekly' ? styles.tabSelected : styles.tab}
                    onClick={() => setTab('weekly')}>
                    주간
                </button>
                <button
                    style={tab === 'monthly' ? styles.tabSelected : styles.tab}
                    onClick={() => setTab('monthly')}>
                    월간
                </button>
                <button
                    style={tab === 'history' ? styles.tabSelected : styles.tab}
                    onClick={() => setTab('history')}>
                    히스토리
                </button>
            </div>

            {tab === 'history' ? (
                <HistoryTab />
            ) : (
                <>
                    <div style={styles.totalCard}>
                        <p style={styles.totalLabel}>
                            {tab === 'weekly' ? '이번 주' : '이번 달'} 총 순공
                        </p>
                        <h2 style={styles.totalTime}>{formatTime(totalStudy)}</h2>
                    </div>

                    <div style={styles.chartCard}>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={color.surfaceMuted} />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: color.inkTertiary }} />
                                <YAxis tick={{ fontSize: 11, fill: color.inkTertiary }} unit="분" />
                                <Tooltip formatter={(v: any) => `${v}분`} />
                                <Legend />
                                <Bar dataKey="순공" fill={color.accent} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="딴짓" fill={color.distract} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={styles.sectionTitle}>오늘 세션</div>
                    {todaySessions.length === 0 ? (
                        <p style={styles.empty}>오늘 세션이 없어요</p>
                    ) : (
                        todaySessions.map((s, i) => {
                            const isExpanded = expandedSessionId === s.sessionId;
                            return (
                                <div key={i} style={styles.sessionItem}
                                    onClick={() => toggleSession(s.sessionId)}>
                                    <div style={styles.sessionItemRow}>
                                        <div style={styles.sessionLeft}>
                                            <span style={styles.sessionType}>
                                                {s.studyType === 'ONLINE'
                                                    ? <Monitor size={13} strokeWidth={1.75} />
                                                    : <BookOpen size={13} strokeWidth={1.75} />}
                                                {s.studyType}
                                            </span>
                                            <span style={styles.sessionTime}>
                                                {new Date(s.startedAt).toLocaleTimeString('ko-KR', {
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                                {s.endedAt && ` ~ ${new Date(s.endedAt).toLocaleTimeString('ko-KR', {
                                                    hour: '2-digit', minute: '2-digit'
                                                })}`}
                                            </span>
                                        </div>
                                        <div style={styles.sessionRight}>
                                            <span style={styles.sessionStudy}>
                                                순공 {formatTime(s.studySec)}
                                            </span>
                                            {s.distractSec > 0 && (
                                                <span style={styles.sessionDistract}>
                                                    딴짓 {formatTime(s.distractSec)}
                                                </span>
                                            )}
                                        </div>
                                        <span style={styles.expandArrow}>
                                            {isExpanded
                                                ? <ChevronUp size={16} strokeWidth={1.75} />
                                                : <ChevronDown size={16} strokeWidth={1.75} />}
                                        </span>
                                    </div>

                                    {isExpanded && (
                                        <div style={styles.noteList} onClick={e => e.stopPropagation()}>
                                            {notesLoading && !sessionNotes[s.sessionId] ? (
                                                <p style={styles.empty}>불러오는 중...</p>
                                            ) : (sessionNotes[s.sessionId] || []).length === 0 ? (
                                                <p style={styles.empty}>기록된 노트가 없어요</p>
                                            ) : (
                                                sessionNotes[s.sessionId].map((note, j) => (
                                                    <div key={j} style={styles.noteRow}>
                                                        <span style={styles.noteRowLine}>
                                                            {note.logType === 'APP'
                                                                ? <Monitor size={13} strokeWidth={1.75} color={color.inkTertiary} />
                                                                : <Globe size={13} strokeWidth={1.75} color={color.inkTertiary} />}
                                                            {note.logValue}
                                                            <span style={{
                                                                fontSize: '11px', fontWeight: 600,
                                                                color: note.category === 'STUDY' ? color.accent
                                                                    : note.category === 'DISTRACT' ? color.distract : color.neutral
                                                            }}>
                                                                {note.category === 'STUDY' ? '공부'
                                                                    : note.category === 'DISTRACT' ? '딴짓' : '중립'}
                                                            </span>
                                                        </span>
                                                        {note.memo && <p style={styles.noteMemo}>"{note.memo}"</p>}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </>
            )}
        </AppShell>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    header: { marginBottom: '20px' },
    headerTitle: { fontSize: '20px', fontWeight: 700, color: color.ink },
    tabRow: { display: 'flex', gap: '8px', marginBottom: '16px' },
    tab: {
        flex: 1, padding: '10px', background: color.surfaceMuted, color: color.inkSecondary,
        border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontSize: '14px', fontWeight: 500,
    },
    tabSelected: {
        flex: 1, padding: '10px', background: color.accent, color: color.onAccent,
        border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontSize: '14px', fontWeight: 600,
    },
    totalCard: {
        background: color.accentSoft, borderRadius: radius.md, padding: '20px',
        marginBottom: '16px', textAlign: 'center',
    },
    totalLabel: { margin: '0 0 8px', fontSize: '13px', color: color.inkSecondary },
    totalTime: { margin: 0, fontSize: '30px', fontWeight: 700, color: color.accentStrong },
    chartCard: {
        background: color.surface, border: `1px solid ${color.border}`, borderRadius: radius.md,
        padding: '16px', marginBottom: '20px',
    },
    sectionTitle: { fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: color.ink },
    empty: { color: color.inkTertiary, fontSize: '14px', textAlign: 'center', padding: '20px' },
    sessionItem: {
        background: color.surface, border: `1px solid ${color.border}`, borderRadius: radius.md,
        padding: '14px 16px', marginBottom: '8px', cursor: 'pointer',
    },
    sessionItemRow: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px',
    },
    sessionLeft: { display: 'flex', flexDirection: 'column', gap: '4px' },
    sessionType: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 600, color: color.ink },
    sessionTime: { fontSize: '12px', color: color.inkTertiary },
    sessionRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' },
    sessionStudy: { fontSize: '13px', color: color.accent, fontWeight: 700 },
    sessionDistract: { fontSize: '12px', color: color.distract },
    expandArrow: { display: 'flex', color: color.inkTertiary },
    noteList: { marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${color.surfaceMuted}`, cursor: 'default' },
    noteRow: { padding: '6px 0', fontSize: '13px' },
    noteRowLine: { display: 'flex', alignItems: 'center', gap: '6px', color: color.ink },
    noteMemo: { margin: '4px 0 0', fontSize: '12px', color: color.inkTertiary },
};

export default StatsPage;
