import { test, expect } from '@playwright/test';

test('simple login debug', async ({ page }) => {
    // 1. Listen for console logs from the browser (helps see JS errors)
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));

    // 2. Go to page
    await page.goto('/login');

    // 3. Fill inputs
    await page.locator('input[name="username"]').fill('admin');
    await page.locator('input[name="password"]').fill('changeme1234');

    // 4. Set up a listener for the specific API call BEFORE clicking
    const loginRequestPromise = page.waitForRequest(request =>
            request.url().includes('/auth/login') && request.method() === 'POST',
        { timeout: 5000 }
    ).catch(() => null);

    // 5. Click the button
    console.log('Attempting to click submit...');
    await page.locator('button[type="submit"]').click();
    console.log('Click command sent.');

    // 6. Check loading state
    try {
        await expect(page.locator('button[type="submit"]')).toContainText('Přihlašování', { timeout: 2000 });
        console.log('SUCCESS: UI entered loading state.');
    } catch (e) {
        console.log('FAILURE: UI did not enter loading state.');
    }

    // 7. Check if request was made
    const request = await loginRequestPromise;
    if (request) {
        console.log('SUCCESS: Network request initiated to:', request.url());
        const response = await request.response();
        if (response) {
            console.log(`Backend Status: ${response.status()}`);
        }
    } else {
        console.log('FAILURE: No network request was initiated after click.');
    }

    // 8. Assert Login Redirect
    await expect(page).toHaveURL('/');

    // ---------------------------------------------------------
    // 9. Logout Flow (Updated)
    // ---------------------------------------------------------
    console.log('Attempting to logout...');

    // Target the specific user button by its visible text (Initials "JN")
    // This avoids conflict with the mobile menu button
    const userMenuButton = page.getByRole('button', { name: 'JN' });

    // Wait for it to be visible (ensures we are fully logged in and header is rendered)
    await expect(userMenuButton).toBeVisible();

    // Click to open the menu
    await userMenuButton.click();

    // Find the "Odhlásit se" option in the dropdown and click it
    // We use getByRole 'menuitem' for accessibility accuracy
    const logoutOption = page.getByRole('menuitem', { name: 'Odhlásit se' });
    await expect(logoutOption).toBeVisible();
    await logoutOption.click();

    // 10. Verify redirection back to login page
    await expect(page).toHaveURL('/login');
    console.log('SUCCESS: Logged out and redirected to login page.');
});