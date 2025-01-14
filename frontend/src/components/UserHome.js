import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import CoursePreview from './home/CoursePreview';

const UserHome = () => {
  const [user, setUser] = useState(null);
  const [previewSyllabus, setPreviewSyllabus] = useState(null);
  const [courses, setCourses] = useState([]);
  const [isPopUp, setIsPopUp] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userInfo);
    if (parsedUser.user_type === 'admin') {
      navigate('/admin-home');
      return;
    }
    setUser(parsedUser);

    // Fetch courses
    axios.get("http://localhost:8000/users/fetch-all-courses/", {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        const data = response.data;
        if (data.courses) {
          setCourses(data.courses);
          console.log('COURSES:', data.courses);
        }
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
      });
  }, [navigate]);

  const handleProfileClick = (event) => {
    navigate('/profile');
  };

  const handleClose = () => {
    // setAnchorEl(null);
  };

  const handleMenuItemClick = (path) => {
    handleClose();
    navigate(path);
  };

  const handleCoursePreview = (courseId) => {
    axios.get(`http://localhost:8000/users/${courseId}/fetch-syllabus/`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        const data = response.data;
        setPreviewSyllabus(data.course);
        setIsPopUp(true);
      })
      .catch((error) => {
        console.error("Error fetching course data:", error);
      });
  };

  if (!user) return null;

  const firstName = user.name.split(' ')[0];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      {isPopUp && <CoursePreview syllabus={{ previewSyllabus }} setIsPopUp={setIsPopUp} />}
      <div className="flex-1 py-8">
        <div className="flex justify-between items-center px-8 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">AI Coursify</h1>
            <h2 className="text-xl text-gray-600 mt-2">Welcome, {firstName}!</h2>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-4 mt-8 px-8">Published Courses</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-8">
          {courses.map((course, index) => (
            <div key={course.course_id || index} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img className="w-full bg-gray-200 h-52 object-cover" />
              <div className="flex justify-between p-4">
                <div className=''>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">{course.course_details.course_name}</h4>
                  <p className="text-gray-600 text-sm">{course.course_details.domain} - {course.course_details.level}</p>
                  <p className="text-gray-600 text-sm">{course.course_details.duration}</p>
                </div>
                <div className='my-auto'>
                  <button onClick={() => handleCoursePreview(course.course_id)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-2xl">Syllabus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserHome;
