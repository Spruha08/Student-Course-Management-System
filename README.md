# Student Course Management System

A full-stack application for managing students and their assigned courses. The system includes role-based access for administrators and students, a REST API backend, a MySQL relational database, and a React frontend.

## Features

### Admin Features

- Login securely as an administrator
- Add and view courses
- Register students and assign them to courses
- View students with their course details
- Update student information and course assignment
- Delete student records

### Student Features

- Login using student credentials
- View personal details
- View assigned course information

## Technologies Used

### Backend

- Python
- FastAPI
- SQLAlchemy
- JWT authentication
- Passlib and bcrypt

### Database

- MySQL

### Frontend

- React
- Vite
- Axios
- CSS

## Project Structure

```text
student-course-management-system/
  backend/
    app/
      routes/
        auth.py
        courses.py
        students.py
      auth.py
      database.py
      main.py
      models.py
      schemas.py
    sql/
      schema.sql
      seed.sql
    create_admin.py
    requirements.txt
    .env.example
  frontend/
    public/
    src/
      api/
        client.js
      App.css
      App.jsx
      index.css
      main.jsx
    index.html
    package.json
    package-lock.json
  README.md
```

## Database Design

The project uses three related MySQL tables.

### Courses Table

| Column | Description |
| --- | --- |
| `course_id` | Primary key, auto-increment |
| `course_name` | Name of the course |
| `course_code` | Unique course code |
| `course_duration` | Duration in months |

### Users Table

| Column | Description |
| --- | --- |
| `user_id` | Primary key, auto-increment |
| `username` | Unique login username |
| `email` | Unique email address |
| `hashed_password` | Securely hashed password |
| `role` | User role: `admin` or `student` |

### Students Table

| Column | Description |
| --- | --- |
| `student_id` | Primary key, auto-increment |
| `name` | Student name |
| `email` | Unique student email |
| `phone` | Student phone number |
| `address` | Student address |
| `course_id` | Foreign key referencing `courses` |
| `user_id` | Foreign key referencing `users` |

## Setup Instructions

### 1. Database Setup

Open MySQL Command Line Client and create the database:

```sql
CREATE DATABASE student_course_db;
USE student_course_db;
```

Run the SQL queries provided in:

```text
backend/sql/schema.sql
backend/sql/seed.sql
```

These scripts create the required tables and sample course records.

### 2. Backend Setup

Navigate to the backend folder:

```powershell
cd backend
```

Create a virtual environment:

```powershell
python -m venv venv
```

Activate the virtual environment on Windows:

```powershell
.\venv\Scripts\activate
```

Install backend dependencies:

```powershell
python -m pip install -r requirements.txt
```

Create a `.env` file inside `backend` based on `.env.example`:

```env
DATABASE_URL=mysql+pymysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/student_course_db
SECRET_KEY=replace_with_your_secret_key
ALGORITHM=HS256
```

Create the default admin user:

```powershell
python create_admin.py
```

Default admin login for testing:

```text
Username: admin
Password: admin123
```

Run the backend server:

```powershell
uvicorn app.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

### 3. Frontend Setup

Open a new terminal and navigate to the frontend folder:

```powershell
cd frontend
```

Install frontend dependencies:

```powershell
npm install
```

Run the React frontend:

```powershell
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/auth/login` | Login and generate JWT access token | Public |

### Courses

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/courses/` | Create a course | Admin |
| GET | `/courses/` | Retrieve all courses | Authenticated user |
| GET | `/courses/{course_id}` | Retrieve one course | Authenticated user |

### Students

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/students/` | Register student with course assignment | Admin |
| GET | `/students/` | Retrieve all students with course information | Admin |
| GET | `/students/me/profile` | View logged-in student's profile and course | Student |
| GET | `/students/course/{course_id}/enrolled` | Retrieve students in a selected course | Admin |
| GET | `/students/{student_id}` | Retrieve student details | Admin / Own Student |
| PUT | `/students/{student_id}` | Update student details or course assignment | Admin |
| DELETE | `/students/{student_id}` | Delete student record | Admin |

## Authentication And Authorization

The application implements JWT-based role authentication:

- Admin users can manage courses and students.
- Student users can only access their own details and course information.
- Protected frontend/API requests require an authenticated bearer token.

## Validation And Security

- Students can only be assigned to existing courses.
- Course codes are unique.
- Student email addresses and usernames are unique.
- User passwords are stored as hashed values.
- MySQL foreign keys maintain data relationships.
- Secret credentials are configured using environment variables and are not included in the repository.

## Testing

The backend endpoints can be tested through Swagger UI:

```text
http://127.0.0.1:8000/docs
```

Functionality tested includes:

- Administrator login
- Course creation and retrieval
- Student registration with course selection
- Student updates, including course reassignment
- Student deletion
- Student login and personal profile view
- Role-based access in the frontend

## Application Demonstration

The project demonstrates:

- A MySQL relational database with keys and course-student association
- A FastAPI REST backend with authentication and authorization
- A React frontend for admin and student workflows
- Course assignment, profile viewing, update, and delete operations
