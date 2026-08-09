// src/pages/PrivacyPage.tsx
import { color, font } from '../theme';

const styles: { [key: string]: React.CSSProperties } = {
    page: {
        minHeight: '100vh',
        background: color.page,
        color: color.ink,
        fontFamily: font.display,
        padding: '48px 24px',
        display: 'flex',
        justifyContent: 'center',
    },
    content: {
        maxWidth: '640px',
        width: '100%',
    },
    title: {
        fontSize: '24px',
        fontWeight: 700,
        marginBottom: '8px',
    },
    updated: {
        color: color.inkTertiary,
        fontSize: '13px',
        marginBottom: '32px',
    },
    h2: {
        fontSize: '17px',
        fontWeight: 700,
        marginTop: '32px',
        marginBottom: '8px',
    },
    p: {
        fontSize: '14px',
        lineHeight: 1.7,
        color: color.inkSecondary,
    },
    ul: {
        fontSize: '14px',
        lineHeight: 1.7,
        color: color.inkSecondary,
        paddingLeft: '20px',
    },
};

const PrivacyPage = () => (
    <div style={styles.page}>
        <div style={styles.content}>
            <div style={styles.title}>Study Tracker 개인정보처리방침</div>
            <div style={styles.updated}>최종 업데이트: 2026년 8월 9일</div>

            <p style={styles.p}>
                Study Tracker(웹, Windows 에이전트, Chrome 확장 프로그램)는 사용자의 학습/작업 시간을
                측정하기 위해 아래와 같은 정보를 수집합니다.
            </p>

            <div style={styles.h2}>수집하는 정보</div>
            <ul style={styles.ul}>
                <li>Google 계정 정보: 이메일 주소, 이름, Google 계정 고유 ID (로그인 목적)</li>
                <li>기기 정보: 기기 이름, 기기 유형(PC/확장 프로그램)</li>
                <li>브라우저 방문 도메인 및 체류 시간 (Chrome 확장 프로그램 사용 시)</li>
                <li>PC 앱 사용 기록: 포커스된 앱 이름, 창 제목, 사용 시간 (Windows 에이전트 사용 시)</li>
                <li>학습 세션 기록: 시작/종료 시각, 학습 유형(온라인/오프라인)</li>
            </ul>

            <div style={styles.h2}>수집 목적</div>
            <p style={styles.p}>
                순공 시간(실제로 공부에 집중한 시간)을 자동으로 계산하고, 사용자에게 통계와 기록을
                제공하기 위한 목적으로만 사용합니다.
            </p>

            <div style={styles.h2}>보관 및 제3자 제공</div>
            <p style={styles.p}>
                수집된 정보는 AWS 서버에 저장되며, 서비스 제공 목적 외에는 사용하지 않습니다.
                제3자에게 판매하거나 제공하지 않습니다. 계정 삭제를 요청하시면 관련 데이터를 파기합니다.
            </p>

            <div style={styles.h2}>문의</div>
            <p style={styles.p}>
                개인정보 관련 문의는 <a href="mailto:studytracker0414@gmail.com">studytracker0414@gmail.com</a>으로
                연락해 주세요.
            </p>
        </div>
    </div>
);

export default PrivacyPage;
