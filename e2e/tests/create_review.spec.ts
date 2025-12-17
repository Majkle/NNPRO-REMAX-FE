import { test, expect } from '@playwright/test';

test.describe('Review Creation', () => {

    test('should create a new review successfully', async ({ page }) => {
        // 1. Login as client
        await page.goto('/login');
        await page.getByLabel('Uživatelské jméno').fill('client');
        await page.getByLabel('Heslo').fill('password');
        await page.getByRole('button', { name: 'Přihlásit se' }).click();

        // Verify login success
        await expect(page).toHaveURL('/');

        // 2. Navigate to review creation page
        await page.goto('/reviews/new');

        // 3. Fill in the form

        // Select Makler "Petr Makléř"
        await page.getByLabel('Makléř').click();
        await page.getByRole('option', { name: /Petr Makléř/i }).click();

        // Set Rating (5 stars)
        // The form contains buttons: 1 Select trigger, 5 Star buttons, 1 Submit button.
        // We select the 5th star button (index 5 in the list of all form buttons: 0=Select, 1-5=Stars)
        await page.locator('form button').nth(5).click();

        // Fill Comment
        await page.getByLabel('Komentář').fill('Velmi profesionální přístup, makléř byl ochotný a vše vysvětlil.');

        // 4. Confirm the form
        await page.getByRole('button', { name: 'Odeslat recenzi' }).click();

        // 5. Assertions
        // Expect redirection to the reviews list page
        await expect(page).toHaveURL('/reviews');
    });
});