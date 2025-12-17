import { test, expect } from '@playwright/test';

test.describe('User Registration', () => {
    test('should register a new user with valid data', async ({ page }) => {
        // 1. Generate unique data
        const timestamp = Date.now();
        const newUser = {
            degree: 'Ing.',
            firstName: 'Test',
            lastName: 'User',
            username: `user_${timestamp}`,
            email: `user_${timestamp}@example.com`,
            phone: '123456789', // Simple format to avoid validation issues
            password: 'Password123!',
            street: 'Testovaci 123',
            flatNumber: '4',
            city: 'Praha',
            zip: '110 00', // Changed to standard format with space to ensure backend validation passes
            country: 'Ceska republika',
        };

        // 2. Navigate to register page
        await page.goto('/register');

        // 3. Fill Personal Info
        await page.getByLabel('Titul').fill(newUser.degree);
        // Use exact match because "Jméno *" is substring of "Uživatelské jméno *"
        await page.getByLabel('Jméno *', { exact: true }).fill(newUser.firstName);
        await page.getByLabel('Příjmení *').fill(newUser.lastName);

        // 4. Fill Account Info
        await page.getByLabel('Uživatelské jméno *').fill(newUser.username);
        await page.getByLabel('Email *').fill(newUser.email);
        await page.getByLabel('Telefon *').fill(newUser.phone);

        // 5. Fill Password
        // Use exact match because "Heslo *" is substring of "Potvrdit heslo *"
        await page.getByLabel('Heslo *', { exact: true }).fill(newUser.password);
        await page.getByLabel('Potvrdit heslo *').fill(newUser.password);

        // 6. Fill Address
        await page.getByLabel('Ulice a č. p. *').fill(newUser.street);
        await page.getByLabel('Číslo bytu').fill(newUser.flatNumber);
        await page.getByLabel('Obec *').fill(newUser.city);
        await page.getByLabel('PSČ *').fill(newUser.zip);
        await page.getByLabel('Země *').fill(newUser.country);

        // 7. Select Region (Radix UI)
        await page.getByLabel('Region *').click();
        await page.getByRole('option', { name: 'Praha' }).click();

        // 8. Submit
        await page.getByRole('button', { name: 'Zaregistrovat se' }).click();

        // 9. Assertions
        //await expect(page.getByText('Registrace selhala', { exact: true })).toBeHidden();

        // Expect redirection to home
        await expect(page).toHaveURL('/');

        // Verify logged in state (Avatar with initials should appear)
        const initials = (newUser.firstName[0] + newUser.lastName[0]).toUpperCase();
        await expect(page.getByRole('button', { name: initials })).toBeVisible();
    });

    test('should show validation errors for invalid data', async ({ page }) => {
        await page.goto('/register');
        await page.getByRole('button', { name: 'Zaregistrovat se' }).click();

        await expect(page.getByText('Uživatelské jméno musí mít alespoň 2 znaky')).toBeVisible();
        await expect(page.getByText('Neplatná emailová adresa')).toBeVisible();
        await expect(page.getByText('Heslo musí mít alespoň 6 znaků')).toBeVisible();
    });
});