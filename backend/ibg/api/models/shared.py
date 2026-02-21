from ibg.api.schemas.shared import BaseModel


class DBModel(BaseModel):
    """Backward-compatible alias for BaseModel.

    All new code should use BaseModel or BaseTable from ibg.api.schemas.shared directly.
    """

    pass
