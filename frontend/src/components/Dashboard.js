// src/components/Dashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // Import the CSS file for styling

function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch courses from the backend
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:8000/admins/dashboard/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setCourses(data.courses);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseClick = async (courseName) => {
    try {
      const response = await fetch(`http://localhost:8000/admins/dashboard/${courseName}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setSelectedCourse(data.course);
      setSelectedModule(null);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleModuleClick = (moduleId) => {
    setSelectedModule(moduleId);
  };

  const handleNextModule = () => {
    if (selectedCourse && selectedCourse.syllabus.modules.length > 0) {
      const currentIndex = selectedCourse.syllabus.modules.findIndex(
        (module) => module.module_id === selectedModule
      );
      const nextIndex = (currentIndex + 1) % selectedCourse.syllabus.modules.length;
      setSelectedModule(selectedCourse.syllabus.modules[nextIndex].module_id);
    }
  };

  const handlePreviousModule = () => {
    if (selectedCourse && selectedCourse.syllabus.modules.length > 0) {
      const currentIndex = selectedCourse.syllabus.modules.findIndex(
        (module) => module.module_id === selectedModule
      );
      const previousIndex =
        (currentIndex - 1 + selectedCourse.syllabus.modules.length) % selectedCourse.syllabus.modules.length;
      setSelectedModule(selectedCourse.syllabus.modules[previousIndex].module_id);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>Courses</h2>
        <ul>
          {courses.map((course) => (
            <li key={course.course_name} onClick={() => handleCourseClick(course.course_name)}>
              {course.course_name}
            </li>
          ))}
        </ul>
      </div>
      <div className="content">
        {selectedCourse && (
          <div>
            <h2>{selectedCourse.course_name}</h2>
            <div className="modules">
              {selectedCourse.syllabus.modules.map((module) => (
                <div
                  key={module.module_id}
                  className={`module ${selectedModule === module.module_id ? "selected" : ""}`}
                  onClick={() => handleModuleClick(module.module_id)}
                >
                  {module.title}
                </div>
              ))}
            </div>
            {selectedModule && (
              <div className="module-content">
                <h3>{selectedCourse.syllabus.modules.find((module) => module.module_id === selectedModule).title}</h3>
                <div dangerouslySetInnerHTML={{ __html: selectedCourse.content[selectedModule].module_content }} />
                {selectedCourse.content[selectedModule].submodules_content.map((submodule) => (
                  <div key={submodule.submodule_id} className="submodule-content">
                    <h4>{submodule.submodule_id}</h4>
                    <div dangerouslySetInnerHTML={{ __html: submodule.content }} />
                  </div>
                ))}
                <button onClick={handlePreviousModule}>Previous</button>
                <button onClick={handleNextModule}>Next</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
