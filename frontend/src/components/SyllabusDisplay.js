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

    setUserId(storedUserInfo.id);
    
    // if (storedUserInfo?.id) {
    //   setUserId(storedUserInfo.id);
    //   console.log("storedUserInfo", storedUserInfo.id);


    // } else {
    //   console.error("User ID not found in localStorage");
    // }
  }, []);
  

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

      navigate("/content", { state: { content: contentData.content } });
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
      <h2 className="text-2xl font-bold mb-4">Generated Syllabus</h2>
      <div className="bg-white shadow-md rounded p-4">
        <h3 className="text-xl font-semibold">Course Name: {syllabus.course_name}</h3>
        <p className="text-gray-700">Domain: {syllabus.domain}</p>
        <p className="text-gray-700">Level: {syllabus.level}</p>
        <p className="text-gray-700">Duration: {syllabus.duration}</p>
        <h3 className="text-lg font-semibold mt-4">Modules:</h3>
        {selectMode ? (
          <button
            onClick={handleDeleteSelected}
            className="bg-red-500 text-white px-4 py-2 rounded mt-2 mr-2"
          >
            Delete Selected
          </button>
        ) : (
          <button
            onClick={handleSelectMode}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2 mr-2"
          >
            Select To Delete
          </button>
        )}
        <button
          onClick={handleEditAll}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-2 mr-2"
        >
          Edit All
        </button>
        <button
          onClick={handleSaveAll}
          className="bg-green-500 text-white px-4 py-2 rounded mt-2 mr-2"
        >
          Save All
        </button>
        {syllabus.modules.map((module) => (
          <div key={module.module_id} className="mb-4">
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
                className="border border-gray-300 rounded p-2 w-full"
              />
            ) : (
              <h4 className="text-lg font-medium">{module.title}</h4>
            )}
            <ul className="list-disc list-inside mt-2">
              {module.submodules.map((submodule) => (
                <li key={submodule.submodule_id} className="ml-4">
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
        Save Syllabus
      </button>
    </div>
  );
}

export default SyllabusDisplay;
