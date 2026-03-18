import { test, expect } from "../../fixtures/auth.fixture";
import AxeBuilder from "@axe-core/playwright";
import { ROUTES } from "../../helpers/constants";

test.describe("Accessibility — Room Lobby", () => {
  test("rooms page has no critical or serious violations", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto(ROUTES.rooms);
    await authenticatedPage.waitForLoadState("domcontentloaded");
    // Wait for actual content to render
    await expect(
      authenticatedPage.getByRole('heading', { name: 'Rooms', level: 1 }),
    ).toBeVisible({ timeout: 10_000 });
    // Wait for framer-motion entry animations to complete (opacity 0→1)
    // so axe-core computes foreground colors at full opacity
    await authenticatedPage.waitForTimeout(1000);

    const results = await new AxeBuilder({ page: authenticatedPage })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const criticalViolations = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );

    expect(criticalViolations).toEqual([]);
  });
});
