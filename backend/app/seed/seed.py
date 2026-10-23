"""
Synthetic demonstration data seed for AICTE CaseTrack.
Idempotent: safe to re-run; will skip if data already exists.
"""
import uuid
import random
import re
from datetime import date, timedelta, datetime, timezone

from app.db.session import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserRole, Bureau
from app.models.institution import Institution
from app.models.complaint import Complaint, ComplaintStatus, ComplaintPriority, ReceivedChannel
from app.models.complaint_action import ComplaintAction, ActionType
from app.models.case_overlap import CaseOverlap, MatchMethod
from app.services.overlap import detect_overlaps_for_complaint

random.seed(42)

REGIONS = ["North", "South", "East", "West", "Central", "North-East", "North-West", "South-East"]

STATES_BY_REGION = {
    "North": ["Delhi", "Haryana", "Punjab", "Himachal Pradesh", "Uttarakhand"],
    "South": ["Tamil Nadu", "Karnataka", "Kerala", "Andhra Pradesh", "Telangana"],
    "East": ["West Bengal", "Odisha", "Jharkhand", "Bihar"],
    "West": ["Maharashtra", "Gujarat", "Rajasthan", "Goa"],
    "Central": ["Madhya Pradesh", "Chhattisgarh", "Uttar Pradesh"],
    "North-East": ["Assam", "Manipur", "Meghalaya", "Mizoram", "Nagaland"],
    "North-West": ["Jammu & Kashmir", "Ladakh"],
    "South-East": ["Odisha", "Andhra Pradesh"],
}

INSTITUTION_TYPES = ["Engineering", "MBA", "Pharmacy", "Architecture", "Hotel Management", "MCA"]

APPROVAL_STATUSES = ["Approved", "Conditionally Approved", "Debarred", "Closed"]

CATEGORIES = [
    "Admission Irregularities",
    "Fee Regulation Violation",
    "Faculty Shortage",
    "Infrastructure Deficiency",
    "Affiliation Issues",
    "Examination Malpractice",
    "Scholarship Disbursal",
    "Harassment Complaint",
    "Closure Procedure",
    "NBA/NAAC Compliance",
]

CHANNELS = [rc.value for rc in ReceivedChannel]

COMPLAINANT_TYPES = ["Student", "Faculty", "Staff", "Public", "Anonymous", "Parent"]

BUREAUS = ["RB", "PGRC"]

INSTITUTION_NAMES = [
    "Apex Institute of Technology", "Bharat College of Engineering", "Central Engineering College",
    "Delhi Institute of Advanced Studies", "Eastern Technical University", "Frontier College of Management",
    "Global Institute of Technology", "Heritage Engineering College", "Imperial College of Technology",
    "Jyoti Institute of Engineering", "Kiran College of Engineering", "Lakshmi Institute of Technology",
    "Mahatma Gandhi Technical Institute", "National College of Engineering", "Orient Institute of Management",
    "Pioneer Engineering College", "Quality College of Technology", "Rajasthan Institute of Engineering",
    "Sunrise Technical College", "Techno India College", "United College of Engineering",
    "Vidya Bharati Institute of Technology", "Western Engineering College", "Xavier Institute of Management",
    "Yamuna Technical College", "Zenith College of Engineering", "Annamalai Technical Institute",
    "Birla Polytechnic College", "Coastal Engineering Institute", "Deccan College of Technology",
    "Eastern Management College", "Flora College of Pharmacy", "Gateway Institute of Technology",
    "Horizon College of Architecture", "Integrated Technical Institute", "Jawaharlal Engineering College",
    "Krishna College of Management", "Lotus Institute of Pharmacy", "Maharana Pratap Technical College",
    "Nehru Institute of Engineering", "Ocean Technology College", "Pacific College of Management",
    "Quantum Engineering Institute", "River Valley College of Technology", "Saraswati College of Engineering",
    "Tata Memorial Technical College", "Universal College of Engineering", "Vedic Institute of Technology",
    "Wisdom College of Management", "Xerxes Engineering Institute",
]


