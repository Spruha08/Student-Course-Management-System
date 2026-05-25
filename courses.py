from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user, require_admin
from app.database import get_db
from app.models import Course
from app.schemas import CourseCreate, CourseOut

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.post("/", response_model=CourseOut, dependencies=[Depends(require_admin)])
def create_course(
    course: CourseCreate,
    db: Session = Depends(get_db),
):
    existing_course = db.query(Course).filter(
        Course.course_code == course.course_code
    ).first()

    if existing_course:
        raise HTTPException(status_code=400, detail="Course code already exists")

    new_course = Course(
        course_name=course.course_name,
        course_code=course.course_code,
        course_duration=course.course_duration,
    )

    db.add(new_course)
    db.commit()
    db.refresh(new_course)

    return new_course


@router.get("/", response_model=list[CourseOut], dependencies=[Depends(get_current_user)])
def get_courses(db: Session = Depends(get_db)):
    return db.query(Course).all()


@router.get(
    "/{course_id}",
    response_model=CourseOut,
    dependencies=[Depends(get_current_user)],
)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.course_id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    return course