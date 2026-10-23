"""Initial schema

Revision ID: 001
Revises: 
Create Date: 2026-10-24

"""
from typing import Sequence, Union
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enums
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    op.execute("""
        DO $$ BEGIN
            CREATE TYPE userrole AS ENUM ('admin','rb_officer','pgrc_officer','regional_officer','senior_management');
        EXCEPTION WHEN duplicate_object THEN null; END $$
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE bureau AS ENUM ('RB','PGRC','Regional','Management','Admin','Joint');
        EXCEPTION WHEN duplicate_object THEN null; END $$
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE complaintstatus AS ENUM ('new','under_process','transferred','pending_info','disposed','closed');
        EXCEPTION WHEN duplicate_object THEN null; END $$
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE complaintpriority AS ENUM ('low','normal','high','urgent');
        EXCEPTION WHEN duplicate_object THEN null; END $$
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE receivedchannel AS ENUM ('email','portal','post','phone','walk_in');
        EXCEPTION WHEN duplicate_object THEN null; END $$
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE actiontype AS ENUM ('created','status_change','remark','transfer','document_upload','escalation','overlap_acknowledged','disposition');
        EXCEPTION WHEN duplicate_object THEN null; END $$
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE matchmethod AS ENUM ('aicte_id_exact','name_normalized','keyword_similarity');
        EXCEPTION WHEN duplicate_object THEN null; END $$
    """)

    # users table
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("username", sa.String(50), nullable=False, unique=True),
        sa.Column("email", sa.String(100), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String, nullable=False),
        sa.Column("full_name", sa.String(100), nullable=False),
        sa.Column("role", sa.Enum("admin","rb_officer","pgrc_officer","regional_officer","senior_management", name="userrole"), nullable=False),
        sa.Column("bureau", sa.Enum("RB","PGRC","Regional","Management","Admin","Joint", name="bureau"), nullable=False),
        sa.Column("region", sa.String(50), nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, default=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("last_login", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_users_username", "users", ["username"])

    # institutions table
    op.create_table(
        "institutions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("aicte_permanent_id", sa.String(20), nullable=True, unique=True),
        sa.Column("name", sa.String(300), nullable=False),
        sa.Column("name_normalized", sa.String(300), nullable=False),
        sa.Column("institution_type", sa.String(50), nullable=True),
        sa.Column("state", sa.String(50), nullable=True),
        sa.Column("region", sa.String(50), nullable=True),
        sa.Column("district", sa.String(100), nullable=True),
        sa.Column("address", sa.Text, nullable=True),
        sa.Column("approval_status", sa.String(30), nullable=True),
        sa.Column("contact_email", sa.String(100), nullable=True),
        sa.Column("contact_phone", sa.String(20), nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, default=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_institutions_aicte_id", "institutions", ["aicte_permanent_id"])
    op.create_index("ix_institutions_region", "institutions", ["region"])
    op.create_index("ix_institutions_name_normalized", "institutions", ["name_normalized"])
    op.execute("CREATE INDEX ix_institutions_name_trgm ON institutions USING GIN (name_normalized gin_trgm_ops)")

    # complaints table
    op.create_table(
        "complaints",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("case_id", sa.String(30), nullable=False, unique=True),
        sa.Column("institution_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("institutions.id"), nullable=False),
        sa.Column("received_date", sa.Date, nullable=False),
        sa.Column("received_channel", sa.Enum("email","portal","post","phone","walk_in", name="receivedchannel"), nullable=False),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("sub_category", sa.String(100), nullable=True),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("complainant_type", sa.String(50), nullable=True),
        sa.Column("priority", sa.Enum("low","normal","high","urgent", name="complaintpriority"), nullable=False, default="normal"),
        sa.Column("status", sa.Enum("new","under_process","transferred","pending_info","disposed","closed", name="complaintstatus"), nullable=False, default="new"),
        sa.Column("assigned_bureau", sa.String(20), nullable=False),
        sa.Column("assigned_officer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("last_action_summary", sa.Text, nullable=True),
        sa.Column("next_action_required", sa.Text, nullable=True),
        sa.Column("expected_disposal_date", sa.Date, nullable=True),
        sa.Column("actual_disposal_date", sa.Date, nullable=True),
        sa.Column("is_overdue", sa.Boolean, nullable=False, default=False),
        sa.Column("is_escalated", sa.Boolean, nullable=False, default=False),
        sa.Column("escalated_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("escalated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("overlap_count", sa.Integer, nullable=False, default=0),
        sa.Column("has_overlap", sa.Boolean, nullable=False, default=False),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_complaints_case_id", "complaints", ["case_id"])
    op.create_index("ix_complaints_institution_id", "complaints", ["institution_id"])
    op.create_index("ix_complaints_status", "complaints", ["status"])
    op.create_index("ix_complaints_bureau", "complaints", ["assigned_bureau"])
    op.create_index("ix_complaints_disposal_date", "complaints", ["expected_disposal_date"])
    op.create_index("ix_complaints_bureau_status", "complaints", ["assigned_bureau", "status"])

    # complaint_actions table
    op.create_table(
        "complaint_actions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("complaint_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("complaints.id"), nullable=False),
        sa.Column("action_type", sa.Enum("created","status_change","remark","transfer","document_upload","escalation","overlap_acknowledged","disposition", name="actiontype"), nullable=False),
        sa.Column("performed_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("performed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("old_status", sa.String(30), nullable=True),
        sa.Column("new_status", sa.String(30), nullable=True),
        sa.Column("remarks", sa.Text, nullable=True),
        sa.Column("transferred_to_bureau", sa.String(30), nullable=True),
        sa.Column("transferred_to_officer_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_index("ix_complaint_actions_complaint_id", "complaint_actions", ["complaint_id"])

    # documents table
    op.create_table(
        "documents",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("complaint_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("complaints.id"), nullable=False),
        sa.Column("action_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("complaint_actions.id"), nullable=True),
        sa.Column("original_filename", sa.String(255), nullable=False),
        sa.Column("stored_filename", sa.String(255), nullable=False),
        sa.Column("file_size_bytes", sa.Integer, nullable=False),
        sa.Column("mime_type", sa.String(100), nullable=False),
        sa.Column("uploaded_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_documents_complaint_id", "documents", ["complaint_id"])

    # case_overlaps table
    op.create_table(
        "case_overlaps",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("case_id_a", postgresql.UUID(as_uuid=True), sa.ForeignKey("complaints.id"), nullable=False),
        sa.Column("case_id_b", postgresql.UUID(as_uuid=True), sa.ForeignKey("complaints.id"), nullable=False),
        sa.Column("match_method", sa.Enum("aicte_id_exact","name_normalized","keyword_similarity", name="matchmethod"), nullable=False),
        sa.Column("similarity_score", sa.Float, nullable=False, default=1.0),
        sa.Column("detected_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("acknowledged_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("acknowledged_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("resolution_note", sa.Text, nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, default=True),
        sa.UniqueConstraint("case_id_a", "case_id_b", name="uq_case_overlap_pair"),
    )
    op.create_index("ix_case_overlaps_a", "case_overlaps", ["case_id_a"])
    op.create_index("ix_case_overlaps_b", "case_overlaps", ["case_id_b"])

    # audit_log table
    op.create_table(
        "audit_log",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("entity_type", sa.String(50), nullable=True),
        sa.Column("entity_id", sa.String(50), nullable=True),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("request_method", sa.String(10), nullable=True),
        sa.Column("endpoint", sa.String(200), nullable=True),
        sa.Column("payload_summary", postgresql.JSONB, nullable=True),
        sa.Column("performed_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_audit_log_user_id", "audit_log", ["user_id"])
    op.create_index("ix_audit_log_action", "audit_log", ["action"])
    op.create_index("ix_audit_log_performed_at", "audit_log", ["performed_at"])


def downgrade() -> None:
    op.drop_table("audit_log")
    op.drop_table("case_overlaps")
    op.drop_table("documents")
    op.drop_table("complaint_actions")
    op.drop_table("complaints")
    op.drop_table("institutions")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS matchmethod")
    op.execute("DROP TYPE IF EXISTS actiontype")
    op.execute("DROP TYPE IF EXISTS receivedchannel")
    op.execute("DROP TYPE IF EXISTS complaintpriority")
    op.execute("DROP TYPE IF EXISTS complaintstatus")
    op.execute("DROP TYPE IF EXISTS bureau")
    op.execute("DROP TYPE IF EXISTS userrole")
