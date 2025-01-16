import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLoading } from '../../context/LoadingContext';

const CourseContent = () => {
    const { setIsLoading } = useLoading();
    const location = useLocation();
    const navigate = useNavigate();
    const content = location.state?.syllabus;
    const course_name = location.state?.course_topic;
    const [activeModuleId, setActiveModuleId] = useState(null);
    const [activeSubmoduleId, setActiveSubmoduleId] = useState(null);

    useEffect(() => {
        setIsLoading(true);
    
        if (Object.keys(content).length > 0) {
            const firstModuleId = Object.keys(content)[0];
            setActiveModuleId(firstModuleId);
            const firstSubmodule = content[firstModuleId]?.submodules_content[0];
            if (firstSubmodule) {
                setActiveSubmoduleId(firstSubmodule.submodule_id);
            }
        }
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    
        return () => clearTimeout(timer);
    
    }, [content]);
    

    const handleNextSubmodule = () => {
        const submodules = content[activeModuleId].submodules_content;
        const currentIndex = submodules.findIndex(submodule => submodule.submodule_id === activeSubmoduleId);
        if (currentIndex < submodules.length - 1) {
            setActiveSubmoduleId(submodules[currentIndex + 1].submodule_id);
        } else {
            const moduleIds = Object.keys(content);
            const currentModuleIndex = moduleIds.findIndex(moduleId => moduleId === activeModuleId);
            if (currentModuleIndex < moduleIds.length - 1) {
                const nextModuleId = moduleIds[currentModuleIndex + 1];
                setActiveModuleId(nextModuleId);
                setActiveSubmoduleId(content[nextModuleId].submodules_content[0].submodule_id);
            }
        }
    };

    const handlePreviousSubmodule = () => {
        const submodules = content[activeModuleId].submodules_content;
        const currentIndex = submodules.findIndex(submodule => submodule.submodule_id === activeSubmoduleId);
        if (currentIndex > 0) {
            setActiveSubmoduleId(submodules[currentIndex - 1].submodule_id);
        } else {
            const moduleIds = Object.keys(content);
            const currentModuleIndex = moduleIds.findIndex(moduleId => moduleId === activeModuleId);
            if (currentModuleIndex > 0) {
                const previousModuleId = moduleIds[currentModuleIndex - 1];
                setActiveModuleId(previousModuleId);
                setActiveSubmoduleId(content[previousModuleId].submodules_content[content[previousModuleId].submodules_content.length - 1].submodule_id);
            }
        }
    };

    return (
        <div className="flex relative">
            {/* Sidebar */}
            <div className="fixed top-0 left-0 bottom-0 bg-gray-800 text-white w-1/4 p-4 overflow-y-auto" style={{ scrollbarWidth: 'none'}}>
                <h2 className="text-xl font-bold mb-4 bg-[#8F2D56] text-white p-2 rounded">{course_name}</h2>
                {content && Object.keys(content).map((moduleId) => (
                    <div key={moduleId} className="mb-4" style={{ scrollbarWidth: '0' }}>
                        <h3
                            className="text-sm font-bold cursor-pointer"
                            onClick={() => setActiveModuleId(moduleId)}
                        >
                            {content[moduleId].module_title}
                        </h3>
                        <ul className="">
                            {content[moduleId].submodules_content.map((submodule) => (
                                <li
                                    key={submodule.submodule_id}
                                    className={`text-sm cursor-pointer my-2 py-1 rounded-lg pl-4 hover:bg-[#8F2D5670] ${activeSubmoduleId === submodule.submodule_id ? 'bg-[#8F2D56] text-white hover:bg-[#8F2D56]' : ''}`}
                                    onClick={() => {
                                        setActiveSubmoduleId(submodule.submodule_id);
                                        setActiveModuleId(moduleId);
                                    }}
                                >
                                    {submodule.title}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Content Space */}
            <div className="w-3/4 bg-white h-full text-gray-800 p-4 ml-auto">
                {activeModuleId && (
                    <div className="mb-6 p-4 rounded-lg">
                        <h3 className="text-xl text-[#8F2D56] font-semibold mb-2">
                            {content[activeModuleId].module_title}
                        </h3>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: content[activeModuleId].module_content,
                            }}
                            className="mb-2"
                        />

                        <div className="flex justify-between items-center mt-4">
                            <button
                                onClick={handlePreviousSubmodule}
                                className="bg-[#8F2D56] text-white px-4 py-2 rounded hover:shadow-lg"
                                disabled={!content[activeModuleId].submodules_content.find((submodule, index, array) => array[index - 1] && submodule.submodule_id === activeSubmoduleId) && Object.keys(content).findIndex(moduleId => moduleId === activeModuleId) === 0}
                            >
                                Previous
                            </button>
                            <small className="text-[#8F2D56]">Switch between topics</small>
                            <button
                                onClick={handleNextSubmodule}
                                className="bg-[#8F2D56] text-white px-4 py-2 rounded hover:shadow-lg"
                                disabled={!content[activeModuleId].submodules_content.find((submodule, index, array) => array[index + 1] && submodule.submodule_id === activeSubmoduleId) && Object.keys(content).findIndex(moduleId => moduleId === activeModuleId) === Object.keys(content).length - 1}
                            >
                                Next
                            </button>
                        </div>

                        {/* Submodules */}
                        {content[activeModuleId].submodules_content.map(
                            (submodule) =>
                                activeSubmoduleId === submodule.submodule_id && (
                                    <div key={submodule.submodule_id} className="mt-4 p-4 rounded-lg">
                                        <h4 className="text-lg text-black font-bold mb-2">
                                            {submodule.title}
                                        </h4>
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: submodule.content,
                                            }}
                                            className="mb-2"
                                        />
                                        {submodule.contents && submodule.contents.length > 0 && (
                                            <div className="ml-3 mt-4">
                                                {submodule.contents.map((contentItem) => (
                                                    <div key={contentItem.content_id} className="p-4 border border-[#D81159] shadow-lg rounded-lg mb-4">
                                                        <h5 className="text-md text-black font-bold mb-2">
                                                            {contentItem.title}
                                                        </h5>
                                                        <div
                                                            dangerouslySetInnerHTML={{
                                                                __html: contentItem.content,
                                                            }}
                                                            className="mb-2"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                        )}
                    </div>
                )}
                <button
                    onClick={() => navigate('/user-home')}
                    className="fixed top-5 right-5 bg-gray-600 hover:bg-gray-800 text-white px-4 py-2 rounded"
                >
                    Go To Dashboard
                </button>
            </div>
        </div>
    );
};

export default CourseContent;