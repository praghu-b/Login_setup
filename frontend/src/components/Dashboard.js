import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [username, setUsername] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(userInfo);
    if (user.user_type !== 'admin') {
      navigate('/login'); // Redirect if not an admin
      return;
    }

    const adminId = user.id;
    const username = user.name
    setUsername(username)

    fetch(`http://localhost:8000/admins/${adminId}/courses/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data.courses) {
          console.log('RESPONSE:', data.courses);
          setCourses(data.courses);
        } else {
          console.error("No courses data in response");
          setCourses([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching courses data:", error);
        setCourses([]);
      });
  }, [navigate]);

  const handleCreateCourse = () => {
    navigate("/create-course");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 container mx-auto">
          <div className="bg-white p-6 rounded shadow-md mb-6">
            <h3 className="text-2xl font-bold mb-2">Welcome back! <span className="text-blue-600">{username}</span></h3>
            <p className="text-gray-700">Select a course to view its details or create a new course.</p>
          </div>
          <button
            onClick={handleCreateCourse}
            className="bg-blue-500 gap-x-3 flex items-center text-white py-1 px-2 rounded mb-6 hover:bg-blue-600 transition duration-300"
          >
            Create Course<span className="text-3xl">+</span>
          </button>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <li key={course.course_id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-32 bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500">Course Image</span>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-lg font-semibold">{course.course_details.course_name}</h3>
                    <p className="text-xs text-gray-600">Duration: {course.course_details.duration}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    {course.status === 'published' ? <p className="text-xs text-white rounded-2xl px-2 py-1 bg-green-600">{course.status}</p> : <p className="text-xs text-white rounded-2xl px-2 py-1 bg-orange-600">{course.status}</p>}
                    <p className="text-xs text-gray-600">Level: {course.course_details.level}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;