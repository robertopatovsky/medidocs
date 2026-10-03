import { expect, test } from '@playwright/test';

test('public page preserves responsive layout and theme handoff', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.locator('.theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('.theme-toggle')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  const links = await page
    .locator('.app-link')
    .evaluateAll((items) => items.map((link) => link.href));
  expect(links.length).toBeGreaterThan(0);
  for (const href of links) {
    expect(new URL(href).origin).toBe('https://app.medidocs.sk');
    expect(new URL(href).searchParams.get('theme')).toBe('dark');
  }
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
