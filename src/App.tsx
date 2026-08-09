import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import StatsPage from './pages/StatsPage';
import ClassificationPage from './pages/ClassificationPage';
import PrivacyPage from './pages/PrivacyPage';

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
    const token = localStorage.getItem('accessToken');
    return token ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
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