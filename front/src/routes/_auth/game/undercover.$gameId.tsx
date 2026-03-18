import { createFileRoute } from "@tanstack/react-router"
import { Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { ConnectionStatus } from "@/components/ConnectionStatus"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { GameErrorFallback } from "@/components/games/shared/GameErrorFallback"
import { PhaseTimer } from "@/components/games/shared/PhaseTimer"
import { DescriptionPhase } from "@/components/games/undercover/DescriptionPhase"
import { EliminationOverlay } from "@/components/games/undercover/EliminationOverlay"
import { GameOverScreen } from "@/components/games/undercover/GameOverScreen"
import { RoleRevealPhase } from "@/components/games/undercover/RoleRevealPhase"
import { UndercoverGameHeader } from "@/components/games/undercover/UndercoverGameHeader"
import { UndercoverLeaveButton } from "@/components/games/undercover/UndercoverLeaveButton"
import { UndercoverPlayerList } from "@/components/games/undercover/UndercoverPlayerList"
import { UndercoverTransitionOverlay } from "@/components/games/undercover/UndercoverTransitionOverlay"
import { VoteHistory } from "@/components/games/undercover/VoteHistory"
import { VotingPhase } from "@/components/games/undercover/VotingPhase"
import { useUndercoverGame } from "@/hooks/use-undercover-game"

export const Route = createFileRoute("/_auth/game/undercover/$gameId")({
  component: () => (
    <ErrorBoundary fallback={<GameErrorFallback />}>
      <UndercoverGamePage />
    </ErrorBoundary>
  ),
})

function UndercoverGamePage() {
  const { gameId } = Route.useParams()
  const { t } = useTranslation()

  const {
    gameState,
    serverState,
    isLoading,
    socketConnected,
    cancelMessage,
    isAlive,
    isSpectator,
    isMyTurnToDescribe,
    hasVoted,
    selectedVote,
    descriptionInput,
    descriptionError,
    isSubmittingDescription,
    showVotingTransition,
    showGameOverTransition,
    showEliminationOverlay,
    eliminationData,
    roomIdRef,
    user,
    handleSelectPlayer,
    handleConfirmVote,
    handleSubmitDescription,
    handleDismissRole,
    handleHintViewed,
    handleTimerExpired,
    handleLeaveRoom,
    handleBackToRoom,
    handleDismissElimination,
    handleDescriptionInputChange,
  } = useUndercoverGame(gameId)

  if (cancelMessage) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="glass rounded-2xl border-border/30 p-8 text-center bg-destructive/10">
          <h2 className="text-xl font-extrabold tracking-tight text-destructive mb-2">{t("game.gameOver")}</h2>
          <p className="text-muted-foreground">{cancelMessage}</p>
          <p className="text-sm text-muted-foreground mt-2">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 min-h-screen">
      <ConnectionStatus connected={socketConnected} />

      <UndercoverTransitionOverlay type="game_over" show={showGameOverTransition} />
      <UndercoverTransitionOverlay type="voting" show={showVotingTransition} />

      <UndercoverGameHeader round={gameState.round} isSpectator={isSpectator} />

      {isLoading && !gameState.my_role && (
        <div className="glass rounded-2xl border-border/30 p-8 text-center mb-8 transition-all duration-200">
          <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      )}

      {gameState.phase === "role_reveal" && gameState.my_role && !isSpectator && (
        <RoleRevealPhase
          myRole={gameState.my_role}
          myWord={gameState.my_word}
          myWordHint={serverState?.my_word_hint ?? null}
          onHintViewed={handleHintViewed}
          onDismiss={handleDismissRole}
        />
      )}

      {serverState?.timer_config && serverState?.timer_started_at && (gameState.phase === "describing" || gameState.phase === "playing") &&
        (gameState.phase === "describing" ? serverState.timer_config.description_seconds : serverState.timer_config.voting_seconds) > 0 && (
        <div className="mb-4">
          <PhaseTimer
            timerStartedAt={serverState.timer_started_at}
            durationSeconds={
              gameState.phase === "describing"
                ? serverState.timer_config.description_seconds
                : serverState.timer_config.voting_seconds
            }
            onExpired={handleTimerExpired}
          />
        </div>
      )}

      {gameState.phase === "describing" && (
        <DescriptionPhase
          myRole={gameState.my_role}
          myWord={gameState.my_word}
          myWordHint={serverState?.my_word_hint ?? null}
          onHintViewed={handleHintViewed}
          descriptionOrder={gameState.descriptionOrder}
          currentDescriberIndex={gameState.currentDescriberIndex}
          descriptions={gameState.descriptions}
          currentUserId={user?.id}
          isMyTurnToDescribe={isMyTurnToDescribe}
          isAlive={isAlive}
          descriptionInput={descriptionInput}
          descriptionError={descriptionError}
          isSubmittingDescription={isSubmittingDescription}
          onDescriptionInputChange={handleDescriptionInputChange}
          onSubmitDescription={handleSubmitDescription}
        />
      )}

      {gameState.phase === "playing" && (
        <VotingPhase
          players={gameState.players}
          myRole={gameState.my_role}
          myWord={gameState.my_word}
          myWordHint={serverState?.my_word_hint ?? null}
          onHintViewed={handleHintViewed}
          descriptions={gameState.descriptions}
          descriptionOrder={gameState.descriptionOrder}
          isAlive={isAlive}
          hasVoted={hasVoted}
          selectedVote={selectedVote}
          votedPlayers={gameState.votedPlayers}
          currentUserId={user?.id}
          onSelectPlayer={handleSelectPlayer}
          onConfirmVote={handleConfirmVote}
        />
      )}

      {showEliminationOverlay && eliminationData && (
        <EliminationOverlay
          eliminatedUsername={eliminationData.username}
          eliminatedRole={eliminationData.role}
          votes={eliminationData.votes}
          onDismiss={handleDismissElimination}
        />
      )}

      {gameState.phase === "game_over" && !showGameOverTransition && (
        <GameOverScreen
          winner={gameState.winner}
          roomId={roomIdRef.current}
          wordExplanations={serverState?.word_explanations}
          onBackToRoom={handleBackToRoom}
          onLeaveRoom={handleLeaveRoom}
        />
      )}

      {serverState?.vote_history && serverState.vote_history.length > 0 && (
        <VoteHistory history={serverState.vote_history} />
      )}

      <UndercoverPlayerList players={gameState.players} />

      {gameState.phase !== "game_over" && gameState.phase !== "role_reveal" && (
        <UndercoverLeaveButton onLeave={handleLeaveRoom} />
      )}
    </div>
  )
}
