from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class CourseBase(BaseModel):
    course_name: str
    course_code: str
    course_duration: int


class CourseCreate(CourseBase):
    pass


class CourseOut(CourseBase):
    course_id: int

    model_config = ConfigDict(from_attributes=True)


class StudentCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    course_id: int
    username: str
    password: str


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    course_id: Optional[int] = None


class StudentOut(BaseModel):
    student_id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    course: CourseOut

    model_config = ConfigDict(from_attributes=True)


class LoginOut(BaseModel):
    access_token: str
    token_type: str
    role: str