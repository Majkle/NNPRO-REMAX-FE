import { test, expect } from '@playwright/test';

test.describe('Appointment Creation', () => {

    test('should create a new offline appointment successfully', async ({ page }) => {
        // 1. Login as client
        await page.goto('/login');
        await page.getByLabel('Uživatelské jméno').fill('client');
        await page.getByLabel('Heslo').fill('password');
        await page.getByRole('button', { name: 'Přihlásit se' }).click();

        // Verify login success before proceeding
        await expect(page).toHaveURL('/');

        // 2. Navigate to appointments creation page
        await page.goto('/appointments/new');

        // 3. Fill in the appointment form
        await page.getByLabel('Nadpis schůzky').fill('Prohlídka se zájmem o koupi');
        await page.getByLabel('Popis (volitelné)').fill('Mám vážný zájem o tuto nemovitost, prosím o termín.');

        // 4. Select Makler "Petr Makléř"
        await page.getByLabel('Makléř').click();
        await page.getByRole('option', { name: /Petr Makléř/i }).click();

        // 5. Select the first property
        await page.getByLabel('Nemovitost').click();
        await page.locator('[role="option"]').first().click();

        // 6. Set day (Calendar)
        await page.getByLabel('Datum').click();
        // Wait for calendar popover to appear
        const calendar = page.getByRole('dialog');
        await expect(calendar).toBeVisible();
        // Select the date after today (2nd available enabled day button)
        // We target buttons inside the calendar grid that are not disabled
        await calendar.getByRole('gridcell').locator('button:not([disabled])').nth(1).click();

        // 7. Set time
        await page.getByLabel('Čas schůzky').fill('14:00');

        // 8. Confirm the form
        await page.getByRole('button', { name: 'Rezervovat schůzku' }).click();

        // 9. Assertions
        await expect(page).toHaveURL('/appointments');
    });
});