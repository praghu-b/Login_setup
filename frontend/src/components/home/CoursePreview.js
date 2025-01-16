import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../../context/LoadingContext';

const CoursePreview = ({ syllabus, setIsPopUp, status }) => {
    const { setIsLoading } = useLoading()
    const navigate = useNavigate()
    const { previewSyllabus } = syllabus || {};

    const user_id = JSON.parse(localStorage.getItem('userInfo')).id;

    if (!previewSyllabus) {
        return <div className="text-center text-gray-500">No syllabus available</div>;
    }

    const renderSubmodules = (submodules) => {
        return submodules.map(submodule => (
            <div key={submodule.title} className="submodule ml-2 mb-1 p-1 border rounded bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700">{submodule.title}</h4>
            </div>
        ));
    };

    const renderModules = (modules) => {
        return Object.values(modules).map(module => (
            <div key={module.module_title} className="module mb-2 p-2 border rounded shadow-sm bg-white">
                <h3 className="text-lg font-semibold text-gray-800">{module.module_title}</h3>
                {module.submodules_content && module.submodules_content.length > 0 && renderSubmodules(module.submodules_content)}
            </div>
        ));
    };

    const handleEnroll = () => {
        const enrollInCourse = async () => {
            setIsLoading(true)
            try {
                const response = await fetch('http://localhost:8000/users/enroll/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ course_id: previewSyllabus._id, user_id: user_id }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to enroll in course');
                }

                await response.json();
                setIsPopUp(false);
            } catch (error) {
                console.error('Error enrolling in course:', error);
                alert(error.message);
                setIsPopUp(false);
            } finally {
                setIsLoading(false)
            }
        };

        enrollInCourse();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-auto p-4">
            <div className="bg-white p-4 rounded-lg shadow-lg max-w-2xl w-full max-h-full overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">{previewSyllabus.course_details.course_name}</h2>
                <div className="mb-4">
                    <p><strong>Instructor:</strong> {previewSyllabus.course_details.instructor}</p>
                    <p><strong>Duration:</strong> {previewSyllabus.course_details.duration}</p>
                    <p><strong>Level:</strong> {previewSyllabus.course_details.level}</p>
                </div>
                {renderModules(previewSyllabus.content)}
                {status === 'enroll' ? (
                    <button
                        onClick={handleEnroll}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Enroll
                    </button>
                ) : (
                    <button
                        onClick={() => navigate('/course-content', { state: { syllabus: previewSyllabus.content, course_topic: previewSyllabus.course_details.course_name } })}
                        className="mt-4 ml-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Start
                    </button>
                )}
                <button
                    onClick={() => setIsPopUp(false)}
                    className="mt-4 ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default CoursePreview;
