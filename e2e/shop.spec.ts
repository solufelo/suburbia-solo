import { expect, test } from "@playwright/test";

test("shop flow: product page, persisted cart, custom board, demo checkout", async ({ page }) => {
  // Homepage grid links to real product pages.
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/escape the cul-de-sac/i);
  const grid = page.locator('[data-slice-type="product_grid"]');
  await expect(grid.getByTestId("product-card")).toHaveCount(4);
  await grid.getByRole("link", { name: "Oni Mask" }).click();

  // Product page with its own SEO metadata.
  await expect(page).toHaveURL(/\/boards\/oni-mask$/);
  await expect(page.getByRole("heading", { level: 1, name: "Oni Mask" })).toBeVisible();
  await expect(page).toHaveTitle(/Oni Mask complete skateboard/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/boards\/oni-mask$/);
  const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(JSON.parse(jsonLd!)[0]).toMatchObject({ "@type": "Product", offers: { price: "59.99" } });

  // Add two to the cart; the drawer opens with the line.
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await page.getByTestId("add-oni-mask").click();
  const drawer = page.getByTestId("cart-drawer");
  await expect(drawer).toBeVisible();
  await expect(drawer.getByTestId("cart-line")).toHaveCount(1);
  await expect(drawer.getByTestId("cart-subtotal")).toHaveText("$119.98");
  await page.keyboard.press("Escape");

  // The cart survives a reload.
  await page.reload();
  await expect(page.getByTestId("cart-button")).toHaveAccessibleName("Cart (2 items)");

  // The builder opens on a preset design and saves it to the cart.
  await page.goto("/build?deck=pink-swirl&wheel=pink&truck=gold");
  await expect(page.getByRole("radio", { name: "Pink Drop" })).toBeChecked();
  await expect(page.getByRole("radio", { name: "Gold" }).first()).toBeChecked();
  await page.getByTestId("build-add").click();
  await expect(drawer.getByTestId("cart-line")).toHaveCount(2);
  await expect(drawer).toContainText("Pink Drop deck · Pink wheels · Gold trucks");
  await expect(drawer.getByTestId("cart-subtotal")).toHaveText("$179.97");

  // Demo checkout: clearly labelled, validated, re-priced on the server.
  await drawer.getByRole("link", { name: "Checkout" }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByTestId("mode-banner")).toContainText("Demo checkout");
  await expect(page.getByTestId("checkout-total")).toHaveText("$179.97");

  await page.getByLabel("Full name").fill("Sam Rider");
  await page.getByLabel("Email").fill("sam@example.com");
  await page.getByLabel("Street address").fill("1 Main St");
  await page.getByLabel("City").fill("Brampton");
  await page.getByLabel("Province / state").fill("ON");
  await page.getByLabel("Postal / ZIP code").fill("L6Y 1A1");
  await page.getByTestId("place-order").click();

  await expect(page).toHaveURL(/\/checkout\/success\?order=SUB-[A-Z0-9]{8}$/);
  await expect(page.getByTestId("order-id")).toHaveText(/^SUB-[A-Z0-9]{8}$/);
  await expect(page.getByTestId("demo-note")).toContainText("nothing was charged");
  await expect(page.getByText("$179.97")).toBeVisible();
  await expect(page.getByTestId("cart-button")).toHaveAccessibleName("Cart (0 items)");
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("product page fits without sideways scrolling and shows card buttons without hover", async ({ page }) => {
    await page.goto("/boards/green-navy");
    await expect(page.getByRole("heading", { level: 1, name: "Green Navy" })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    // "More boards" tiles: touch screens get visible buttons, not a hover overlay.
    const card = page.getByTestId("product-card").filter({ hasText: "Oni Mask" });
    await card.scrollIntoViewIfNeeded();
    await expect(card.getByTestId("add-oni-mask")).toBeVisible();
    await expect(card.getByTestId("add-oni-mask")).toHaveCSS("opacity", "1");
  });
});
