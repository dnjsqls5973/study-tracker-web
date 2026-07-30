import { useState, useEffect, useCallback } from 'react';
import { getCalendar, getSessions, getWeeklyNotes, getMonthlyNotes } from '../api/stats';
import { getSessionNotes } from '../api/session';
import { CalendarData, Session, LogNote, NoteDailySummary } from '../types';

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

    // 달력 그리드 계산
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
            {/* 달력 */}
            <div style={styles.calendarCard}>
                <div style={styles.calendarHeader}>
                    <button style={styles.navArrow} onClick={() => moveMonth(-1)}>‹</button>
                    <span style={styles.calendarTitle}>{viewYear}년 {viewMonth}월</span>
                    <button style={styles.navArrow} onClick={() => moveMonth(1)}>›</button>
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
                                {hasStudy && <span style={styles.dayDot} />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 선택한 날짜 상세 */}
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
                                        <span>
                                            {note.logType === 'APP' ? '💻' : '🌐'} {note.logValue}
                                            <span style={{
                                                marginLeft: '6px', fontSize: '11px',
                                                color: note.category === 'STUDY' ? '#1976d2'
                                                    : note.category === 'DISTRACT' ? '#e53935' : '#999'
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

            {/* 주별/월별 요약 */}
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
        background: 'white', borderRadius: '12px', padding: '16px',
        marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    },
    calendarHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '12px'
    },
    calendarTitle: { fontSize: '15px', fontWeight: 'bold' },
    navArrow: {
        background: 'none', border: 'none', fontSize: '20px',
        color: '#1976d2', cursor: 'pointer', padding: '4px 12px'
    },
    weekdayRow: { display: 'flex' },
    weekdayLabel: {
        flex: 1, textAlign: 'center', fontSize: '12px',
        color: '#999', padding: '4px 0'
    },
    dayGrid: { display: 'flex', flexWrap: 'wrap' },
    dayCell: { width: `${100 / 7}%`, aspectRatio: '1', boxSizing: 'border-box' },
    dayButton: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '3px', background: 'none', border: 'none', borderRadius: '8px',
        cursor: 'pointer', fontSize: '13px', color: '#333'
    },
    daySelected: { background: '#1976d2', color: 'white' },
    dayDot: {
        width: '5px', height: '5px', borderRadius: '50%', background: '#1976d2'
    },
    detailSection: { marginBottom: '20px' },
    sectionTitle: { fontSize: '15px', fontWeight: 'bold', marginBottom: '12px', color: '#333' },
    empty: { color: '#999', fontSize: '14px', textAlign: 'center', padding: '20px' },
    sessionDetailCard: {
        background: 'white', borderRadius: '10px', padding: '14px',
        marginBottom: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
    },
    sessionDetailHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '13px', color: '#666', marginBottom: '8px'
    },
    sessionDetailStudy: { color: '#1976d2', fontWeight: 'bold', fontSize: '13px' },
    noteRow: {
        padding: '6px 0', borderTop: '1px solid #f5f5f5', fontSize: '13px'
    },
    noteMemo: { margin: '4px 0 0', fontSize: '12px', color: '#888' },
    summarySection: { marginBottom: '20px' },
    tabRow: { display: 'flex', gap: '8px', marginBottom: '12px' },
    tab: {
        flex: 1, padding: '8px', background: '#f5f5f5', color: '#666',
        border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px'
    },
    tabSelected: {
        flex: 1, padding: '8px', background: '#1976d2', color: 'white',
        border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px'
    },
    summaryDayCard: {
        background: 'white', borderRadius: '10px', padding: '14px',
        marginBottom: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
    },
    summaryDayHeader: {
        display: 'flex', justifyContent: 'space-between',
        fontSize: '13px', fontWeight: 'bold', marginBottom: '6px'
    },
};

export default HistoryTab;
