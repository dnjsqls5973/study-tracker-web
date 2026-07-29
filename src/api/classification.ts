// src/api/classification.ts
import client from './client';

export interface Classification {
    id: number;
    type: string;
    value: string;
    category: string;
}

export const getClassifications = async (): Promise<Classification[]> => {
    const response = await client.get('/api/classifications');
    return response.data;
};

export const createClassification = async (
    type: string, value: string, category: string
): Promise<Classification> => {
    const response = await client.post('/api/classifications', { type, value, category });
    return response.data;
};

export const updateClassification = async (
    id: number, category: string
): Promise<Classification> => {
    const response = await client.patch(`/api/classifications/${id}`, { category });
    return response.data;
};

export const deleteClassification = async (id: number): Promise<void> => {
    await client.delete(`/api/classifications/${id}`);
};