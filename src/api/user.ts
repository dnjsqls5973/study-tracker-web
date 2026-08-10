import client from './client';

export const deleteAccount = async (): Promise<void> => {
    await client.delete('/api/users/me');
};
