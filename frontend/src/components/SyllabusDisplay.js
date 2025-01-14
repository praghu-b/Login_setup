import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function SyllabusDisplay() {
  const location = useLocation();
  const navigate = useNavigate();
  const [syllabus, setSyllabus] = useState(location.state?.syllabus || {});
  const [editingAll, setEditingAll] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUserInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

    if (!storedUserInfo || storedUserInfo.user_type !== 'admin') {
      navigate('/login');
      return;
    }

    console.log('SYLLABUS: ',syllabus);
    

    setUserId(storedUserInfo.id);
  }, [navigate]);

  const handleEditAll = () => {
    setEditingAll(true);
  };

  const handleSaveAll = () => {
    setEditingAll(false);
  };

  const handleChange = (e, moduleId, submoduleId) => {
    const { name, value } = e.target;
    setSyllabus((prevSyllabus) => {
      const updatedModules = prevSyllabus.modules.map((module) => {
        if (module.module_id === moduleId) {
          if (submoduleId) {
            const updatedSubmodules = module.submodules.map((submodule) => {
              if (submodule.submodule_id === submoduleId) {
                return { ...submodule, [name]: value };
              }
              return submodule;
            });
            return { ...module, submodules: updatedSubmodules };
          } else {
            return { ...module, [name]: value };
          }
        }
        return module;
      });
      return { ...prevSyllabus, modules: updatedModules };
    });
  };

  const handleSaveSyllabus = async () => {
    try {
      if (!userId) {
        throw new Error("User ID is missing");
      }

      const response = await fetch("http://localhost:8000/admins/update-syllabus/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ syllabus, id: userId }),
      });
      const data = await response.json();

      const contentResponse = await fetch("http://localhost:8000/admins/generate-content/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ syllabus: data.syllabus }),
      });
      const contentData = await contentResponse.json();
      

      navigate("/content", { state: { content: contentData.content, course_details: { course_name: syllabus.course_name, domain: syllabus.domain, level: syllabus.level, duration: syllabus.duration } } });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSelectMode = () => {
    setSelectMode(true);
  };

  const handleDeleteSelected = () => {
    setSyllabus((prevSyllabus) => {
      const updatedModules = prevSyllabus.modules
        .filter((module) => !selectedItems.includes(module.module_id))
        .map((module) => ({
          ...module,
          submodules: module.submodules.filter(
            (submodule) => !selectedItems.includes(submodule.submodule_id)
          ),
        }));
      return { ...prevSyllabus, modules: updatedModules };
    });
    setSelectMode(false);
    setSelectedItems([]);
  };

  const handleCheckboxChange = (id) => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.includes(id)
        ? prevSelectedItems.filter((item) => item !== id)
        : [...prevSelectedItems, id]
    );
  };

  if (!syllabus.modules) {
    return <div className="text-center text-red-500">No syllabus data available.</div>;
  }

  return (
    <div className="container mx-auto mt-8 p-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Generated Syllabus</h2>
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">Course Name: {syllabus.course_name}</h3>
        <p className="text-gray-700 mb-1"><span className="font-semibold">Domain:</span> {syllabus.domain}</p>
        <p className="text-gray-700 mb-1"><span className="font-semibold">Level:</span> {syllabus.level}</p>
        <p className="text-gray-700 mb-4"><span className="font-semibold">Duration:</span> {syllabus.duration}</p>
        <h3 className="text-xl font-semibold mt-4 text-gray-800">Modules:</h3>
        <div className="flex space-x-2 mt-2">
          {selectMode ? (
            <button
              onClick={handleDeleteSelected}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete Selected
            </button>
          ) : (
            <button
              onClick={handleSelectMode}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Select To Delete
            </button>
          )}
          <button
            onClick={handleEditAll}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Edit All
          </button>
          <button
            onClick={handleSaveAll}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Save All
          </button>
        </div>
        {syllabus.modules.map((module) => (
          <div key={module.module_id} className="mb-4 mt-4 p-4 border border-gray-200 rounded-lg">
            {selectMode && (
              <input
                type="checkbox"
                checked={selectedItems.includes(module.module_id)}
                onChange={() => handleCheckboxChange(module.module_id)}
                className="mr-2"
              />
            )}
            {editingAll ? (
              <input
                type="text"
                name="title"
                value={module.title}
                onChange={(e) => handleChange(e, module.module_id)}
                className="border border-gray-300 rounded p-2 w-full mb-2"
              />
            ) : (
              <h4 className="text-lg font-medium text-gray-800">{module.title}</h4>
            )}
            <ul className="list-disc list-inside mt-2">
              {module.submodules.map((submodule) => (
                <li key={submodule.submodule_id} className="ml-4 text-gray-700">
                  {selectMode && (
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(submodule.submodule_id)}
                      onChange={() => handleCheckboxChange(submodule.submodule_id)}
                      className="mr-2"
                    />
                  )}
                  {editingAll ? (
                    <input
                      type="text"
                      name="title"
                      value={submodule.title}
                      onChange={(e) => handleChange(e, module.module_id, submodule.submodule_id)}
                      className="border border-gray-300 rounded p-2 w-full"
                    />
                  ) : (
                    submodule.title
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <button
        onClick={handleSaveSyllabus}
        className="bg-green-500 text-white px-4 py-2 rounded mt-4"
      >
        Generate Content
      </button>
    </div>
  );
}

export default SyllabusDisplay;
