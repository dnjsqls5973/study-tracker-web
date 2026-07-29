// src/pages/StatsPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getWeeklyStats, getMonthlyStats, getSessions } from '../api/stats';
import { DailyStat, Session } from '../types';

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
    const navigate = useNavigate();
    const [tab, setTab] = useState<'weekly' | 'monthly'>('weekly');
    const [weeklyStats, setWeeklyStats] = useState<DailyStat[]>([]);
    const [monthlyStats, setMonthlyStats] = useState<DailyStat[]>([]);
    const [todaySessions, setTodaySessions] = useState<Session[]>([]);

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

    const chartData = (tab === 'weekly' ? weeklyStats : monthlyStats).map(s => ({
        date: formatDate(s.date),
        순공: Math.round(s.totalStudySec / 60),
        딴짓: Math.round(s.totalDistractSec / 60),
    }));

    const totalStudy = (tab === 'weekly' ? weeklyStats : monthlyStats)
        .reduce((acc, s) => acc + s.totalStudySec, 0);

    return (
        <div style={styles.container}>
            {/* 헤더 */}
            <div style={styles.header}>
                <button style={styles.backBtn} onClick={() => navigate('/')}>
                    ← 홈
                </button>
                <span style={styles.headerTitle}>통계</span>
                <div style={{ width: '60px' }} />
            </div>

            {/* 탭 */}
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
            </div>

            {/* 총 순공 시간 */}
            <div style={styles.totalCard}>
                <p style={styles.totalLabel}>
                    {tab === 'weekly' ? '이번 주' : '이번 달'} 총 순공
                </p>
                <h2 style={styles.totalTime}>{formatTime(totalStudy)}</h2>
            </div>

            {/* 막대 차트 */}
            <div style={styles.chartCard}>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} unit="분" />
                        <Tooltip formatter={(v: any) => `${v}분`} />
                        <Legend />
                        <Bar dataKey="순공" fill="#1976d2" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="딴짓" fill="#ef5350" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* 오늘 세션 목록 */}
            <div style={styles.sectionTitle}>오늘 세션</div>
            {todaySessions.length === 0 ? (
                <p style={styles.empty}>오늘 세션이 없어요</p>
            ) : (
                todaySessions.map((s, i) => (
                    <div key={i} style={styles.sessionItem}>
                        <div style={styles.sessionLeft}>
                            <span style={styles.sessionType}>
                                {s.studyType === 'ONLINE' ? '💻' : '📖'} {s.studyType}
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
                    </div>
                ))
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
    backBtn: {
        padding: '6px 12px', background: 'none', border: 'none',
        color: '#1976d2', cursor: 'pointer', fontSize: '14px'
    },
    tabRow: {
        display: 'flex', gap: '8px', marginBottom: '16px'
    },
    tab: {
        flex: 1, padding: '10px', background: '#f5f5f5', color: '#666',
        border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
    },
    tabSelected: {
        flex: 1, padding: '10px', background: '#1976d2', color: 'white',
        border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
    },
    totalCard: {
        background: '#e3f2fd', borderRadius: '12px', padding: '20px',
        marginBottom: '16px', textAlign: 'center'
    },
    totalLabel: { margin: '0 0 8px', fontSize: '13px', color: '#666' },
    totalTime: { margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#1976d2' },
    chartCard: {
        background: 'white', borderRadius: '12px', padding: '16px',
        marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    },
    sectionTitle: {
        fontSize: '15px', fontWeight: 'bold', marginBottom: '12px', color: '#333'
    },
    empty: { color: '#999', fontSize: '14px', textAlign: 'center', padding: '20px' },
    sessionItem: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'white', borderRadius: '10px', padding: '14px 16px',
        marginBottom: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
    },
    sessionLeft: { display: 'flex', flexDirection: 'column', gap: '4px' },
    sessionType: { fontSize: '13px', fontWeight: 'bold' },
    sessionTime: { fontSize: '12px', color: '#888' },
    sessionRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' },
    sessionStudy: { fontSize: '13px', color: '#1976d2', fontWeight: 'bold' },
    sessionDistract: { fontSize: '12px', color: '#e53935' },
};

export default StatsPage;