// src/pages/TermsPage.tsx
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

const TermsPage = () => (
    <div style={styles.page}>
        <div style={styles.content}>
            <div style={styles.title}>Study Tracker 이용약관</div>
            <div style={styles.updated}>최종 업데이트: 2026년 8월 11일</div>

            <p style={styles.p}>
                이 약관은 Study Tracker(웹, Windows 에이전트, Chrome 확장 프로그램, 이하 "서비스")를
                이용하는 데 적용되는 조건을 안내합니다.
            </p>

            <div style={styles.h2}>서비스의 내용</div>
            <p style={styles.p}>
                서비스는 학습/작업 시간을 자동으로 측정하고 기록·통계를 제공하는 개인 프로젝트입니다.
                운영자는 서비스의 내용을 사전 고지 없이 추가, 변경하거나 중단할 수 있습니다.
            </p>

            <div style={styles.h2}>이용계약의 성립</div>
            <p style={styles.p}>
                이용자는 Google 계정으로 로그인함으로써 이 약관에 동의하고 서비스 이용을 시작합니다.
            </p>

            <div style={styles.h2}>이용자의 의무</div>
            <ul style={styles.ul}>
                <li>본인의 Google 계정으로만 이용하며, 계정을 타인과 공유하지 않습니다.</li>
                <li>서비스의 정상적인 운영을 방해하는 행위(비정상적인 대량 요청, 시스템 취약점 악용 등)를 하지 않습니다.</li>
                <li>관련 법령 및 이 약관을 준수합니다.</li>
            </ul>

            <div style={styles.h2}>서비스 제공의 중단</div>
            <p style={styles.p}>
                서버 점검, 장애, 운영자의 사정 등으로 서비스 제공이 일시적으로 또는 영구적으로
                중단될 수 있습니다. 서비스는 무료로 제공되며, 이로 인한 손해에 대해 운영자는
                책임을 지지 않습니다.
            </p>

            <div style={styles.h2}>계정 해지</div>
            <p style={styles.p}>
                이용자는 설정 페이지에서 언제든지 직접 계정을 삭제할 수 있습니다. 계정을 삭제하면
                관련 데이터는 즉시 파기되며 복구할 수 없습니다. 이용자가 이 약관을 위반한 경우
                운영자는 사전 통지 없이 이용을 제한할 수 있습니다.
            </p>

            <div style={styles.h2}>책임의 한계</div>
            <p style={styles.p}>
                서비스는 개인이 운영하는 무료 프로젝트로, 어떠한 형태의 보증도 제공하지 않습니다.
                기록된 학습 시간의 정확도, 서비스의 지속적인 가용성에 대해 보증하지 않으며,
                서비스 이용 중 발생한 손해에 대해 운영자는 고의 또는 중대한 과실이 없는 한
                책임을 지지 않습니다.
            </p>

            <div style={styles.h2}>약관의 변경</div>
            <p style={styles.p}>
                이 약관은 필요 시 개정될 수 있으며, 개정 시 이 페이지를 통해 공지합니다.
                개정된 약관은 공지 시점부터 효력이 발생합니다.
            </p>

            <div style={styles.h2}>문의</div>
            <p style={styles.p}>
                약관 관련 문의는 <a href="mailto:studytracker0414@gmail.com">studytracker0414@gmail.com</a>으로
                연락해 주세요.
            </p>
        </div>
    </div>
);

export default TermsPage;
