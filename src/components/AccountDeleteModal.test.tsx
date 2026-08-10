import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AccountDeleteModal from './AccountDeleteModal';
import { deleteAccount } from '../api/user';

const mockNavigate = jest.fn();

jest.mock('../api/user');
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

describe('AccountDeleteModal', () => {
    const mockDeleteAccount = deleteAccount as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.setItem('accessToken', 'fake-token');
    });

    it('삭제 확인 시 계정을 삭제하고 로컬스토리지를 비운 뒤 로그인 페이지로 이동한다', async () => {
        mockDeleteAccount.mockResolvedValue(undefined);
        render(<AccountDeleteModal onCancel={jest.fn()} />);

        fireEvent.click(screen.getByText('삭제'));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
        expect(mockDeleteAccount).toHaveBeenCalledTimes(1);
        expect(localStorage.getItem('accessToken')).toBeNull();
    });

    it('삭제 실패 시 에러 메시지를 보여주고 이동하지 않는다', async () => {
        mockDeleteAccount.mockRejectedValue({ response: { data: { message: '서버 오류' } } });
        render(<AccountDeleteModal onCancel={jest.fn()} />);

        fireEvent.click(screen.getByText('삭제'));

        await waitFor(() => {
            expect(screen.getByText('서버 오류').textContent).toBe('서버 오류');
        });
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(localStorage.getItem('accessToken')).toBe('fake-token');
    });

    it('취소 버튼 클릭 시 onCancel이 호출된다', () => {
        const onCancel = jest.fn();
        render(<AccountDeleteModal onCancel={onCancel} />);

        fireEvent.click(screen.getByText('취소'));

        expect(onCancel).toHaveBeenCalledTimes(1);
    });
});
