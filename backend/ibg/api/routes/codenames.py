from typing import Sequence
from uuid import UUID

from fastapi import APIRouter, Depends

from ibg.api.controllers.codenames import CodenamesController
from ibg.api.models.codenames import (
    CodenamesWord,
    CodenamesWordCreate,
    CodenamesWordPack,
    CodenamesWordPackCreate,
)
from ibg.dependencies import get_codenames_controller

router = APIRouter(
    prefix="/codenames",
    tags=["Codenames"],
    responses={404: {"description": "Not found"}},
)


# --- Word Packs ---


@router.post("/word-packs", response_model=CodenamesWordPack, status_code=201)
async def create_word_pack(
    *,
    word_pack_create: CodenamesWordPackCreate,
    codenames_controller: CodenamesController = Depends(get_codenames_controller),
) -> CodenamesWordPack:
    """Create a new Codenames word pack."""
    return await codenames_controller.create_word_pack(word_pack_create)


@router.get("/word-packs", response_model=Sequence[CodenamesWordPack])
async def get_word_packs(
    *,
    codenames_controller: CodenamesController = Depends(get_codenames_controller),
) -> Sequence[CodenamesWordPack]:
    """List all Codenames word packs."""
    return await codenames_controller.get_word_packs()


@router.get("/word-packs/{pack_id}", response_model=CodenamesWordPack)
async def get_word_pack(
    *,
    pack_id: UUID,
    codenames_controller: CodenamesController = Depends(get_codenames_controller),
) -> CodenamesWordPack:
    """Get a specific Codenames word pack by ID."""
    return await codenames_controller.get_word_pack(pack_id)


@router.delete("/word-packs/{pack_id}", response_model=None, status_code=204)
async def delete_word_pack(
    *,
    pack_id: UUID,
    codenames_controller: CodenamesController = Depends(get_codenames_controller),
) -> None:
    """Delete a Codenames word pack by ID."""
    await codenames_controller.delete_word_pack(pack_id)


# --- Words ---


@router.post("/word-packs/{pack_id}/words", response_model=CodenamesWord, status_code=201)
async def add_word_to_pack(
    *,
    pack_id: UUID,
    word_create: CodenamesWordCreate,
    codenames_controller: CodenamesController = Depends(get_codenames_controller),
) -> CodenamesWord:
    """Add a word to a Codenames word pack."""
    return await codenames_controller.add_word(word_create, pack_id)


@router.get("/word-packs/{pack_id}/words", response_model=Sequence[CodenamesWord])
async def get_words_by_pack(
    *,
    pack_id: UUID,
    codenames_controller: CodenamesController = Depends(get_codenames_controller),
) -> Sequence[CodenamesWord]:
    """List all words in a Codenames word pack."""
    return await codenames_controller.get_words_by_pack(pack_id)


@router.delete("/words/{word_id}", response_model=None, status_code=204)
async def delete_word(
    *,
    word_id: UUID,
    codenames_controller: CodenamesController = Depends(get_codenames_controller),
) -> None:
    """Delete a Codenames word by ID."""
    await codenames_controller.delete_word(word_id)
