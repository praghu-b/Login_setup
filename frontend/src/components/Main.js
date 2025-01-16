import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../context/LoadingContext';

const Main = ({ courses, username, setCourses }) => {
    const { setIsLoading } = useLoading();
    const navigate = useNavigate();

    const handleCreateCourse = () => {
        navigate("/create-course");
    };

    const handlePublish = async (course_id) => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:8000/admins/publish/', {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    course_id: course_id
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error:", errorData.error || "Something went wrong");
                return;
            }

            const data = await response.json();
            alert(data.message);

            // Update the course status in the parent state
            setCourses((prevCourses) =>
                prevCourses.map((course) =>
                    course.course_id === course_id
                        ? { ...course, status: 'published' }
                        : course
                )
            );
        } catch (error) {
            console.error("Error publishing the course:", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex-1 p-6 container mx-auto">
            <h2 className="text-2xl font-semibold mb-4">AI Generated Courses</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <li key={course.course_id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="h-32 bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-500">{course.course_details.course_name}</span>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="text-lg font-semibold">{course.course_details.course_name}</h3>
                                <p className="text-xs text-gray-600">Duration: {course.course_details.duration}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                {course.status === 'published' ? (
                                    <p className="text-xs text-white rounded-2xl px-2 py-1 bg-green-600">
                                        {course.status}
                                    </p>
                                ) : (
                                    <div className="flex gap-x-2">
                                        <p className="text-xs text-white rounded-2xl px-2 py-1 bg-orange-600">
                                            {course.status}
                                        </p>
                                        <button
                                            className="text-xs text-white rounded-2xl px-2 py-1 bg-blue-600"
                                            onClick={() => handlePublish(course.course_id)}
                                        >
                                            Publish
                                        </button>
                                    </div>
                                )}
                                <p className="text-xs text-gray-600">Level: {course.course_details.level}</p>
                            </div>
                        </div>
                    </li>
                ))}
                <li className="flex justify-center items-center">
                    <button
                        onClick={handleCreateCourse}
                        className="bg-blue-500 gap-x-3 flex items-center text-white py-2 px-3 rounded-full mb-6 hover:bg-blue-600 transition duration-300"
                    >
                        Create New<span className="text-3xl">+</span>
                    </button>
                </li>
            </ul>
        </main>
    );
};

export default Main;
