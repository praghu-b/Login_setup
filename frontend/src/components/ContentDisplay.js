import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function ContentDisplay() {
  const location = useLocation();
  const navigate = useNavigate();
  const [content, setContent] = useState(location.state?.content || {});
  const [course_details, setCourseDetails] = useState(location.state?.course_details || {});
  const [editingModule, setEditingModule] = useState(null);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [activeSubmoduleId, setActiveSubmoduleId] = useState(null);
  const [admin_id, setAdminId] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (Object.keys(content).length > 0) {
      const firstModuleId = Object.keys(content)[0];
      setActiveModuleId(firstModuleId);
      if (content[firstModuleId].submodules_content.length > 0) {
        setActiveSubmoduleId(content[firstModuleId].submodules_content[0].submodule_id);
      }
    }
    setAdminId(JSON.parse(localStorage.getItem("userInfo")).id);
  }, [content]);

  const handleEditModule = (moduleId) => {
    setEditingModule(moduleId);
  };

  const handleSaveModule = (moduleId) => {
    setEditingModule(null);
  };

  const handleChange = (e, moduleId, submoduleId, contentId) => {
    const { name, value } = e.target;
    setContent((prevContent) => {
      const updatedModules = { ...prevContent };
      if (contentId) {
        updatedModules[moduleId].submodules_content = updatedModules[moduleId].submodules_content.map((submodule) => {
          if (submodule.submodule_id === submoduleId) {
            submodule.contents = submodule.contents.map((contentItem) => {
              if (contentItem.content_id === contentId) {
                return { ...contentItem, [name]: value };
              }
              return contentItem;
            });
          }
          return submodule;
        });
      } else if (submoduleId) {
        updatedModules[moduleId].submodules_content = updatedModules[moduleId].submodules_content.map((submodule) => {
          if (submodule.submodule_id === submoduleId) {
            return { ...submodule, [name]: value };
          }
          return submodule;
        });
      } else {
        updatedModules[moduleId][name] = value;
      }
      return updatedModules;
    });
  };

  const handleRegenerateModule = async (moduleId) => {
    const module = content[moduleId];
    try {
      const response = await fetch("http://localhost:8000/admins/regenerate-module-content/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          module_title: module.module_content,
          submodules: module.submodules_content.map(submodule => submodule.content).join("\n"),
          level: "intermediate", // You can pass the actual level if available
        }),
      });
      const data = await response.json();
      setContent((prevContent) => ({
        ...prevContent,
        [moduleId]: data.module_content,
      }));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleNextSubmodule = () => {
    const moduleIds = Object.keys(content);
    const currentModuleIndex = moduleIds.indexOf(activeModuleId);
    const submodules = content[activeModuleId].submodules_content;
    const currentIndex = submodules.findIndex(submodule => submodule.submodule_id === activeSubmoduleId);

    if (currentIndex < submodules.length - 1) {
      setActiveSubmoduleId(submodules[currentIndex + 1].submodule_id);
    } else if (currentModuleIndex < moduleIds.length - 1) {
      const nextModuleId = moduleIds[currentModuleIndex + 1];
      setActiveModuleId(nextModuleId);
      setActiveSubmoduleId(content[nextModuleId].submodules_content[0].submodule_id);
    }
  };

  const handlePreviousSubmodule = () => {
    const moduleIds = Object.keys(content);
    const currentModuleIndex = moduleIds.indexOf(activeModuleId);
    const submodules = content[activeModuleId].submodules_content;
    const currentIndex = submodules.findIndex(submodule => submodule.submodule_id === activeSubmoduleId);

    if (currentIndex > 0) {
      setActiveSubmoduleId(submodules[currentIndex - 1].submodule_id);
    } else if (currentModuleIndex > 0) {
      const previousModuleId = moduleIds[currentModuleIndex - 1];
      setActiveModuleId(previousModuleId);
      setActiveSubmoduleId(content[previousModuleId].submodules_content[content[previousModuleId].submodules_content.length - 1].submodule_id);
    }
  };

  const handleSaveCourse = async (status) => {
    try {
      const response = await fetch("http://localhost:8000/admins/save-course/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          admin_id,
          status,
          course_details,
          content,
        }),
      });
      if (response.ok) {
        setShowPopup(true);
      } else {
        alert("Failed to save course.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while saving the course.");
    }
  };

  if (!content) {
    return <div className="text-center text-gray-500">No content data available.</div>;
  }

  return (
    <div className="relative flex justify-end min-h-screen">
      {showPopup && (
        <div className="fixed z-10 inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Course Created Successfully <CheckCircleIcon className="text-green-500"/></h2>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-[#8F2D56] text-white px-4 py-2 rounded"
            >
              Go To Dashboard
            </button>
          </div>
        </div>
      )}
      {/* Sidebar */}
      <div className="fixed top-0 left-0 bottom-0 bg-gray-800 text-white w-1/4 p-4 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <h2 className="text-xl font-bold mb-4 bg-[#8F2D56] text-white p-2 rounded">{course_details.course_name}</h2>
        {Object.keys(content).map((moduleId) => (
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
      <div className="w-3/4 bg-white text-gray-800 p-4" style={{ scrollbarWidth: 'none' }}>
        {activeModuleId && (
          <div className="mb-6 p-4 rounded-lg">
            <h3 className="text-xl text-[#8F2D56] font-semibold mb-2">
              {content[activeModuleId].module_title}
            </h3>
            {editingModule === activeModuleId ? (
              <textarea
                name="module_content"
                value={content[activeModuleId].module_content}
                onChange={(e) => handleChange(e, activeModuleId)}
                className="w-full p-2 border rounded mb-2"
              />
            ) : (
              <div
                dangerouslySetInnerHTML={{
                  __html: content[activeModuleId].module_content,
                }}
                className="mb-2"
              />
            )}

            <div className="flex justify-end items-center">
              {editingModule !== activeModuleId && (
                <button
                  onClick={() => handleEditModule(activeModuleId)}
                  className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                >
                  Edit
                </button>
              )}
              {editingModule === activeModuleId && (
                <button
                  onClick={() => handleSaveModule(activeModuleId)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:shadow-lg mr-2"
                >
                  Save
                </button>
              )}
              {/* <button
                onClick={() => handleRegenerateModule(activeModuleId)}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:shadow-lg"
              >
                Regenerate
              </button> */}
            </div>

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={handlePreviousSubmodule}
                className="bg-[#8F2D56] text-white px-4 py-2 rounded hover:shadow-lg"
                disabled={Object.keys(content).indexOf(activeModuleId) === 0 && content[activeModuleId].submodules_content.findIndex(submodule => submodule.submodule_id === activeSubmoduleId) === 0}
              >
                Previous
              </button>
              <small className="text-[#8F2D56]">Switch between submodules</small>
              <button
                onClick={handleNextSubmodule}
                className="bg-[#8F2D56] text-white px-4 py-2 rounded hover:shadow-lg"
                disabled={Object.keys(content).indexOf(activeModuleId) === Object.keys(content).length - 1 && content[activeModuleId].submodules_content.findIndex(submodule => submodule.submodule_id === activeSubmoduleId) === content[activeModuleId].submodules_content.length - 1}
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
                    {editingModule === activeModuleId ? (
                      <textarea
                        name="content"
                        value={submodule.content}
                        onChange={(e) =>
                          handleChange(e, activeModuleId, submodule.submodule_id)
                        }
                        className="w-full p-2 border rounded mb-2"
                      />
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: submodule.content,
                        }}
                        className="mb-2"
                      />
                    )}
                    {submodule.contents && submodule.contents.length > 0 && (
                      <div className="ml-3 mt-4">
                        {submodule.contents.map((contentItem) => (
                          <div key={contentItem.content_id} className="p-4 border border-[#D81159] shadow-lg rounded-lg mb-4">
                            <h5 className="text-md text-black font-bold mb-2">
                              {contentItem.title}
                            </h5>
                            {editingModule === activeModuleId ? (
                              <textarea
                                name="content"
                                value={contentItem.content}
                                onChange={(e) =>
                                  handleChange(e, activeModuleId, submodule.submodule_id, contentItem.content_id)
                                }
                                className="w-full p-2 border rounded mb-2"
                              />
                            ) : (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: contentItem.content,
                                }}
                                className="mb-2"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
            )}
          </div>
        )}
        <div className="space-x-4 font-bold">
          <button
            onClick={() => handleSaveCourse('drafted')}
            className="bg-orange-600 text-white px-4 py-2 rounded mt-4"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSaveCourse('published')}
            className="bg-green-600 text-white px-4 py-2 rounded mt-4"
          >
            Publish Course
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContentDisplay;
