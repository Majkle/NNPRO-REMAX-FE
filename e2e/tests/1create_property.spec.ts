import { test, expect } from '@playwright/test';

test.describe('Property Creation', () => {

    test('should create a new real estate property successfully', async ({ page }) => {
        // 1. Login as realtor
        await page.goto('/login');
        await page.getByLabel('Uživatelské jméno').fill('realtor');
        await page.getByLabel('Heslo').fill('password');
        await page.getByRole('button', { name: 'Přihlásit se' }).click();

        // Verify login success
        await expect(page).toHaveURL('/');

        // 2. Navigate to property creation page
        await page.goto('/properties/new');

        // 3. Fill Basic Information
        await page.getByLabel('Nadpis *').fill('Exkluzivní vila s výhledem');
        await page.getByLabel('Popis *').fill('Nabízíme k prodeji luxusní vilu v klidné lokalitě s nádherným výhledem do okolí. Dům je po kompletní rekonstrukci.');

        // Select Type: House (Dům)
        await page.getByLabel('Typ *').click();
        await page.getByRole('option', { name: 'Dům', exact: true }).click();

        // Select Status: Available (Dostupné)
        await page.getByLabel('Stav *').click();
        await page.getByRole('option', { name: 'Dostupné' }).click();

        // Select Transaction: Sale (Prodej)
        await page.getByLabel('Typ transakce *').click();
        await page.getByRole('option', { name: 'Prodej' }).click();

        await page.getByLabel('Cena (Kč) *').fill('15000000');

        // 4. Fill Property Details
        await page.getByLabel('Velikost (m²) *').fill('250');
        await page.getByLabel('Počet pokojů *').fill('6');
        await page.getByLabel('Počet ložnic *').fill('4');
        await page.getByLabel('Počet koupelen *').fill('2');
        await page.getByLabel('Podlaží').fill('2');

        // Date picker - Type directly
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateString = tomorrow.toISOString().split('T')[0];
        await page.getByLabel('Dostupné od').fill(dateString);

        // 5. Fill Financial Details (Selects)
        await page.getByLabel('Způsob zveřejnění ceny *').click();
        await page.getByRole('option', { name: 'Nezveřejněno' }).click();

        await page.getByLabel('Provize *').click();
        // FIXED: Use exact match to avoid matching "Nezahrnuta"
        await page.getByRole('option', { name: 'Zahrnuta', exact: true }).click();

        await page.getByLabel('Daně *').click();
        // FIXED: Use exact match to avoid matching "Nezahrnuty"
        await page.getByRole('option', { name: 'Zahrnuty', exact: true }).click();

        await page.getByLabel('Vybavení *').click();
        await page.getByRole('option', { name: 'Částečně zařízeno' }).click();

        // 6. Fill Building Properties
        await page.getByLabel('Materiál stavby *').click();
        await page.getByRole('option', { name: 'Cihla' }).click();

        await page.getByLabel('Stav budovy *').click();
        await page.getByRole('option', { name: 'Zrekonstruovaná' }).click();

        await page.getByLabel('Energetická třída *').click();
        await page.getByRole('option', { name: 'B' }).click();

        await page.getByLabel('Lokace budovy *').click();
        await page.getByRole('option', { name: 'Předměstí' }).click();

        // 7. Address
        await page.getByLabel('Ulice a číslo popisné *').fill('Slunečná 42');
        await page.getByLabel('Město *').fill('Brno');
        await page.getByLabel('PSČ *').fill('602 00');
        await page.getByLabel('Země *').fill('Česká republika');

        await page.getByLabel('Kraj *').click();
        await page.getByRole('option', { name: 'Jihomoravský' }).click();

        // 8. Utilities & Features (MultiCheckboxField)
        await page.locator('.flex.flex-row').filter({ hasText: /^Voda$/ }).locator('input[type="checkbox"]').check();
        await page.locator('.flex.flex-row').filter({ hasText: /^Elektřina$/ }).locator('input[type="checkbox"]').check();
        await page.locator('.flex.flex-row').filter({ hasText: /^Kanalizace$/ }).locator('input[type="checkbox"]').check();
        await page.locator('.flex.flex-row').filter({ hasText: /^Silnice$/ }).locator('input[type="checkbox"]').check();

        // 9. Submit the form
        await page.getByRole('button', { name: 'Přidat nemovitost' }).click();

        // 10. Assertions
        await expect(page).toHaveURL('/properties');
    });
});