// src/components/ContentDisplay.js
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "tailwindcss/tailwind.css"; // Import Tailwind CSS

function ContentDisplay() {
  const location = useLocation();
  const navigate = useNavigate();
  const [content, setContent] = useState(location.state?.content || {});
  const [editingModule, setEditingModule] = useState(null);

  const handleEditModule = (moduleId) => {
    setEditingModule(moduleId);
  };

  const handleSaveModule = (moduleId) => {
    setEditingModule(null);
  };

  const handleChange = (e, moduleId, submoduleId) => {
    const { name, value } = e.target;
    setContent((prevContent) => {
      const updatedModules = { ...prevContent };
      if (submoduleId) {
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

  if (!content) {
    return <div className="text-center text-gray-500">No content data available.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Generated Content</h2>
      {Object.keys(content).map((moduleId) => (
        <div key={moduleId} className="mb-6 p-4 border rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Module {moduleId}</h3>
          {editingModule === moduleId ? (
            <textarea
              name="module_content"
              value={content[moduleId].module_content}
              onChange={(e) => handleChange(e, moduleId)}
              className="w-full p-2 border rounded mb-2"
            />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: content[moduleId].module_content }} className="mb-2" />
          )}
          <button
            onClick={() => handleEditModule(moduleId)}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          >
            Edit
          </button>
          {editingModule === moduleId && (
            <button
              onClick={() => handleSaveModule(moduleId)}
              className="bg-green-500 text-white px-4 py-2 rounded mr-2"
            >
              Save
            </button>
          )}
          <button
            onClick={() => handleRegenerateModule(moduleId)}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Regenerate
          </button>
          {content[moduleId].submodules_content.map((submodule) => (
            <div key={submodule.submodule_id} className="mt-4 p-4 border rounded-lg">
              <h4 className="text-lg font-medium mb-2">Submodule {submodule.submodule_id}</h4>
              {editingModule === moduleId ? (
                <textarea
                  name="content"
                  value={submodule.content}
                  onChange={(e) => handleChange(e, moduleId, submodule.submodule_id)}
                  className="w-full p-2 border rounded mb-2"
                />
              ) : (
                <div dangerouslySetInnerHTML={{ __html: submodule.content }} className="mb-2" />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default ContentDisplay;
