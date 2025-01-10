// src/components/SyllabusDisplay.js
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./SyllabusDisplay.css"; // Import the CSS file for styling

function SyllabusDisplay() {
  const location = useLocation();
  const navigate = useNavigate();
  const [syllabus, setSyllabus] = useState(location.state?.syllabus || {});
  const [editingModule, setEditingModule] = useState(null);

  const handleEditModule = (moduleId) => {
    setEditingModule(moduleId);
  };

  const handleSaveModule = (moduleId) => {
    setEditingModule(null);
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
      const response = await fetch("http://localhost:8000/admins/update-syllabus/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ syllabus }),
      });
      const data = await response.json();

      // Generate content for the syllabus
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

  if (!syllabus) {
    return <div className="text-center text-red-500">No syllabus data available.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Generated Syllabus</h2>
      <div className="bg-white shadow-md rounded p-4">
        <h3 className="text-xl font-semibold">Course Name: {syllabus.course_name}</h3>
        <p className="text-gray-700">Domain: {syllabus.domain}</p>
        <p className="text-gray-700">Level: {syllabus.level}</p>
        <p className="text-gray-700">Duration: {syllabus.duration}</p>
        <h3 className="text-lg font-semibold mt-4">Modules:</h3>
        {syllabus.modules.map((module) => (
          <div key={module.module_id} className="mb-4">
            {editingModule === module.module_id ? (
              <input
                type="text"
                name="title"
                value={module.title}
                onChange={(e) => handleChange(e, module.module_id)}
                className="border rounded p-2 w-full"
              />
            ) : (
              <h4 className="text-lg font-medium">{module.title}</h4>
            )}
            <button
              onClick={() => handleEditModule(module.module_id)}
              className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
            >
              Edit
            </button>
            {editingModule === module.module_id && (
              <button
                onClick={() => handleSaveModule(module.module_id)}
                className="bg-green-500 text-white px-2 py-1 rounded"
              >
                Save
              </button>
            )}
            <ul className="list-disc list-inside ml-4">
              {module.submodules.map((submodule) => (
                <li key={submodule.submodule_id} className="mt-2">
                  {editingModule === module.module_id ? (
                    <input
                      type="text"
                      name="title"
                      value={submodule.title}
                      onChange={(e) => handleChange(e, module.module_id, submodule.submodule_id)}
                      className="border rounded p-2 w-full"
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
