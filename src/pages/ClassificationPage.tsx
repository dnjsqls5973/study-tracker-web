// src/pages/ClassificationPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Classification, getClassifications,
    createClassification, updateClassification, deleteClassification
} from '../api/classification';

const categoryLabel: { [key: string]: string } = {
    STUDY: '공부',
    DISTRACT: '딴짓',
    NEUTRAL: '중립',
};

const categoryColor: { [key: string]: string } = {
    STUDY: '#1976d2',
    DISTRACT: '#e53935',
    NEUTRAL: '#9e9e9e',
};

const ClassificationPage = () => {
    const navigate = useNavigate();
    const [list, setList] = useState<Classification[]>([]);
    const [type, setType] = useState<'DOMAIN' | 'APP'>('DOMAIN');
    const [value, setValue] = useState('');
    const [category, setCategory] = useState<'STUDY' | 'DISTRACT' | 'NEUTRAL'>('STUDY');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchList();
    }, []);

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
        <div style={styles.container}>
            <div style={styles.header}>
                <button style={styles.backBtn} onClick={() => navigate('/')}>
                    ← 홈
                </button>
                <span style={styles.headerTitle}>분류 설정</span>
                <div style={{ width: '60px' }} />
            </div>

            <p style={styles.guide}>
                특정 앱이나 사이트가 잘못 분류됐다면 여기서 직접 바꿀 수 있어요.
            </p>

            <div style={styles.addCard}>
                <div style={styles.typeRow}>
                    <button
                        style={type === 'DOMAIN' ? styles.typeSelected : styles.typeBtn}
                        onClick={() => setType('DOMAIN')}>
                        사이트 (도메인)
                    </button>
                    <button
                        style={type === 'APP' ? styles.typeSelected : styles.typeBtn}
                        onClick={() => setType('APP')}>
                        앱 (프로그램)
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
                                background: category === c ? categoryColor[c] : '#f5f5f5',
                                color: category === c ? 'white' : '#666',
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
                <p style={styles.empty}>아직 등록된 규칙이 없어요</p>
            ) : (
                list.map(item => (
                    <div key={item.id} style={styles.item}>
                        <div style={styles.itemLeft}>
                            <span style={styles.itemTag}>
                                {item.type === 'DOMAIN' ? '🌐' : '💻'}
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
                                onClick={() => handleDelete(item.id)}>
                                삭제
                            </button>
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
        padding: '16px 0', borderBottom: '1px solid #eee', marginBottom: '16px'
    },
    headerTitle: { fontSize: '18px', fontWeight: 'bold' },
    backBtn: {
        padding: '6px 12px', background: 'none', border: 'none',
        color: '#1976d2', cursor: 'pointer', fontSize: '14px'
    },
    guide: { fontSize: '13px', color: '#888', marginBottom: '16px' },
    addCard: {
        background: 'white', borderRadius: '12px', padding: '16px',
        marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    },
    typeRow: { display: 'flex', gap: '8px', marginBottom: '12px' },
    typeBtn: {
        flex: 1, padding: '8px', background: '#f5f5f5', color: '#666',
        border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px'
    },
    typeSelected: {
        flex: 1, padding: '8px', background: '#1976d2', color: 'white',
        border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px'
    },
    input: {
        width: '100%', padding: '10px', marginBottom: '12px',
        border: '1px solid #ddd', borderRadius: '8px',
        fontSize: '14px', boxSizing: 'border-box'
    },
    categoryRow: { display: 'flex', gap: '8px', marginBottom: '12px' },
    categoryBtn: {
        flex: 1, padding: '8px', border: 'none', borderRadius: '8px',
        cursor: 'pointer', fontSize: '13px', fontWeight: 'bold'
    },
    addBtn: {
        width: '100%', padding: '10px', background: '#333', color: 'white',
        border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
    },
    error: { color: '#e53935', fontSize: '12px', marginBottom: '8px' },
    sectionTitle: {
        fontSize: '15px', fontWeight: 'bold', marginBottom: '12px', color: '#333'
    },
    empty: { color: '#999', fontSize: '14px', textAlign: 'center', padding: '20px' },
    item: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'white', borderRadius: '10px', padding: '12px 16px',
        marginBottom: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
    },
    itemLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
    itemTag: { fontSize: '14px' },
    itemValue: { fontSize: '14px', fontWeight: 'bold' },
    itemRight: { display: 'flex', alignItems: 'center', gap: '8px' },
    select: {
        padding: '4px 8px', border: '1px solid #ddd', borderRadius: '6px',
        fontSize: '13px', fontWeight: 'bold', cursor: 'pointer'
    },
    deleteBtn: {
        padding: '4px 10px', background: '#f5f5f5', color: '#999',
        border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
    },
};

export default ClassificationPage;