// src/components/Dashboard.js
import React, { useEffect, useState } from "react";
import {  useNavigate } from "react-router-dom";
import "./Dashboard.css"; // Import the CSS file for styling

function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedSubmodule, setSelectedSubmodule] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/admins/dashboard/")
      .then((response) => response.json())
      // .then((data) => setCourses(data.courses))
      .catch((error) => console.error("Error fetching dashboard data:", error));
  }, []);

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setSelectedModule(null);
    setSelectedSubmodule(null);
  };

  const handleModuleClick = (module) => {
    setSelectedModule(module);
    setSelectedSubmodule(null);
  };

  const handleSubmoduleClick = (submodule) => {
    setSelectedSubmodule(submodule);
  };

  const handleCreateCourse = () => {
    navigate("/create-course");
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>Courses</h2>
        <button onClick={handleCreateCourse}>Create Course</button>
        <ul>
          {courses.map((course) => (
            <li key={course.course_name} onClick={() => handleCourseClick(course)}>
              {course.course_name}
              {selectedCourse === course && (
                <ul>
                  {course.modules.map((module) => (
                    <li key={module.module_id} onClick={() => handleModuleClick(module)}>
                      {module.title}
                      {selectedModule === module && (
                        <ul>
                          {module.submodules.map((submodule) => (
                            <li key={submodule.submodule_id} onClick={() => handleSubmoduleClick(submodule)}>
                              {submodule.title}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="content-area">
        {selectedSubmodule ? (
          <div>
            <h3>{selectedSubmodule.title}</h3>
            <p>{selectedSubmodule.content}</p>
          </div>
        ) : selectedModule ? (
          <div>
            <h3>{selectedModule.title}</h3>
            <p>{selectedModule.content}</p>
          </div>
        ) : selectedCourse ? (
          <div>
            <h3>{selectedCourse.course_name}</h3>
            <p>{selectedCourse.content}</p>
          </div>
        ) : (
          <div>
            <h3>Welcome to the AI Syllabus Generator Dashboard</h3>
            <p>Select a course to view its details.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
