import { Page } from '@playwright/test';

export const injectAuth = async (page: Page, role: 'ADMIN' | 'AGENT' | 'CLIENT' = 'ADMIN') => {
    const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@remax.xxx',
        role: role,
        personalInformation: {
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '123456789'
        }
    };

    const mockToken = 'mock-jwt-token-for-e2e';

    await page.addInitScript(({ user, token }) => {
        window.localStorage.setItem('user', JSON.stringify(user));
        window.localStorage.setItem('token', token);
    }, { user: mockUser, token: mockToken });
};