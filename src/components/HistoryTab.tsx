import { useState, useEffect, useCallback } from 'react';
import { getCalendar, getSessions, getWeeklyNotes, getMonthlyNotes } from '../api/stats';
import { getSessionNotes } from '../api/session';
import { CalendarData, Session, LogNote, NoteDailySummary } from '../types';
import { color, radius } from '../theme';
import { ChevronLeft, ChevronRight, Monitor, Globe } from 'lucide-react';

const formatTime = (sec: number): string => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (h > 0) return `${h}시간 ${m}분`;
    return `${m}분`;
};

const formatClock = (dateStr: string): string =>
    new Date(dateStr).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

const toDateStr = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const getMonday = (base: Date): Date => {
    const day = base.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(base);
    monday.setDate(base.getDate() + diffToMonday);
    return monday;
};

const HistoryTab = () => {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth() + 1); // 1~12
    const [calendarData, setCalendarData] = useState<CalendarData>({});

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedSessions, setSelectedSessions] = useState<Session[]>([]);
    const [notesBySession, setNotesBySession] = useState<{ [sessionId: number]: LogNote[] }>({});
    const [detailLoading, setDetailLoading] = useState(false);

    const [summaryTab, setSummaryTab] = useState<'weekly' | 'monthly'>('weekly');
    const [weeklyNotes, setWeeklyNotes] = useState<NoteDailySummary[]>([]);
    const [monthlyNotes, setMonthlyNotes] = useState<NoteDailySummary[]>([]);

    const fetchCalendar = useCallback(async () => {
        try {
            const data = await getCalendar(viewYear, viewMonth);
            setCalendarData(data);
        } catch (e) {
            console.error('달력 데이터 조회 실패', e);
            setCalendarData({});
        }
    }, [viewYear, viewMonth]);

    useEffect(() => {
        fetchCalendar();
    }, [fetchCalendar]);

    useEffect(() => {
        (async () => {
            try {
                const monday = getMonday(today);
                const data = await getWeeklyNotes(toDateStr(monday));
                setWeeklyNotes(data);
            } catch (e) {
                console.error('주별 노트 요약 조회 실패', e);
                setWeeklyNotes([]);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const data = await getMonthlyNotes(today.getFullYear(), today.getMonth() + 1);
                setMonthlyNotes(data);
            } catch (e) {
                console.error('월별 노트 요약 조회 실패', e);
                setMonthlyNotes([]);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSelectDate = async (dateStr: string) => {
        if (selectedDate === dateStr) {
            setSelectedDate(null);
            return;
        }
        setSelectedDate(dateStr);
        setDetailLoading(true);
        try {
            const sessions = await getSessions(dateStr);
            setSelectedSessions(sessions);

            const notesEntries = await Promise.all(
                sessions.map(async (s) => {
                    try {
                        const notes = await getSessionNotes(s.sessionId);
                        return [s.sessionId, notes] as const;
                    } catch {
                        return [s.sessionId, []] as const;
                    }
                })
            );
            setNotesBySession(Object.fromEntries(notesEntries));
        } catch (e) {
            console.error('날짜별 세션 조회 실패', e);
            setSelectedSessions([]);
            setNotesBySession({});
        } finally {
            setDetailLoading(false);
        }
    };

    const moveMonth = (delta: number) => {
        let y = viewYear;
        let m = viewMonth + delta;
        if (m < 1) { m = 12; y -= 1; }
        if (m > 12) { m = 1; y += 1; }
        setViewYear(y);
        setViewMonth(m);
        setSelectedDate(null);
    };

    const firstDay = new Date(viewYear, viewMonth - 1, 1);
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const startWeekday = firstDay.getDay(); // 0(일)~6(토)
    const cells: (number | null)[] = [
        ...Array(startWeekday).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    const displayedNotes = summaryTab === 'weekly' ? weeklyNotes : monthlyNotes;
    const notesWithContent = displayedNotes.filter(d => d.sessions.length > 0);

    return (
        <div>
            <div style={styles.calendarCard}>
                <div style={styles.calendarHeader}>
                    <button style={styles.navArrow} onClick={() => moveMonth(-1)} aria-label="이전 달">
                        <ChevronLeft size={18} strokeWidth={2} />
                    </button>
                    <span style={styles.calendarTitle}>{viewYear}년 {viewMonth}월</span>
                    <button style={styles.navArrow} onClick={() => moveMonth(1)} aria-label="다음 달">
                        <ChevronRight size={18} strokeWidth={2} />
                    </button>
                </div>

                <div style={styles.weekdayRow}>
                    {['일', '월', '화', '수', '목', '금', '토'].map(w => (
                        <span key={w} style={styles.weekdayLabel}>{w}</span>
                    ))}
                </div>

                <div style={styles.dayGrid}>
                    {cells.map((day, i) => {
                        if (day === null) return <div key={i} style={styles.dayCell} />;
                        const dateStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const hasStudy = calendarData[dateStr] !== undefined;
                        const isSelected = selectedDate === dateStr;
                        return (
                            <button
                                key={i}
                                style={{
                                    ...styles.dayCell,
                                    ...styles.dayButton,
                                    ...(isSelected ? styles.daySelected : {}),
                                }}
                                onClick={() => handleSelectDate(dateStr)}
                            >
                                <span>{day}</span>
                                {hasStudy && <span style={{ ...styles.dayDot, background: isSelected ? color.onAccent : color.accent }} />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {selectedDate && (
                <div style={styles.detailSection}>
                    <p style={styles.sectionTitle}>{selectedDate}</p>
                    {detailLoading ? (
                        <p style={styles.empty}>불러오는 중...</p>
                    ) : selectedSessions.length === 0 ? (
                        <p style={styles.empty}>해당 날짜에 세션이 없어요</p>
                    ) : (
                        selectedSessions.map((s, i) => (
                            <div key={i} style={styles.sessionDetailCard}>
                                <div style={styles.sessionDetailHeader}>
                                    <span>세션 {i + 1} {formatClock(s.startedAt)}
                                        {s.endedAt && ` ~ ${formatClock(s.endedAt)}`}
                                    </span>
                                    <span style={styles.sessionDetailStudy}>
                                        순공 {formatTime(s.studySec)}
                                    </span>
                                </div>
                                {(notesBySession[s.sessionId] || []).map((note, j) => (
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
                                ))}
                            </div>
                        ))
                    )}
                </div>
            )}

            <div style={styles.summarySection}>
                <div style={styles.tabRow}>
                    <button
                        style={summaryTab === 'weekly' ? styles.tabSelected : styles.tab}
                        onClick={() => setSummaryTab('weekly')}>
                        주별 요약
                    </button>
                    <button
                        style={summaryTab === 'monthly' ? styles.tabSelected : styles.tab}
                        onClick={() => setSummaryTab('monthly')}>
                        월별 요약
                    </button>
                </div>

                {notesWithContent.length === 0 ? (
                    <p style={styles.empty}>공부 메모가 없어요</p>
                ) : (
                    notesWithContent.map((day, i) => (
                        <div key={i} style={styles.summaryDayCard}>
                            <div style={styles.summaryDayHeader}>
                                <span>{day.date}</span>
                                <span style={styles.sessionDetailStudy}>
                                    순공 {formatTime(day.totalStudySec)}
                                </span>
                            </div>
                            {day.sessions.map((sg, j) => (
                                <div key={j}>
                                    {sg.notes.map((note, k) => (
                                        <div key={k} style={styles.noteRow}>
                                            <span>{note.logValue}</span>
                                            {note.memo && <p style={styles.noteMemo}>"{note.memo}"</p>}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    calendarCard: {
        background: color.surface, border: `1px solid ${color.border}`, borderRadius: radius.md,
        padding: '16px', marginBottom: '20px',
    },
    calendarHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px',
    },
    calendarTitle: { fontSize: '15px', fontWeight: 700, color: color.ink },
    navArrow: {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'none', border: 'none', borderRadius: radius.sm,
        color: color.inkSecondary, cursor: 'pointer', padding: '6px',
    },
    weekdayRow: { display: 'flex' },
    weekdayLabel: {
        flex: 1, textAlign: 'center', fontSize: '12px', color: color.inkTertiary, padding: '4px 0',
    },
    dayGrid: { display: 'flex', flexWrap: 'wrap' },
    dayCell: { width: `${100 / 7}%`, aspectRatio: '1', boxSizing: 'border-box' },
    dayButton: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '3px', background: 'none', border: 'none', borderRadius: radius.sm,
        cursor: 'pointer', fontSize: '13px', color: color.ink,
    },
    daySelected: { background: color.accent, color: color.onAccent },
    dayDot: { width: '5px', height: '5px', borderRadius: '50%' },
    detailSection: { marginBottom: '20px' },
    sectionTitle: { fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: color.ink },
    empty: { color: color.inkTertiary, fontSize: '14px', textAlign: 'center', padding: '20px' },
    sessionDetailCard: {
        background: color.surface, border: `1px solid ${color.border}`, borderRadius: radius.md,
        padding: '14px', marginBottom: '8px',
    },
    sessionDetailHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '13px', color: color.inkSecondary, marginBottom: '8px',
    },
    sessionDetailStudy: { color: color.accent, fontWeight: 700, fontSize: '13px' },
    noteRow: { padding: '6px 0', borderTop: `1px solid ${color.surfaceMuted}`, fontSize: '13px' },
    noteRowLine: { display: 'flex', alignItems: 'center', gap: '6px', color: color.ink },
    noteMemo: { margin: '4px 0 0', fontSize: '12px', color: color.inkTertiary },
    summarySection: { marginBottom: '20px' },
    tabRow: { display: 'flex', gap: '8px', marginBottom: '12px' },
    tab: {
        flex: 1, padding: '8px', background: color.surfaceMuted, color: color.inkSecondary,
        border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontSize: '13px', fontWeight: 500,
    },
    tabSelected: {
        flex: 1, padding: '8px', background: color.accent, color: color.onAccent,
        border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontSize: '13px', fontWeight: 600,
    },
    summaryDayCard: {
        background: color.surface, border: `1px solid ${color.border}`, borderRadius: radius.md,
        padding: '14px', marginBottom: '8px',
    },
    summaryDayHeader: {
        display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700,
        marginBottom: '6px', color: color.ink,
    },
};

export default HistoryTab;
