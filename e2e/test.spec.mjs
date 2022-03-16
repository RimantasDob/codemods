import { test, expect } from '@playwright/test';

test.describe('First describe ever', () => {
    test('@testas starting first test', async ({ page }) => {
        await page.goto('https://www.1stdibs.com');
        const text = await page.locator('[data-tn=main-nav-bottom]').innerText();
        console.log(text);
        await page.pause();
    });
});