def normalize(name: str) -> str:
    n = re.sub(r"[^a-z0-9\s]", "", name.lower())
    return re.sub(r"\s+", " ", n).strip()


def random_date(start_days_ago: int, end_days_ago: int = 0) -> date:
    delta = random.randint(end_days_ago, start_days_ago)
    return date.today() - timedelta(days=delta)


def random_disposal_date(received: date) -> date:
    return received + timedelta(days=random.randint(30, 90))


def seed_users(db) -> list[User]:
    if db.query(User).count() > 0:
        return db.query(User).all()

    users = [
        User(
            id=uuid.uuid4(),
            username="admin",
            email="admin@aicte.gov.in",
            hashed_password=get_password_hash("Admin@123"),
            full_name="System Administrator",
            role=UserRole.admin,
            bureau=Bureau.Admin,
            is_active=True,
            created_at=datetime.now(timezone.utc),
        ),
        User(
            id=uuid.uuid4(),
            username="rb_officer1",
            email="rb.officer1@aicte.gov.in",
            hashed_password=get_password_hash("RBOfficer@123"),
            full_name="Rajesh Kumar Sharma",
            role=UserRole.rb_officer,
            bureau=Bureau.RB,
            is_active=True,
            created_at=datetime.now(timezone.utc),
        ),
        User(
            id=uuid.uuid4(),
            username="rb_officer2",
            email="rb.officer2@aicte.gov.in",
            hashed_password=get_password_hash("RBOfficer@123"),
            full_name="Sunita Devi Patel",
            role=UserRole.rb_officer,
            bureau=Bureau.RB,
            is_active=True,
            created_at=datetime.now(timezone.utc),
        ),
        User(
            id=uuid.uuid4(),
            username="pgrc_officer1",
            email="pgrc.officer1@aicte.gov.in",
            hashed_password=get_password_hash("PGRCOfficer@123"),
            full_name="Anita Krishnamurthy",
            role=UserRole.pgrc_officer,
            bureau=Bureau.PGRC,
            is_active=True,
            created_at=datetime.now(timezone.utc),
        ),
        User(
            id=uuid.uuid4(),
            username="pgrc_officer2",
            email="pgrc.officer2@aicte.gov.in",
            hashed_password=get_password_hash("PGRCOfficer@123"),
            full_name="Mohammed Rafi Ahmed",
            role=UserRole.pgrc_officer,
            bureau=Bureau.PGRC,
            is_active=True,
            created_at=datetime.now(timezone.utc),
        ),
        User(
            id=uuid.uuid4(),
            username="regional_north",
            email="regional.north@aicte.gov.in",
            hashed_password=get_password_hash("Regional@123"),
            full_name="Vikram Singh Rawat",
            role=UserRole.regional_officer,
            bureau=Bureau.Regional,
            region="North",
            is_active=True,
            created_at=datetime.now(timezone.utc),
        ),
        User(
            id=uuid.uuid4(),
            username="regional_south",
            email="regional.south@aicte.gov.in",
            hashed_password=get_password_hash("Regional@123"),
            full_name="Lakshmi Narayanan",
            role=UserRole.regional_officer,
            bureau=Bureau.Regional,
            region="South",
            is_active=True,
            created_at=datetime.now(timezone.utc),
        ),
        User(
            id=uuid.uuid4(),
            username="senior_mgmt",
            email="director@aicte.gov.in",
            hashed_password=get_password_hash("Director@123"),
            full_name="Dr. Arun Prasad",
            role=UserRole.senior_management,
            bureau=Bureau.Management,
            is_active=True,
            created_at=datetime.now(timezone.utc),
        ),
    ]
    db.bulk_save_objects(users)
    db.commit()
    return db.query(User).all()


