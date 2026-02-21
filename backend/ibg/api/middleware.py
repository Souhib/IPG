import time
from uuid import uuid4

from loguru import logger
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

MAX_URL_PATH_LENGTH = 2048


class SecurityMiddleware(BaseHTTPMiddleware):
    """Middleware that adds security headers and sanitizes input.

    Adds the following headers:
    - X-Content-Type-Options: nosniff
    - X-Frame-Options: DENY
    - X-XSS-Protection: 1; mode=block

    Rejects requests with:
    - Null bytes in URL
    - Excessively long URL paths
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        # Input sanitization: reject null bytes in URL
        if "\x00" in str(request.url):
            logger.warning(f"Rejected request with null bytes in URL: {request.url.path[:100]}")
            return JSONResponse(status_code=400, content={"error": "Invalid request"})

        # Input sanitization: reject overlong URL paths
        if len(request.url.path) > MAX_URL_PATH_LENGTH:
            logger.warning(f"Rejected request with overlong URL path: {len(request.url.path)} chars")
            return JSONResponse(status_code=414, content={"error": "URI too long"})

        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Middleware that generates a unique request ID for each request.

    Adds an X-Request-ID header to both the request state and the response.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = str(uuid4())
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware that logs request start, completion, slow requests, and errors.

    Uses loguru for structured logging of each HTTP request.
    """

    SLOW_REQUEST_THRESHOLD_MS = 1000

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = getattr(request.state, "request_id", "N/A")

        logger.info(
            "Request started: {method} {path}",
            method=request.method,
            path=request.url.path,
            request_id=request_id,
            client_ip=request.client.host if request.client else "unknown",
            user_agent=request.headers.get("user-agent", "unknown"),
        )

        start_time = time.perf_counter()

        try:
            response = await call_next(request)
        except Exception:
            duration_ms = (time.perf_counter() - start_time) * 1000
            logger.error(
                "Request failed: {method} {path} {duration:.2f}ms",
                method=request.method,
                path=request.url.path,
                duration=duration_ms,
                request_id=request_id,
                exc_info=True,
            )
            raise

        duration_ms = (time.perf_counter() - start_time) * 1000

        logger.info(
            "Request completed: {method} {path} {status_code} {duration:.2f}ms",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration=duration_ms,
            request_id=request_id,
        )

        if duration_ms > self.SLOW_REQUEST_THRESHOLD_MS:
            logger.warning(
                "Slow request: {method} {path} took {duration:.2f}ms",
                method=request.method,
                path=request.url.path,
                duration=duration_ms,
                request_id=request_id,
            )

        return response
