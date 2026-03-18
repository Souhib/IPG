import { test, expect } from "@playwright/test";
import { generateTestAccounts } from "../../helpers/test-setup";
import {
  setupRoomWithPlayers,
  startGameViaAPI,
  isPageAlive,
  giveClue,
  guessCard,
  endTurnViaUI,
  findSpymaster,
  findOperative,
  type PlayerContext,
} from "../../helpers/ui-game-setup";
import { apiGetCodenamesBoard } from "../../helpers/api-client";

test.describe("Codenames Game Gameplay", () => {
  test("spymaster gives clue and operatives see it", async ({ browser }) => {
    const accounts = await generateTestAccounts(4);
    const setup = await setupRoomWithPlayers(browser, accounts, "codenames");
    await startGameViaAPI(setup.players, "codenames", setup.roomId);

    const gameId = setup.players[0].page.url().match(/\/game\/codenames\/([a-f0-9-]+)/)?.[1];
    expect(gameId).toBeTruthy();

    // Read board via API to determine current team + find spymaster/operative pages
    const board = await apiGetCodenamesBoard(gameId!, setup.players[0].login.access_token);
    const currentTeam = board.current_team;
    const spymaster = await findSpymaster(setup.players, gameId!, currentTeam);
    const operative = await findOperative(setup.players, gameId!, currentTeam);

    // Give clue via UI
    await giveClue(spymaster.page, "testclue", 1);

    // Verify operative can see the clue on their page
    if (isPageAlive(operative.page)) {
      await expect(
        operative.page.locator("text=testclue").first()
          .or(operative.page.locator("text=TESTCLUE").first()),
      ).toBeVisible({ timeout: 15_000 });
    }

    await setup.cleanup();
  });

  test("operative guesses correct card and it reveals", async ({ browser }) => {
    const accounts = await generateTestAccounts(4);
    const setup = await setupRoomWithPlayers(browser, accounts, "codenames");
    await startGameViaAPI(setup.players, "codenames", setup.roomId);

    const gameId = setup.players[0].page.url().match(/\/game\/codenames\/([a-f0-9-]+)/)?.[1];
    expect(gameId).toBeTruthy();

    // Read board via API for roles
    const board = await apiGetCodenamesBoard(gameId!, setup.players[0].login.access_token);
    const currentTeam = board.current_team;
    const spymaster = await findSpymaster(setup.players, gameId!, currentTeam);
    const operative = await findOperative(setup.players, gameId!, currentTeam);

    // Spymaster gives clue via UI
    await giveClue(spymaster.page, "hint", 1);

    // Read spymaster's board to find a team card word (spymaster can see card_type)
    const spymasterBoard = await apiGetCodenamesBoard(gameId!, spymaster.login.access_token);
    const teamCard = spymasterBoard.board.find(
      (c) => c.card_type === currentTeam && !c.revealed,
    );
    expect(teamCard).toBeTruthy();
    const teamCardWord = teamCard!.word;
    const teamCardIndex = spymasterBoard.board.indexOf(teamCard!);

    // Operative guesses via UI
    // guessCard() waits up to 30s for the card to be enabled (clue delivered via Socket.IO)
    await guessCard(operative.page, teamCardWord);

    // Verify the card is now revealed via API (poll until server processes)
    await expect.poll(async () => {
      const b = await apiGetCodenamesBoard(gameId!, setup.players[0].login.access_token);
      return b.board[teamCardIndex].revealed;
    }, { timeout: 15_000 }).toBe(true);

    // Remaining count should have decreased
    const updatedBoard = await apiGetCodenamesBoard(gameId!, setup.players[0].login.access_token);
    if (currentTeam === "red") {
      expect(updatedBoard.red_remaining).toBe(board.red_remaining - 1);
    } else {
      expect(updatedBoard.blue_remaining).toBe(board.blue_remaining - 1);
    }

    await setup.cleanup();
  });

  test("guessing assassin card ends game with opponent winning", async ({ browser }) => {
    const accounts = await generateTestAccounts(4);
    const setup = await setupRoomWithPlayers(browser, accounts, "codenames");
    await startGameViaAPI(setup.players, "codenames", setup.roomId);

    const gameId = setup.players[0].page.url().match(/\/game\/codenames\/([a-f0-9-]+)/)?.[1];
    expect(gameId).toBeTruthy();

    // Read board via API for roles
    const board = await apiGetCodenamesBoard(gameId!, setup.players[0].login.access_token);
    const currentTeam = board.current_team;
    const spymaster = await findSpymaster(setup.players, gameId!, currentTeam);
    const operative = await findOperative(setup.players, gameId!, currentTeam);

    // Give clue via UI
    await giveClue(spymaster.page, "danger", 1);

    // Find assassin card word from spymaster's board view
    const spymasterBoard = await apiGetCodenamesBoard(gameId!, spymaster.login.access_token);
    const assassinCard = spymasterBoard.board.find((c) => c.card_type === "assassin");
    expect(assassinCard).toBeTruthy();
    const assassinWord = assassinCard!.word;

    // Operative guesses the assassin via UI
    // guessCard() waits up to 30s for the card to be enabled (clue delivered via Socket.IO)
    await guessCard(operative.page, assassinWord);

    // At least one player should see "Game Over"
    const anyPage = setup.players.find((p) => isPageAlive(p.page))?.page;
    if (anyPage) {
      await expect(
        anyPage.locator('h2:has-text("Game Over")')
          .or(anyPage.locator('text=Game Over')),
      ).toBeVisible({ timeout: 15_000 });
    }

    // Verify via API that opponent won
    const finalBoard = await apiGetCodenamesBoard(gameId!, setup.players[0].login.access_token);
    expect(finalBoard.status).toBe("finished");
    const opponentTeam = currentTeam === "red" ? "blue" : "red";
    expect(finalBoard.winner).toBe(opponentTeam);

    await setup.cleanup();
  });

  test("end turn switches team", async ({ browser }) => {
    const accounts = await generateTestAccounts(4);
    const setup = await setupRoomWithPlayers(browser, accounts, "codenames");
    await startGameViaAPI(setup.players, "codenames", setup.roomId);

    const gameId = setup.players[0].page.url().match(/\/game\/codenames\/([a-f0-9-]+)/)?.[1];
    expect(gameId).toBeTruthy();

    // Read board via API to get current team AND player roles
    const board = await apiGetCodenamesBoard(gameId!, setup.players[0].login.access_token);
    const initialTeam = board.current_team;
    const otherTeam = initialTeam === "red" ? "blue" : "red";
    const spymaster = await findSpymaster(setup.players, gameId!, initialTeam);
    const operative = await findOperative(setup.players, gameId!, initialTeam);

    // Spymaster gives clue via UI
    await giveClue(spymaster.page, "pass", 1);

    // Operative ends turn via UI
    // endTurnViaUI() waits for the End Turn button to be visible (clue delivered via Socket.IO)
    await endTurnViaUI(operative.page);

    // Verify team switched via API (poll until server processes)
    await expect.poll(async () => {
      const b = await apiGetCodenamesBoard(gameId!, setup.players[0].login.access_token);
      return b.current_team;
    }, { timeout: 15_000 }).toBe(otherTeam);

    await setup.cleanup();
  });

  test("full game played to completion via UI", async ({ browser }) => {
    // Full game can take 15+ turns — increase timeout
    test.setTimeout(180_000);
    const accounts = await generateTestAccounts(4);
    const setup = await setupRoomWithPlayers(browser, accounts, "codenames");
    await startGameViaAPI(setup.players, "codenames", setup.roomId);

    const gameId = setup.players[0].page.url().match(/\/game\/codenames\/([a-f0-9-]+)/)?.[1];
    expect(gameId).toBeTruthy();

    // Play the game: each turn, spymaster gives clue via UI, operative guesses via UI
    for (let turn = 0; turn < 30; turn++) {
      // Read board via API to get current state
      const board = await apiGetCodenamesBoard(gameId!, setup.players[0].login.access_token);
      if (board.status === "finished") break;

      const currentTeam = board.current_team;

      let spymaster: PlayerContext;
      let operative: PlayerContext;
      try {
        spymaster = await findSpymaster(setup.players, gameId!, currentTeam);
        operative = await findOperative(setup.players, gameId!, currentTeam);
      } catch {
        break;
      }

      // Give clue via UI — may fail if game ended between API check and UI action
      try {
        await giveClue(spymaster.page, `clue${turn}`, 1);
      } catch {
        // Game likely ended — check and break
        const check = await apiGetCodenamesBoard(gameId!, setup.players[0].login.access_token);
        if (check.status === "finished") break;
        throw new Error("giveClue failed but game is not finished");
      }

      // Read spymaster's board to find a team card word
      const smBoard = await apiGetCodenamesBoard(gameId!, spymaster.login.access_token);
      if (smBoard.status === "finished") break;

      const teamCard = smBoard.board.find(
        (c) => c.card_type === currentTeam && !c.revealed,
      );

      if (teamCard) {
        // Check if game ended on this player's UI before attempting to guess
        const uiFinished = await operative.page
          .locator('h2:has-text("Game Over")').isVisible().catch(() => false);
        if (uiFinished) break;

        try {
          await guessCard(operative.page, teamCard.word);
        } catch {
          const check = await apiGetCodenamesBoard(gameId!, setup.players[0].login.access_token);
          if (check.status === "finished") break;
          throw new Error("guessCard failed but game is not finished");
        }
      }

      // Check if game ended or turn already switched after guess
      const afterGuess = await apiGetCodenamesBoard(gameId!, setup.players[0].login.access_token);
      if (afterGuess.status === "finished") break;

      // Only end turn if the current team hasn't changed (guess didn't auto-end turn)
      if (afterGuess.current_team === currentTeam) {
        await endTurnViaUI(operative.page).catch(() => {});
        // Wait for turn to actually switch or game to finish before next iteration
        await expect.poll(async () => {
          const b = await apiGetCodenamesBoard(gameId!, setup.players[0].login.access_token);
          return b.status === "finished" || b.current_team !== currentTeam;
        }, { timeout: 15_000 }).toBe(true);
      }
    }

    // Verify game finished
    const finalBoard = await apiGetCodenamesBoard(gameId!, setup.players[0].login.access_token);
    expect(finalBoard.status).toBe("finished");
    expect(finalBoard.winner).toBeTruthy();

    // Verify UI shows game over
    const anyPage = setup.players.find((p) => isPageAlive(p.page))?.page;
    if (anyPage) {
      await expect(
        anyPage.locator('h2:has-text("Game Over")')
          .or(anyPage.locator('text=Game Over')),
      ).toBeVisible({ timeout: 15_000 });
    }

    await setup.cleanup();
  });
});
