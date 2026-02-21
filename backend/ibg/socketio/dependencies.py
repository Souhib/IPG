"""Singleton holders for expensive shared resources in the Socket.IO layer.

Uses a module-level dict as a container — Python modules are singletons,
so no `global` keyword is needed. Resources are lazily initialized on first access.
"""

from ibg.database import get_redis_om_connection
from ibg.settings import Settings

_cache: dict = {}


def get_redis_connection_singleton():
    """Return the shared Redis connection, creating it on first call."""
    if "redis" not in _cache:
        _cache["redis"] = get_redis_om_connection()
    return _cache["redis"]


def get_settings_singleton() -> Settings:
    """Return the shared Settings instance, creating it on first call."""
    if "settings" not in _cache:
        _cache["settings"] = Settings()  # type: ignore
    return _cache["settings"]
