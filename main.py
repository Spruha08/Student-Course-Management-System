from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routes import auth, courses, students

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Student Course Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(students.router)


@app.get("/")
def home():
    return {"message": "Student Course Management API is running"}