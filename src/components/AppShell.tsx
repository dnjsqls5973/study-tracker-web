import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BarChart2, SlidersHorizontal, LogOut, BookOpen } from 'lucide-react';
import { color } from '../theme';

interface Props {
    children: ReactNode;
}

const NAV_ITEMS = [
    { path: '/', label: '홈', icon: Home },
    { path: '/stats', label: '통계', icon: BarChart2 },
    { path: '/classifications', label: '설정', icon: SlidersHorizontal },
];

const AppShell = ({ children }: Props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const userName = localStorage.getItem('userName') || '사용자';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="shell">
            <aside className="shell-sidebar" style={styles.sidebar}>
                <div style={styles.brand}>
                    <BookOpen size={20} strokeWidth={1.75} color={color.accent} />
                    <span style={styles.brandText}>Study Tracker</span>
                </div>

                <nav style={styles.nav}>
                    {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
                        const active = location.pathname === path;
                        return (
                            <button
                                key={path}
                                style={{ ...styles.navItem, ...(active ? styles.navItemActive : {}) }}
                                onClick={() => navigate(path)}
                            >
                                <Icon size={18} strokeWidth={1.75} />
                                {label}
                            </button>
                        );
                    })}
                </nav>

                <div style={styles.sidebarFooter}>
                    <span style={styles.userName}>{userName}</span>
                    <button style={styles.logoutBtn} onClick={handleLogout}>
                        <LogOut size={16} strokeWidth={1.75} />
                        로그아웃
                    </button>
                </div>
            </aside>

            <header className="shell-topbar" style={styles.topbar}>
                <div style={styles.brand}>
                    <BookOpen size={18} strokeWidth={1.75} color={color.accent} />
                    <span style={styles.brandText}>Study Tracker</span>
                </div>
                <div style={styles.topbarNav}>
                    {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
                        const active = location.pathname === path;
                        return (
                            <button
                                key={path}
                                aria-label={label}
                                style={{ ...styles.topbarIconBtn, ...(active ? styles.topbarIconBtnActive : {}) }}
                                onClick={() => navigate(path)}
                            >
                                <Icon size={18} strokeWidth={1.75} />
                            </button>
                        );
                    })}
                    <button aria-label="로그아웃" style={styles.topbarIconBtn} onClick={handleLogout}>
                        <LogOut size={18} strokeWidth={1.75} />
                    </button>
                </div>
            </header>

            <main className="shell-main">
                <div className="shell-content">{children}</div>
            </main>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    sidebar: {
        width: '240px',
        flexShrink: 0,
        borderRight: `1px solid ${color.border}`,
        background: color.sidebar,
        padding: '28px 20px',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
    },
    brand: {
        display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', padding: '0 4px',
    },
    brandText: { fontSize: '15px', fontWeight: 700, color: color.ink, letterSpacing: '-0.01em' },
    nav: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 },
    navItem: {
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 12px', border: 'none', borderRadius: '10px',
        background: 'none', color: color.inkSecondary,
        fontSize: '14px', fontWeight: 500, cursor: 'pointer', textAlign: 'left',
    },
    navItemActive: {
        background: color.accentSoft, color: color.accentStrong, fontWeight: 600,
    },
    sidebarFooter: {
        borderTop: `1px solid ${color.border}`, paddingTop: '16px',
        display: 'flex', flexDirection: 'column', gap: '8px',
    },
    userName: { fontSize: '13px', color: color.inkTertiary, padding: '0 4px' },
    logoutBtn: {
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 12px', border: 'none', borderRadius: '10px',
        background: 'none', color: color.inkSecondary,
        fontSize: '13px', cursor: 'pointer', textAlign: 'left',
    },
    topbar: {
        alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: `1px solid ${color.border}`,
        background: color.sidebar, position: 'sticky', top: 0, zIndex: 10,
    },
    topbarNav: { display: 'flex', alignItems: 'center', gap: '4px' },
    topbarIconBtn: {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '36px', height: '36px', border: 'none', borderRadius: '9px',
        background: 'none', color: color.inkSecondary, cursor: 'pointer',
    },
    topbarIconBtnActive: { background: color.accentSoft, color: color.accentStrong },
};

export default AppShell;
