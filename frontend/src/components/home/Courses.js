import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../../context/LoadingContext';
import axios from 'axios';
import CoursePreview from './CoursePreview';

const Courses = ({ user }) => {
  const { setIsLoading } = useLoading();
  const [courses, setCourses] = useState([]);
  const [previewSyllabus, setPreviewSyllabus] = useState(null);
  const [isPopUp, setIsPopUp] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    axios.get("http://localhost:8000/users/fetch-all-courses/", {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        const data = response.data;
        if (data.courses) {
          setCourses(data.courses);
        }
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
      })
      .finally(() => {
        setIsLoading(false);  // Ensures loading is set to false after the request is finished
      });
  }, [user]);


  const handleCoursePreview = async (courseId) => {
    setIsLoading(true);
    await axios.get(`http://localhost:8000/users/${courseId}/fetch-syllabus/`, {
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
      })
      .finally(() => {
        setIsLoading(false)
      });
  };

  return (
    <div className="flex-1 py-4">
      <h3 className="text-2xl font-bold text-gray-800 mb-4 mt-4 px-8">Published Courses</h3>
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
      {isPopUp && <CoursePreview syllabus={{ previewSyllabus }} setIsPopUp={setIsPopUp} status={'enroll'} />}
    </div>
  );
};

export default Courses;
