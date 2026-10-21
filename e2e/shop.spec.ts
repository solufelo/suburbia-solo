import { expect, test } from "@playwright/test";

test("shop flow: product page, persisted cart, custom board, demo checkout", async ({ page }) => {
  // Homepage grid links to real product pages.
  await page.goto("/");
  // The cut-out letters are decoration; the heading's accessible name is the plain line.
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(/^escape the cul-de-sac$/i);
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

  // Submitting blank shows the page's own field errors, not browser tooltips.
  await page.getByTestId("place-order").click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.locator("#checkout-error")).toContainText("highlighted fields");
  await expect(page.getByText("Add an email for the receipt.")).toBeVisible();
  await expect(page.getByLabel("Full name")).toBeFocused();

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

test("unknown URLs get the branded 404, not the framework default", async ({ page }) => {
  const res = await page.goto("/definitely-not-a-page");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/bailed/i);
  await expect(page.getByRole("link", { name: "Shop boards" })).toBeVisible();
  await expect(page.getByTestId("cart-button")).toBeVisible();
});

test.describe("phone UX", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("builder fits one screen: part tabs, swipe rails, shuffle, add to cart", async ({ page }) => {
    await page.goto("/build?deck=oni-mask&wheel=cream&truck=silver&bolt=silver");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    // The add bar is on screen without scrolling.
    await expect(page.getByTestId("build-add")).toBeInViewport();

    // One part at a time: decks first, wheels behind their tab.
    await expect(page.getByRole("radio", { name: "Oni Mask" })).toBeChecked();
    await expect(page.getByRole("radio", { name: "Pink", exact: true })).toBeHidden();
    await page.getByRole("tab", { name: /Wheels/ }).click();
    await expect(page.getByRole("tab", { name: /Wheels/ })).toHaveAttribute("aria-selected", "true");
    // The input is visually hidden under its swatch; tap the swatch like a person would.
    await page.locator('label[title="Pink"]').click();
    await expect(page.getByRole("radio", { name: "Pink", exact: true })).toBeChecked();
    await expect(page.getByRole("tab", { name: /Wheels/ })).toContainText("Pink");

    // Shuffle always lands on a different design (the tabs show all four parts).
    const tabs = page.getByRole("tablist", { name: "Board parts" });
    const before = (await tabs.textContent()) ?? "";
    await page.getByRole("button", { name: /Shuffle/ }).click();
    await expect(tabs).not.toHaveText(before);

    await page.getByTestId("build-add").click();
    await expect(page.getByTestId("cart-drawer").getByTestId("cart-line")).toHaveCount(1);
  });

  test("full-screen menu and the sticky buy bar on product pages", async ({ page }) => {
    await page.goto("/boards/oni-mask");
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("navigation", { name: "Mobile" });
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: /Shop/ }).click();
    await expect(page).toHaveURL(/\/boards$/);

    await page.goto("/boards/oni-mask");
    const sticky = page.getByTestId("sticky-add-oni-mask");
    await expect(sticky).not.toBeInViewport();
    await page.getByRole("heading", { name: "In the box" }).scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 600);
    await expect(sticky).toBeInViewport();
    await sticky.click();
    await expect(page.getByTestId("cart-drawer").getByTestId("cart-line")).toHaveCount(1);
  });
});
