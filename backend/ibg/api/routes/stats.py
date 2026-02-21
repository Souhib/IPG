from typing import Annotated, Sequence
from uuid import UUID

from fastapi import APIRouter, Depends, Query

from ibg.api.controllers.achievement import AchievementController
from ibg.api.controllers.stats import StatsController
from ibg.api.models.stats import UserAchievement, UserStats
from ibg.dependencies import get_achievement_controller, get_stats_controller

router = APIRouter(
    prefix="/stats",
    tags=["stats"],
    responses={404: {"description": "Not found"}},
)


@router.get("/users/{user_id}/stats", response_model=UserStats)
async def get_user_stats(
    *,
    user_id: UUID,
    stats_controller: Annotated[StatsController, Depends(get_stats_controller)],
) -> UserStats:
    """Get aggregated statistics for a user."""
    return await stats_controller.get_or_create_user_stats(user_id)


@router.get("/users/{user_id}/achievements", response_model=Sequence[UserAchievement])
async def get_user_achievements(
    *,
    user_id: UUID,
    achievement_controller: Annotated[
        AchievementController, Depends(get_achievement_controller)
    ],
) -> Sequence[UserAchievement]:
    """Get all achievements (earned and in-progress) for a user."""
    return await achievement_controller.get_user_achievements(user_id)


@router.get("/leaderboard", response_model=Sequence[UserStats])
async def get_leaderboard(
    *,
    stats_controller: Annotated[StatsController, Depends(get_stats_controller)],
    stat_field: str = Query(default="total_games_won", description="Stat field to rank by"),
    limit: int = Query(default=10, ge=1, le=100, description="Number of results"),
) -> Sequence[UserStats]:
    """Get the leaderboard ranked by a specific stat field."""
    return await stats_controller.get_leaderboard(stat_field=stat_field, limit=limit)
