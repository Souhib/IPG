import { createFileRoute } from "@tanstack/react-router"
import { Eye } from "lucide-react"
import { useTranslation } from "react-i18next"
import { ConnectionStatus } from "@/components/ConnectionStatus"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { GameErrorFallback } from "@/components/games/shared/GameErrorFallback"
import { PhaseTimer } from "@/components/games/shared/PhaseTimer"
import { ClueHistory } from "@/components/games/codenames/ClueHistory"
import { CluePanel } from "@/components/games/codenames/CluePanel"
import { CodenamesMyInfo } from "@/components/games/codenames/CodenamesMyInfo"
import { CodenamesPlayerList } from "@/components/games/codenames/CodenamesPlayerList"
import { GameBoard } from "@/components/games/codenames/GameBoard"
import { GameOverScreen } from "@/components/games/codenames/GameOverScreen"
import { GameOverTransition } from "@/components/games/codenames/GameOverTransition"
import { ScorePanel } from "@/components/games/codenames/ScorePanel"
import { useCodenamesGame } from "@/hooks/use-codenames-game"

export const Route = createFileRoute("/_auth/game/codenames/$gameId")({
  component: () => (
    <ErrorBoundary fallback={<GameErrorFallback />}>
      <CodenamesGamePage />
    </ErrorBoundary>
  ),
})

function CodenamesGamePage() {
  const { gameId } = Route.useParams()
  const { t } = useTranslation()

  const {
    user,
    gameState,
    serverState,
    isLoading,
    socketConnected,
    cancelMessage,
    showGameOverTransition,
    roomIdRef,
    clueWord,
    setClueWord,
    clueNumber,
    setClueNumber,
    isSubmittingClue,
    handleGiveClue,
    handleGuessCard,
    handleEndTurn,
    handleLeaveRoom,
    handleBackToRoom,
    handleHintViewed,
    handleTimerExpired,
    navigate,
  } = useCodenamesGame(gameId)

  if (cancelMessage) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="glass rounded-2xl border-border/30 p-8 text-center bg-destructive/10">
          <h2 className="text-xl font-extrabold tracking-tight text-destructive mb-2">{t("game.gameOver")}</h2>
          <p className="text-muted-foreground">{cancelMessage}</p>
          <p className="text-sm text-muted-foreground mt-2">Redirecting...</p>
        </div>
      </div>
    )
  }

  if (!gameState) {
    if (isLoading) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      )
    }
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="glass rounded-2xl border-border/30 p-8 text-center bg-destructive/10">
          <h2 className="text-xl font-extrabold tracking-tight text-destructive mb-2">{t("common.error")}</h2>
          <p className="text-muted-foreground">Failed to load game state. The game may no longer exist.</p>
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="mt-4 rounded-2xl bg-gradient-to-r from-primary to-primary/90 px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-all duration-200"
          >
            {t("common.goHome")}
          </button>
        </div>
      </div>
    )
  }

  const isSpectator = gameState.my_role === "spectator"
  const isMyTurn = !isSpectator && gameState.current_team === gameState.my_team
  const isSpymaster = gameState.my_role === "spymaster"
  const canGiveClue = isMyTurn && isSpymaster && !gameState.current_turn?.clue_word
  const canGuess = isMyTurn && !isSpymaster && !!gameState.current_turn?.clue_word

  const cardVotes = gameState.current_turn?.card_votes ?? {}
  const votedCount = Object.keys(cardVotes).length
  const totalOperatives = gameState.players.filter(
    (p) => p.team === gameState.current_team && p.role === "operative",
  ).length
  const isVotingActive = !!gameState.current_turn?.clue_word && totalOperatives > 1 && votedCount > 0 && gameState.status === "in_progress"

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 min-h-screen">
      <ConnectionStatus connected={socketConnected} />

      <GameOverTransition show={showGameOverTransition} />

      <ScorePanel
        redRemaining={gameState.red_remaining}
        blueRemaining={gameState.blue_remaining}
        currentTeam={gameState.current_team}
        currentTurn={gameState.current_turn}
        isMyTurn={isMyTurn}
        isFinished={gameState.status === "finished"}
      />

      {isSpectator && (
        <div className="mb-4 flex justify-center">
          <div className="glass inline-flex items-center gap-1.5 rounded-full border-border/30 px-4 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-200">
            <Eye className="h-3 w-3" />
            {t("game.spectating")}
          </div>
        </div>
      )}

      {serverState?.timer_config && serverState?.timer_started_at && gameState.status === "in_progress" &&
        (gameState.current_turn?.clue_word ? serverState.timer_config.guess_seconds : serverState.timer_config.clue_seconds) > 0 && (
        <div className="mb-4">
          <PhaseTimer
            timerStartedAt={serverState.timer_started_at}
            durationSeconds={
              gameState.current_turn?.clue_word
                ? serverState.timer_config.guess_seconds
                : serverState.timer_config.clue_seconds
            }
            onExpired={handleTimerExpired}
          />
        </div>
      )}

      {isVotingActive && (
        <div className="mb-4 glass rounded-2xl border-border/30 p-3 text-center text-sm text-muted-foreground transition-all duration-200">
          {t("game.codenames.votesProgress", { current: votedCount, total: totalOperatives })}
        </div>
      )}

      <GameBoard
        board={gameState.board}
        isSpymaster={isSpymaster}
        canGuess={canGuess}
        isFinished={gameState.status === "finished"}
        onGuessCard={handleGuessCard}
        cardVotes={cardVotes}
        currentUserId={user?.id}
        onHintViewed={handleHintViewed}
      />

      {canGiveClue && (
        <CluePanel
          clueWord={clueWord}
          clueNumber={clueNumber}
          isSubmitting={isSubmittingClue}
          onClueWordChange={setClueWord}
          onClueNumberChange={setClueNumber}
          onSubmit={handleGiveClue}
        />
      )}

      {canGuess && (
        <button
          type="button"
          onClick={handleEndTurn}
          className="w-full rounded-2xl border border-border/30 bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-2.5 text-sm font-medium text-primary hover:from-primary/20 hover:to-primary/10 transition-all duration-200"
        >
          {t("game.codenames.endTurn")}
        </button>
      )}

      {gameState.status === "finished" && gameState.winner && !showGameOverTransition && (
        <GameOverScreen
          winner={gameState.winner}
          roomId={roomIdRef.current}
          board={gameState.board}
          onBackToRoom={handleBackToRoom}
          onLeaveRoom={handleLeaveRoom}
        />
      )}

      <CodenamesPlayerList players={gameState.players} />

      {serverState?.clue_history && serverState.clue_history.length > 0 && (
        <ClueHistory history={serverState.clue_history} />
      )}

      {!isSpectator && gameState.my_team !== "spectator" && (
        <CodenamesMyInfo myTeam={gameState.my_team} myRole={gameState.my_role as "spymaster" | "operative"} />
      )}
    </div>
  )
}
