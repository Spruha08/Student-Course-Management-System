from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.auth import get_current_user, hash_password, require_admin
from app.database import get_db
from app.models import Course, Student, User
from app.schemas import StudentCreate, StudentOut, StudentUpdate

router = APIRouter(prefix="/students", tags=["Students"])


@router.post("/", response_model=StudentOut, dependencies=[Depends(require_admin)])
def create_student(
    student: StudentCreate,
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.course_id == student.course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course does not exist")

    existing_username = db.query(User).filter(User.username == student.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already exists")

    existing_email = db.query(Student).filter(Student.email == student.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Student email already exists")

    new_user = User(
        username=student.username,
        email=student.email,
        hashed_password=hash_password(student.password),
        role="student",
    )

    db.add(new_user)
    db.flush()

    new_student = Student(
        name=student.name,
        email=student.email,
        phone=student.phone,
        address=student.address,
        course_id=student.course_id,
        user_id=new_user.user_id,
    )

    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return new_student


@router.get("/", response_model=list[StudentOut], dependencies=[Depends(require_admin)])
def get_students(db: Session = Depends(get_db)):
    return db.query(Student).options(joinedload(Student.course)).all()


@router.get("/me/profile", response_model=StudentOut)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Student access required")

    student = (
        db.query(Student)
        .options(joinedload(Student.course))
        .filter(Student.user_id == current_user.user_id)
        .first()
    )

    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    return student


@router.get(
    "/course/{course_id}/enrolled",
    response_model=list[StudentOut],
    dependencies=[Depends(require_admin)],
)
def get_students_by_course(
    course_id: int,
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.course_id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    return (
        db.query(Student)
        .options(joinedload(Student.course))
        .filter(Student.course_id == course_id)
        .all()
    )


@router.get("/{student_id}", response_model=StudentOut)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = (
        db.query(Student)
        .options(joinedload(Student.course))
        .filter(Student.student_id == student_id)
        .first()
    )

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if current_user.role != "admin" and student.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You can only view your own details")

    return student


@router.put("/{student_id}", response_model=StudentOut, dependencies=[Depends(require_admin)])
def update_student(
    student_id: int,
    data: StudentUpdate,
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.student_id == student_id).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    update_data = data.model_dump(exclude_unset=True)

    if "course_id" in update_data:
        course = db.query(Course).filter(Course.course_id == update_data["course_id"]).first()

        if not course:
            raise HTTPException(status_code=404, detail="Course does not exist")

    if "email" in update_data:
        existing_email = (
            db.query(Student)
            .filter(Student.email == update_data["email"], Student.student_id != student_id)
            .first()
        )

        if existing_email:
            raise HTTPException(status_code=400, detail="Student email already exists")

    for key, value in update_data.items():
        setattr(student, key, value)

    if "email" in update_data and student.user:
        student.user.email = update_data["email"]

    db.commit()
    db.refresh(student)

    return student


@router.delete("/{student_id}", dependencies=[Depends(require_admin)])
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.student_id == student_id).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    user = student.user

    db.delete(student)

    if user:
        db.delete(user)

    db.commit()

    return {"message": "Student deleted successfully"}