def seed_institutions(db) -> list[Institution]:
    if db.query(Institution).count() > 0:
        return db.query(Institution).all()

    institutions = []
    for i, name in enumerate(INSTITUTION_NAMES):
        region = random.choice(REGIONS)
        state = random.choice(STATES_BY_REGION[region])
        inst = Institution(
            id=uuid.uuid4(),
            aicte_permanent_id=f"1-{1000000 + i:07d}",
            name=name,
            name_normalized=normalize(name),
            institution_type=random.choice(INSTITUTION_TYPES),
            state=state,
            region=region,
            district=f"{state} District",
            address=f"Plot {i+1}, Industrial Area, {state}",
            approval_status=random.choices(
                APPROVAL_STATUSES, weights=[70, 15, 10, 5]
            )[0],
            contact_email=f"principal@{name.lower().replace(' ', '')[:15]}.ac.in",
            contact_phone=f"+91-{random.randint(7000000000, 9999999999)}",
            is_active=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        institutions.append(inst)

    db.bulk_save_objects(institutions)
    db.commit()
    return db.query(Institution).all()


def generate_case_id_seed(bureau: str, year: int, seq: int) -> str:
    return f"AICTE-{year}-{bureau}-{seq:06d}"


def seed_complaints(db, institutions: list[Institution], users: list[User]) -> list[Complaint]:
    if db.query(Complaint).count() > 0:
        return db.query(Complaint).all()

    rb_officers = [u for u in users if u.role == UserRole.rb_officer]
    pgrc_officers = [u for u in users if u.role == UserRole.pgrc_officer]
    admin_user = next(u for u in users if u.role == UserRole.admin)

    complaints = []
    actions = []
    rb_seq = {2023: 0, 2024: 0, 2025: 0, 2026: 0}
    pgrc_seq = {2023: 0, 2024: 0, 2025: 0, 2026: 0}

    # Create 200 complaints distributed over institutions
    for i in range(200):
        institution = random.choice(institutions)
        bureau = random.choices(BUREAUS, weights=[50, 50])[0]
        year = random.choices([2023, 2024, 2025, 2026], weights=[15, 25, 35, 25])[0]

        if bureau == "RB":
            rb_seq[year] += 1
            case_id = generate_case_id_seed("RB", year, rb_seq[year])
            officer = random.choice(rb_officers)
        else:
            pgrc_seq[year] += 1
            case_id = generate_case_id_seed("PGRC", year, pgrc_seq[year])
            officer = random.choice(pgrc_officers)

        received = random_date(900, 10)
        expected_disposal = random_disposal_date(received)
        today = date.today()

        status = random.choices(
            list(ComplaintStatus),
            weights=[10, 25, 10, 10, 30, 15],
        )[0]

        is_overdue = (
            expected_disposal < today
            and status not in (ComplaintStatus.disposed, ComplaintStatus.closed)
        )
        actual_disposal = None
        if status in (ComplaintStatus.disposed, ComplaintStatus.closed):
            actual_disposal = received + timedelta(days=random.randint(20, 80))

        complaint = Complaint(
            id=uuid.uuid4(),
            case_id=case_id,
            institution_id=institution.id,
            received_date=received,
            received_channel=random.choice(list(ReceivedChannel)),
            category=random.choice(CATEGORIES),
            sub_category=None,
            description=f"Complaint regarding {random.choice(CATEGORIES).lower()} at {institution.name}. "
                        f"The institution has allegedly violated AICTE norms regarding this matter. "
                        f"Complainant seeks urgent redressal and appropriate action.",
            complainant_type=random.choice(COMPLAINANT_TYPES),
            priority=random.choices(
                list(ComplaintPriority), weights=[20, 50, 20, 10]
            )[0],
            status=status,
            assigned_bureau=bureau,
            assigned_officer_id=officer.id,
            last_action_summary="Under review by assigned officer.",
            next_action_required="Seek clarification from institution." if status == ComplaintStatus.pending_info else "Prepare disposal note.",
            expected_disposal_date=expected_disposal,
            actual_disposal_date=actual_disposal,
            is_overdue=is_overdue,
            is_escalated=random.random() < 0.05,
            overlap_count=0,
            has_overlap=False,
            created_by=admin_user.id,
            created_at=datetime(received.year, received.month, received.day, 9, 0, 0, tzinfo=timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        complaints.append(complaint)

        # Add creation action
        actions.append(ComplaintAction(
            id=uuid.uuid4(),
            complaint_id=complaint.id,
            action_type=ActionType.created,
            performed_by=admin_user.id,
            performed_at=datetime(received.year, received.month, received.day, 9, 0, 0, tzinfo=timezone.utc),
            new_status=ComplaintStatus.new.value,
            remarks="Case registered.",
        ))

        # Add 1-4 additional actions
        action_count = random.randint(1, 4)
        for j in range(action_count):
            action_date = datetime(received.year, received.month, received.day, tzinfo=timezone.utc) + timedelta(days=random.randint(1, 30))
            actions.append(ComplaintAction(
                id=uuid.uuid4(),
                complaint_id=complaint.id,
                action_type=random.choice([ActionType.remark, ActionType.status_change]),
                performed_by=officer.id,
                performed_at=action_date,
                remarks=random.choice([
                    "Institution response received and reviewed.",
                    "Site inspection report being prepared.",
                    "Clarification sought from complainant.",
                    "Case referred to legal section for review.",
                    "Show cause notice issued to institution.",
                    "Institution compliance report received.",
                    "Case under examination by expert committee.",
                    "Forwarded to regional office for verification.",
                ]),
            ))

    db.bulk_save_objects(complaints)
    db.bulk_save_objects(actions)
    db.commit()
    return db.query(Complaint).all()


def seed_overlaps(db, complaints: list[Complaint]):
    """Deliberately create some overlap scenarios for demo."""
    if db.query(CaseOverlap).count() > 0:
        return

    # Group complaints by institution
    inst_map: dict = {}
    for c in complaints:
        key = str(c.institution_id)
        inst_map.setdefault(key, []).append(c)

    overlaps_created = 0
    for inst_id, inst_complaints in inst_map.items():
        # Find institutions with both RB and PGRC complaints
        rb_cases = [c for c in inst_complaints if c.assigned_bureau == "RB"
                    and c.status not in (ComplaintStatus.disposed, ComplaintStatus.closed)]
        pgrc_cases = [c for c in inst_complaints if c.assigned_bureau == "PGRC"
                      and c.status not in (ComplaintStatus.disposed, ComplaintStatus.closed)]

        if rb_cases and pgrc_cases:
            # Create overlap between first RB and first PGRC case
            c_a, c_b = rb_cases[0], pgrc_cases[0]
            a_id, b_id = sorted([c_a.id, c_b.id], key=str)

            overlap = CaseOverlap(
                id=uuid.uuid4(),
                case_id_a=a_id,
                case_id_b=b_id,
                match_method=MatchMethod.aicte_id_exact,
                similarity_score=1.0,
                detected_at=datetime.now(timezone.utc),
                is_active=True,
            )
            db.add(overlap)

            # Update flags on both complaints
            c_a.has_overlap = True
            c_a.overlap_count += 1
            c_b.has_overlap = True
            c_b.overlap_count += 1

            overlaps_created += 1
            if overlaps_created >= 30:
                break

    db.commit()
    print(f"Created {overlaps_created} overlap pairs.")


def run_seed():
    db = SessionLocal()
    try:
        print("Seeding users...")
        users = seed_users(db)
        print(f"  {len(users)} users")

        print("Seeding institutions...")
        institutions = seed_institutions(db)
        print(f"  {len(institutions)} institutions")

        print("Seeding complaints...")
        complaints = seed_complaints(db, institutions, users)
        print(f"  {len(complaints)} complaints")

        print("Seeding overlaps...")
        seed_overlaps(db, complaints)

        print("Seed complete.")
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
