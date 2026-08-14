import { useState, useEffect } from 'react';
import {
    Classification, getClassifications,
    createClassification, updateClassification, deleteClassification
} from '../api/classification';
import { getMe, updateDayChangeHour } from '../api/user';
import AppShell from '../components/AppShell';
import { color, radius } from '../theme';
import { Globe, Monitor, Trash2 } from 'lucide-react';
import AccountDeleteModal from '../components/AccountDeleteModal';

const categoryLabel: { [key: string]: string } = {
    STUDY: '공부',
    DISTRACT: '딴짓',
    NEUTRAL: '중립',
};

const categoryColor: { [key: string]: string } = {
    STUDY: color.accent,
    DISTRACT: color.distract,
    NEUTRAL: color.neutral,
};

const ClassificationPage = () => {
    const [list, setList] = useState<Classification[]>([]);
    const [type, setType] = useState<'DOMAIN' | 'APP'>('DOMAIN');
    const [value, setValue] = useState('');
    const [category, setCategory] = useState<'STUDY' | 'DISTRACT' | 'NEUTRAL'>('STUDY');
    const [error, setError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [dayChangeHour, setDayChangeHour] = useState<number | null>(null);
    const [dayChangeHourSaving, setDayChangeHourSaving] = useState(false);
    const [dayChangeHourSaved, setDayChangeHourSaved] = useState(false);

    useEffect(() => {
        fetchList();
        fetchMe();
    }, []);

    const fetchMe = async () => {
        try {
            const me = await getMe();
            setDayChangeHour(me.dayChangeHour);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSaveDayChangeHour = async () => {
        if (dayChangeHour === null) return;
        setDayChangeHourSaving(true);
        setDayChangeHourSaved(false);
        try {
            await updateDayChangeHour(dayChangeHour);
            setDayChangeHourSaved(true);
        } catch (e) {
            console.error(e);
        } finally {
            setDayChangeHourSaving(false);
        }
    };

    const fetchList = async () => {
        try {
            const data = await getClassifications();
            setList(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleAdd = async () => {
        if (!value.trim()) {
            setError('값을 입력해주세요.');
            return;
        }
        setError('');
        try {
            await createClassification(type, value.trim(), category);
            setValue('');
            fetchList();
        } catch (e: any) {
            setError(e.response?.data?.message || '추가 실패');
        }
    };

    const handleChangeCategory = async (id: number, newCategory: string) => {
        try {
            await updateClassification(id, newCategory);
            fetchList();
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteClassification(id);
            fetchList();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <AppShell>
            <div style={styles.header}>
                <span style={styles.headerTitle}>분류 설정</span>
            </div>

            <p style={styles.guide}>
                특정 앱이나 사이트가 잘못 분류됐다면 여기서 직접 바꿀 수 있어요.
            </p>

            <div style={styles.addCard}>
                <div style={styles.sectionTitle}>하루 시작 시각</div>
                <p style={styles.guide}>
                    새벽까지 이어진 공부도 "오늘" 기록으로 잡히도록, 통계에서 하루가 시작되는 시각을 정할 수 있어요.
                    (예: 5시로 설정하면 새벽 4시까지 한 공부는 "어제" 기록으로 집계돼요.)
                </p>
                {dayChangeHour === null ? (
                    <p style={styles.empty}>불러오는 중...</p>
                ) : (
                    <div style={styles.dayChangeRow}>
                        <select
                            style={styles.select}
                            value={dayChangeHour}
                            onChange={e => {
                                setDayChangeHour(Number(e.target.value));
                                setDayChangeHourSaved(false);
                            }}
                        >
                            {Array.from({ length: 24 }, (_, h) => (
                                <option key={h} value={h}>{h}시</option>
                            ))}
                        </select>
                        <button
                            style={styles.saveBtn}
                            onClick={handleSaveDayChangeHour}
                            disabled={dayChangeHourSaving}
                        >
                            {dayChangeHourSaving ? '저장 중...' : '저장'}
                        </button>
                        {dayChangeHourSaved && <span style={styles.savedNotice}>저장됨</span>}
                    </div>
                )}
            </div>

            <div style={styles.addCard}>
                <div style={styles.typeRow}>
                    <button
                        style={type === 'DOMAIN' ? styles.typeSelected : styles.typeBtn}
                        onClick={() => setType('DOMAIN')}>
                        <Globe size={14} strokeWidth={1.75} /> 사이트 (도메인)
                    </button>
                    <button
                        style={type === 'APP' ? styles.typeSelected : styles.typeBtn}
                        onClick={() => setType('APP')}>
                        <Monitor size={14} strokeWidth={1.75} /> 앱 (프로그램)
                    </button>
                </div>

                <input
                    style={styles.input}
                    placeholder={type === 'DOMAIN' ? '예: youtube.com' : '예: Code.exe'}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                />

                <div style={styles.categoryRow}>
                    {(['STUDY', 'DISTRACT', 'NEUTRAL'] as const).map(c => (
                        <button
                            key={c}
                            style={{
                                ...styles.categoryBtn,
                                background: category === c ? categoryColor[c] : color.surfaceMuted,
                                color: category === c ? color.onAccent : color.inkSecondary,
                            }}
                            onClick={() => setCategory(c)}>
                            {categoryLabel[c]}
                        </button>
                    ))}
                </div>

                {error && <p style={styles.error}>{error}</p>}

                <button style={styles.addBtn} onClick={handleAdd}>
                    추가
                </button>
            </div>

            <div style={styles.sectionTitle}>내 분류 규칙</div>
            {list.length === 0 ? (
                <p style={styles.empty}>아직 등록된 규칙이 없어요. 위에서 사이트나 앱을 추가해보세요.</p>
            ) : (
                list.map(item => (
                    <div key={item.id} style={styles.item}>
                        <div style={styles.itemLeft}>
                            <span style={styles.itemTag}>
                                {item.type === 'DOMAIN'
                                    ? <Globe size={15} strokeWidth={1.75} color={color.inkTertiary} />
                                    : <Monitor size={15} strokeWidth={1.75} color={color.inkTertiary} />}
                            </span>
                            <span style={styles.itemValue}>{item.value}</span>
                        </div>
                        <div style={styles.itemRight}>
                            <select
                                style={{
                                    ...styles.select,
                                    color: categoryColor[item.category],
                                }}
                                value={item.category}
                                onChange={e => handleChangeCategory(item.id, e.target.value)}
                            >
                                <option value="STUDY">공부</option>
                                <option value="DISTRACT">딴짓</option>
                                <option value="NEUTRAL">중립</option>
                            </select>
                            <button
                                style={styles.deleteBtn}
                                onClick={() => handleDelete(item.id)}
                                aria-label="삭제">
                                <Trash2 size={15} strokeWidth={1.75} />
                            </button>
                        </div>
                    </div>
                ))
            )}

            <div style={styles.dangerZone}>
                <div style={styles.dangerTitle}>계정 삭제</div>
                <p style={styles.dangerDesc}>
                    계정을 삭제하면 모든 학습 기록이 영구적으로 사라져요.
                </p>
                <button style={styles.dangerBtn} onClick={() => setShowDeleteModal(true)}>
                    계정 삭제
                </button>
            </div>

            {showDeleteModal && (
                <AccountDeleteModal onCancel={() => setShowDeleteModal(false)} />
            )}
        </AppShell>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    header: { marginBottom: '20px' },
    headerTitle: { fontSize: '20px', fontWeight: 700, color: color.ink },
    guide: { fontSize: '13px', color: color.inkSecondary, marginBottom: '16px' },
    addCard: {
        background: color.surface, border: `1px solid ${color.border}`, borderRadius: radius.md,
        padding: '16px', marginBottom: '24px',
    },
    typeRow: { display: 'flex', gap: '8px', marginBottom: '12px' },
    typeBtn: {
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        flex: 1, padding: '8px', background: color.surfaceMuted, color: color.inkSecondary,
        border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontSize: '13px',
    },
    typeSelected: {
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        flex: 1, padding: '8px', background: color.accent, color: color.onAccent,
        border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontSize: '13px', fontWeight: 600,
    },
    input: {
        width: '100%', padding: '10px', marginBottom: '12px',
        border: `1px solid ${color.border}`, borderRadius: radius.sm,
        fontSize: '14px', boxSizing: 'border-box', color: color.ink,
    },
    categoryRow: { display: 'flex', gap: '8px', marginBottom: '12px' },
    categoryBtn: {
        flex: 1, padding: '8px', border: 'none', borderRadius: radius.sm,
        cursor: 'pointer', fontSize: '13px', fontWeight: 600,
    },
    addBtn: {
        width: '100%', padding: '10px', background: color.ink, color: color.surface,
        border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontSize: '14px', fontWeight: 600,
    },
    error: { color: color.distract, fontSize: '12px', marginBottom: '8px' },
    dayChangeRow: { display: 'flex', alignItems: 'center', gap: '10px' },
    saveBtn: {
        padding: '10px 16px', background: color.ink, color: color.surface,
        border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontSize: '14px', fontWeight: 600,
    },
    savedNotice: { fontSize: '13px', color: color.accentStrong, fontWeight: 600 },
    sectionTitle: { fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: color.ink },
    empty: { color: color.inkTertiary, fontSize: '14px', textAlign: 'center', padding: '20px' },
    item: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: color.surface, border: `1px solid ${color.border}`, borderRadius: radius.sm,
        padding: '12px 16px', marginBottom: '8px',
    },
    itemLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
    itemTag: { display: 'flex', alignItems: 'center' },
    itemValue: { fontSize: '14px', fontWeight: 600, color: color.ink },
    itemRight: { display: 'flex', alignItems: 'center', gap: '8px' },
    select: {
        padding: '4px 8px', border: `1px solid ${color.border}`, borderRadius: radius.sm,
        fontSize: '13px', fontWeight: 600, cursor: 'pointer', background: color.surface,
    },
    deleteBtn: {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '6px 8px', background: color.surfaceMuted, color: color.distract,
        border: 'none', borderRadius: radius.sm, cursor: 'pointer',
    },
    dangerZone: {
        marginTop: '32px', paddingTop: '20px', borderTop: `1px solid ${color.border}`,
    },
    dangerTitle: { fontSize: '14px', fontWeight: 700, color: color.distract, marginBottom: '4px' },
    dangerDesc: { fontSize: '13px', color: color.inkTertiary, marginBottom: '12px' },
    dangerBtn: {
        padding: '10px 16px', background: 'none', color: color.distract,
        border: `1px solid ${color.distract}`, borderRadius: radius.sm,
        fontSize: '13px', fontWeight: 600, cursor: 'pointer',
    },
};

export default ClassificationPage;
