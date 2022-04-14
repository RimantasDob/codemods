import { test, expect } from '@playwright/test';

test('@testas basic test', async ({ page, context }) => {
    await page.goto('https://playwright.dev/');
    const name = await page.innerText('.navbar__title');
    expect(name).toBe('Playwright');
    const cookies = await context.cookies();
    await context.clearCookies();
    await page.locator('sadad').waitFor();
    console.log(cookies);
    await page.locator('asasa').waitFor({ state: 'attached' });
    await Promise.all(
        Array(5)
            .fill(0)
            .map((i, j) => i + j)
            .map(i => this.page.locator('ff').nth(i).waitFor({ state: 'hidden', timeout }))
    );
});
