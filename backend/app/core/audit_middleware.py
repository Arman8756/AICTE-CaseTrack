"""Audit logging middleware — logs every mutating request."""
import uuid
from datetime import datetime, timezone
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from jose import JWTError
from app.core.security import decode_token
from app.db.session import SessionLocal
from app.models.audit_log import AuditLog

MUTATING_METHODS = {"POST", "PUT", "PATCH", "DELETE"}


class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        if request.method not in MUTATING_METHODS:
            return response
        if request.url.path.startswith("/api/v1/auth/login"):
            return response  # Don't log credentials

        # Extract user ID from token (best-effort, no hard failure)
        user_id = None
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            try:
                payload = decode_token(auth_header[7:])
                user_id = payload.get("sub")
            except JWTError:
                pass

        db = SessionLocal()
        try:
            log = AuditLog(
                id=uuid.uuid4(),
                user_id=user_id,
                action=f"{request.method.lower()}.{request.url.path.replace('/', '.').strip('.')}",
                entity_type=None,
                entity_id=None,
                ip_address=request.client.host if request.client else None,
                request_method=request.method,
                endpoint=request.url.path,
                payload_summary=None,
                performed_at=datetime.now(timezone.utc),
            )
            db.add(log)
            db.commit()
        except Exception:
            pass
        finally:
            db.close()

        return response
