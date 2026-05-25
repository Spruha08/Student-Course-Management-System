import { useEffect, useState } from 'react';
import api from './api/client';
import './App.css';

function Dashboard({ username, role, setMessage }) {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [profile, setProfile] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);

  const [courseForm, setCourseForm] = useState({
    course_name: '',
    course_code: '',
    course_duration: '',
  });

  const emptyStudentForm = {
    name: '',
    email: '',
    phone: '',
    address: '',
    course_id: '',
    username: '',
    password: '',
  };

  const [studentForm, setStudentForm] = useState(emptyStudentForm);

  const loadCourses = async () => {
    try {
      const response = await api.get('/courses/');
      setCourses(response.data);
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Unable to load courses');
    }
  };

  const loadStudents = async () => {
    try {
      const response = await api.get('/students/');
      setStudents(response.data);
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Unable to load students');
    }
  };

  const loadProfile = async () => {
    try {
      const response = await api.get('/students/me/profile');
      setProfile(response.data);
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Unable to load profile');
    }
  };

  useEffect(() => {
    loadCourses();

    if (role === 'admin') {
      loadStudents();
    }

    if (role === 'student') {
      loadProfile();
    }
  }, [role]);

  const handleCourseChange = (event) => {
    setCourseForm({
      ...courseForm,
      [event.target.name]: event.target.value,
    });
  };

  const handleStudentChange = (event) => {
    setStudentForm({
      ...studentForm,
      [event.target.name]: event.target.value,
    });
  };

  const handleCreateCourse = async (event) => {
    event.preventDefault();

    try {
      await api.post('/courses/', {
        ...courseForm,
        course_duration: Number(courseForm.course_duration),
      });

      setCourseForm({
        course_name: '',
        course_code: '',
        course_duration: '',
      });

      setMessage('Course created successfully');
      loadCourses();
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Unable to create course');
    }
  };

  const handleSubmitStudent = async (event) => {
    event.preventDefault();

    try {
      if (editingStudent) {
        await api.put(`/students/${editingStudent.student_id}`, {
          name: studentForm.name,
          email: studentForm.email,
          phone: studentForm.phone,
          address: studentForm.address,
          course_id: Number(studentForm.course_id),
        });
        setMessage('Student updated successfully');
      } else {
        await api.post('/students/', {
          ...studentForm,
          course_id: Number(studentForm.course_id),
        });
        setMessage('Student registered successfully');
      }

      setEditingStudent(null);
      setStudentForm(emptyStudentForm);
      loadStudents();
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Unable to save student');
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setStudentForm({
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      address: student.address || '',
      course_id: String(student.course.course_id),
      username: '',
      password: '',
    });
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setStudentForm(emptyStudentForm);
  };

  const handleDeleteStudent = async (student) => {
    const shouldDelete = window.confirm(`Delete student ${student.name}?`);

    if (!shouldDelete) {
      return;
    }

    try {
      await api.delete(`/students/${student.student_id}`);
      setMessage('Student deleted successfully');

      if (editingStudent?.student_id === student.student_id) {
        handleCancelEdit();
      }

      loadStudents();
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Unable to delete student');
    }
  };

  return (
    <section className="dashboard">
      <div className="welcome">
        <h2>Welcome, {username}</h2>
        <p>You are logged in as {role}.</p>
      </div>

      {role === 'admin' && (
        <>
          <div className="actions">
            <button className="secondary-button" type="button" onClick={loadCourses}>
              Refresh courses
            </button>
            <button className="secondary-button" type="button" onClick={loadStudents}>
              Refresh students
            </button>
          </div>

          <div className="form-grid">
            <section className="panel">
              <h3>Add Course</h3>

              <form className="record-form" onSubmit={handleCreateCourse}>
                <label>
                  Course name
                  <input
                    name="course_name"
                    value={courseForm.course_name}
                    onChange={handleCourseChange}
                    required
                  />
                </label>

                <label>
                  Course code
                  <input
                    name="course_code"
                    value={courseForm.course_code}
                    onChange={handleCourseChange}
                    required
                  />
                </label>

                <label>
                  Duration in months
                  <input
                    name="course_duration"
                    type="number"
                    min="1"
                    value={courseForm.course_duration}
                    onChange={handleCourseChange}
                    required
                  />
                </label>

                <button className="primary-button" type="submit">
                  Add course
                </button>
              </form>
            </section>

            <section className="panel">
              <div className="form-heading">
                <h3>{editingStudent ? 'Update Student' : 'Register Student'}</h3>

                {editingStudent && (
                  <button className="text-button" type="button" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                )}
              </div>

              <form className="record-form student-form" onSubmit={handleSubmitStudent}>
                <label>
                  Student name
                  <input
                    name="name"
                    value={studentForm.name}
                    onChange={handleStudentChange}
                    required
                  />
                </label>

                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    value={studentForm.email}
                    onChange={handleStudentChange}
                    required
                  />
                </label>

                <label>
                  Phone
                  <input
                    name="phone"
                    value={studentForm.phone}
                    onChange={handleStudentChange}
                  />
                </label>

                <label>
                  Address
                  <input
                    name="address"
                    value={studentForm.address}
                    onChange={handleStudentChange}
                  />
                </label>

                <label>
                  Course
                  <select
                    name="course_id"
                    value={studentForm.course_id}
                    onChange={handleStudentChange}
                    required
                  >
                    <option value="">Select course</option>
                    {courses.map((course) => (
                      <option key={course.course_id} value={course.course_id}>
                        {course.course_code} - {course.course_name}
                      </option>
                    ))}
                  </select>
                </label>

                {!editingStudent && (
                  <>
                    <label>
                      Login username
                      <input
                        name="username"
                        value={studentForm.username}
                        onChange={handleStudentChange}
                        required
                      />
                    </label>

                    <label>
                      Login password
                      <input
                        name="password"
                        type="password"
                        value={studentForm.password}
                        onChange={handleStudentChange}
                        required
                      />
                    </label>
                  </>
                )}

                <button className="primary-button" type="submit">
                  {editingStudent ? 'Update student' : 'Register student'}
                </button>
              </form>
            </section>
          </div>

          <div className="records-grid">
            <CourseTable courses={courses} />

            <section className="panel table-panel students-table">
              <h3>Students</h3>

              {students.length === 0 ? (
                <p className="empty-state">No registered students found.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Course</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map((student) => (
                      <tr key={student.student_id}>
                        <td>{student.name}</td>
                        <td>{student.email}</td>
                        <td>{student.course.course_code}</td>
                        <td className="row-actions">
                          <button type="button" onClick={() => handleEditStudent(student)}>
                            Edit
                          </button>
                          <button
                            className="danger-button"
                            type="button"
                            onClick={() => handleDeleteStudent(student)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>
        </>
      )}

      {role === 'student' && (
        <div className="student-view">
          <section className="panel profile-panel">
            <div className="profile-title">
              <h3>My Details</h3>
              <button className="secondary-button" type="button" onClick={loadProfile}>
                Refresh
              </button>
            </div>

            {profile && (
              <dl className="profile-details">
                <div>
                  <dt>Student name</dt>
                  <dd>{profile.name}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{profile.email}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{profile.phone || '-'}</dd>
                </div>
                <div>
                  <dt>Address</dt>
                  <dd>{profile.address || '-'}</dd>
                </div>
              </dl>
            )}
          </section>

          {profile && (
            <section className="panel enrolled-course">
              <p className="eyebrow">Enrolled Course</p>
              <h3>{profile.course.course_name}</h3>
              <p className="course-code">{profile.course.course_code}</p>
              <p className="duration">{profile.course.course_duration} months duration</p>
            </section>
          )}
        </div>
      )}
    </section>
  );
}

function CourseTable({ courses }) {
  return (
    <section className="panel table-panel">
      <h3>Courses</h3>

      {courses.length === 0 ? (
        <p className="empty-state">No courses found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Duration</th>
            </tr>
          </thead>

          <tbody>
            {courses.map((course) => (
              <tr key={course.course_id}>
                <td>{course.course_code}</td>
                <td>{course.course_name}</td>
                <td>{course.course_duration} months</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function App() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage('');

    const body = new URLSearchParams();
    body.append('username', username);
    body.append('password', password);

    try {
      const response = await api.post('/auth/login', body, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      localStorage.setItem('access_token', response.data.access_token);
      setRole(response.data.role);
      setMessage('Login successful');
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setRole('');
    setMessage('Logged out');
  };

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">Academic Administration</p>
          <h1>Student Course Management</h1>
        </div>

        {role && (
          <div className="session">
            <span>{role}</span>
            <button type="button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        )}
      </header>

      {!role ? (
        <section className="login-panel">
          <div className="login-heading">
            <h2>Sign in</h2>
            <p>Access course and student records.</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <label>
              Username
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            <button className="primary-button" type="submit">
              Sign in
            </button>
          </form>
        </section>
      ) : (
        <Dashboard username={username} role={role} setMessage={setMessage} />
      )}

      {message && <p className="status-message">{message}</p>}
    </main>
  );
}

export default App;