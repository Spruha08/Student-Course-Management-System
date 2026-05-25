from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Course(Base):
    __tablename__ = "courses"

    course_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    course_name = Column(String(100), nullable=False)
    course_code = Column(String(30), unique=True, nullable=False, index=True)
    course_duration = Column(Integer, nullable=False)

    students = relationship("Student", back_populates="course")


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="student")

    student = relationship("Student", back_populates="user", uselist=False)


class Student(Base):
    __tablename__ = "students"

    student_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone = Column(String(20), nullable=True)
    address = Column(String(255), nullable=True)

    course_id = Column(Integer, ForeignKey("courses.course_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), unique=True, nullable=True)

    course = relationship("Course", back_populates="students")
    user = relationship("User", back_populates="student")