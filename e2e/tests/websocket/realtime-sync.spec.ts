import { test, expect } from "@playwright/test";
import { generateTestAccounts } from "../../helpers/test-setup";
import {
  setupRoomWithPlayers,
  startGameViaUI,
  isPageAlive,
} from "../../helpers/ui-game-setup";
import {
  apiLogin,
  apiCreateRoom,
  apiGetRoom,
  apiJoinRoom,
} from "../../helpers/api-client";
import { createPlayerPage } from "../../fixtures/auth.fixture";
import { ROUTES } from "../../helpers/constants";

test.describe("Real-time Sync via Socket.IO", () => {
  test("host sees new player join in real-time without refresh", async ({
    browser,
  }) => {
    const accounts = await generateTestAccounts(2);
    const logins = await Promise.all(
      accounts.map((a) => apiLogin(a.email, a.password))
    );

    // Host creates room and navigates to lobby
    const room = await apiCreateRoom(logins[0].access_token, "undercover");
    const roomDetails = await apiGetRoom(room.id, logins[0].access_token);
    const hostPage = await createPlayerPage(
      browser,
      accounts[0].email,
      accounts[0].password
    );
    await hostPage.goto(ROUTES.room(room.id));

    // Host sees "Players (1)"
    await expect(hostPage.locator("text=Players (1)")).toBeVisible({
      timeout: 10_000,
    });

    // Player 2 joins via API (simulates share link)
    await apiJoinRoom(
      roomDetails.public_id,
      logins[1].user.id,
      roomDetails.password,
      logins[1].access_token
    );

    // Player 2 navigates to room page (triggers notify_room_changed via Socket.IO connect)
    const player2Page = await createPlayerPage(
      browser,
      accounts[1].email,
      accounts[1].password
    );
    await player2Page.goto(ROUTES.room(room.id));

    // HOST should see "Players (2)" WITHOUT refresh — via Socket.IO room broadcast
    await expect(hostPage.locator("text=Players (2)")).toBeVisible({
      timeout: 10_000,
    });

    // Player 2 also sees "Players (2)"
    await expect(player2Page.locator("text=Players (2)")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("game start navigates all players to game page via Socket.IO", async ({
    browser,
  }) => {
    const accounts = await generateTestAccounts(3);
    // Setup: all players in room, all on room page
    const setup = await setupRoomWithPlayers(
      browser,
      accounts,
      "undercover"
    );

    // Verify all see each other
    for (const p of setup.players) {
      await expect(p.page.locator("text=Players (3)")).toBeVisible({
        timeout: 10_000,
      });
    }

    // Host starts game via UI
    await startGameViaUI(setup.players, "undercover");

    // ALL players should navigate to game page (tests game_updated + room_state with active_game_id)
    for (const p of setup.players) {
      if (!isPageAlive(p.page)) continue;
      await expect(p.page).toHaveURL(/\/game\/undercover\//, {
        timeout: 15_000,
      });
    }

    await setup.cleanup();
  });
});
