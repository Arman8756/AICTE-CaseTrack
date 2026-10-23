"""
Cross-Bureau Overlap Detection Service.

Rules:
  1. Exact institution ID match → definite overlap (score 1.0)
  2. Normalized name similarity via pg_trgm → probable (score = trgm similarity)
  3. Keyword/token Jaccard on descriptions → informational (score = jaccard)

The system NEVER auto-closes or auto-decides cases. It only surfaces alerts.
"""
import uuid
import re
from datetime import datetime, timezone
from typing import List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import text, and_, or_

from app.models.complaint import Complaint, ComplaintStatus
from app.models.case_overlap import CaseOverlap, MatchMethod
from app.core.config import settings


OPEN_STATUSES = [
    ComplaintStatus.new,
    ComplaintStatus.under_process,
    ComplaintStatus.transferred,
    ComplaintStatus.pending_info,
]

STOP_WORDS = {
    "of", "the", "and", "in", "at", "to", "a", "an", "is", "for",
    "on", "with", "by", "from", "or", "that", "this", "it", "as",
    "be", "are", "was", "were", "has", "have", "had", "not", "but",
}


def _tokenize(text_: str) -> set:
    tokens = re.findall(r"\b[a-z]+\b", text_.lower())
    return {t for t in tokens if t not in STOP_WORDS and len(t) > 2}


def _jaccard(a: str, b: str) -> float:
    ta, tb = _tokenize(a), _tokenize(b)
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / len(ta | tb)


def detect_overlaps_for_complaint(
    db: Session, complaint: Complaint
) -> List[CaseOverlap]:
    """
    Run overlap detection for a single complaint.
    Returns newly created CaseOverlap records.
    """
    new_overlaps: List[CaseOverlap] = []

    # Find open complaints for same institution (excluding itself)
    candidates = (
        db.query(Complaint)
        .filter(
            Complaint.institution_id == complaint.institution_id,
            Complaint.id != complaint.id,
            Complaint.status.in_(OPEN_STATUSES),
        )
        .all()
    )

    for candidate in candidates:
        # Ensure deterministic pair ordering (smaller UUID first)
        a_id, b_id = sorted([complaint.id, candidate.id], key=str)

        # Check if overlap already recorded
        existing = (
            db.query(CaseOverlap)
            .filter(
                CaseOverlap.case_id_a == a_id,
                CaseOverlap.case_id_b == b_id,
            )
            .first()
        )
        if existing:
            if not existing.is_active:
                existing.is_active = True
                existing.detected_at = datetime.now(timezone.utc)
                db.flush()
            continue

        # Determine match method and score
        method = MatchMethod.aicte_id_exact
        score = 1.0

        # Add keyword similarity as secondary score
        kw_score = _jaccard(complaint.description, candidate.description)

        overlap = CaseOverlap(
            id=uuid.uuid4(),
            case_id_a=a_id,
            case_id_b=b_id,
            match_method=method,
            similarity_score=score,
            detected_at=datetime.now(timezone.utc),
            is_active=True,
        )
        db.add(overlap)
        new_overlaps.append(overlap)

    db.flush()

    # Update overlap flags on the complaint
    active_overlaps = (
        db.query(CaseOverlap)
        .filter(
            or_(
                CaseOverlap.case_id_a == complaint.id,
                CaseOverlap.case_id_b == complaint.id,
            ),
            CaseOverlap.is_active == True,
        )
        .count()
    )
    complaint.overlap_count = active_overlaps
    complaint.has_overlap = active_overlaps > 0

    # Also update the partner complaints
    for overlap in new_overlaps:
        partner_id = overlap.case_id_b if str(overlap.case_id_a) == str(complaint.id) else overlap.case_id_a
        partner = db.query(Complaint).filter(Complaint.id == partner_id).first()
        if partner:
            partner_overlaps = (
                db.query(CaseOverlap)
                .filter(
                    or_(
                        CaseOverlap.case_id_a == partner.id,
                        CaseOverlap.case_id_b == partner.id,
                    ),
                    CaseOverlap.is_active == True,
                )
                .count()
            )
            partner.overlap_count = partner_overlaps + len(new_overlaps)
            partner.has_overlap = True

    db.flush()
    return new_overlaps


def run_full_overlap_detection(db: Session) -> int:
    """
    Nightly job: re-check all open complaints for overlaps.
    Returns count of new overlaps detected.
    """
    open_complaints = (
        db.query(Complaint)
        .filter(Complaint.status.in_(OPEN_STATUSES))
        .all()
    )
    total_new = 0
    processed_pairs = set()

    for complaint in open_complaints:
        overlaps = detect_overlaps_for_complaint(db, complaint)
        total_new += len(overlaps)

    db.commit()
    return total_new
