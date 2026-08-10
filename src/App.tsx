import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import StatsPage from './pages/StatsPage';
import ClassificationPage from './pages/ClassificationPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import { notifyExtensionOfLogin } from './utils/extensionBridge';

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
    const token = localStorage.getItem('accessToken');
    return token ? children : <Navigate to="/login" />;
};

function App() {
    useEffect(() => {
        // 이미 로그인된 상태로 앱을 열 때마다 확장 프로그램에도 다시 알려서,
        // (확장을 로그인 이후에 설치했거나, 브릿지 메시지가 한 번 유실됐어도)
        // 새로고침 한 번이면 자동으로 재연결되게 한다.
        const token = localStorage.getItem('accessToken');
        if (token) notifyExtensionOfLogin(token);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/" element={
                    <PrivateRoute>
                        <HomePage />
                    </PrivateRoute>
                } />
                <Route path="/stats" element={
                    <PrivateRoute>
                        <StatsPage />
                    </PrivateRoute>
                } />
                <Route path="/classifications" element={
                    <PrivateRoute>
                        <ClassificationPage />
                    </PrivateRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;