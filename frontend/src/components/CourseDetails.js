// src/components/CourseDetails.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function CourseDetails() {
  const [courseDetails, setCourseDetails] = useState({
    course_name: "",
    domain: "",
    level: "",
    tone: "",
    duration: "",
    num_modules: "",
    manual_input: false,
    modules: [],
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCourseDetails((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleModuleChange = (e, moduleIndex, submoduleIndex) => {
    const { name, value } = e.target;
    setCourseDetails((prevState) => {
      const modules = [...prevState.modules];
      if (submoduleIndex !== undefined) {
        modules[moduleIndex].submodules[submoduleIndex][name] = value;
      } else {
        modules[moduleIndex][name] = value;
      }
      return { ...prevState, modules };
    });
  };

  const handleAddModule = () => {
    setCourseDetails((prevState) => ({
      ...prevState,
      modules: [
        ...prevState.modules,
        {
          module_id: prevState.modules.length + 1,
          title: "",
          submodules: [{ submodule_id: `${prevState.modules.length + 1}.1`, title: "" }],
        },
      ],
    }));
  };

  const handleAddSubmodule = (moduleIndex) => {
    setCourseDetails((prevState) => {
      const modules = [...prevState.modules];
      modules[moduleIndex].submodules.push({
        submodule_id: `${moduleIndex + 1}.${modules[moduleIndex].submodules.length + 1}`,
        title: "",
      });
      return { ...prevState, modules };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/admins/generate-syllabus/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseDetails),
      });
      const data = await response.json();
      navigate("/syllabus", { state: { syllabus: data.syllabus } });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Create Course</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="course_name"
          placeholder="Course Name"
          value={courseDetails.course_name}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          name="domain"
          placeholder="Domain"
          value={courseDetails.domain}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          name="level"
          placeholder="Level"
          value={courseDetails.level}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          name="tone"
          placeholder="Tone"
          value={courseDetails.tone}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          name="duration"
          placeholder="Duration"
          value={courseDetails.duration}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          type="number"
          name="num_modules"
          placeholder="Number of Modules"
          value={courseDetails.num_modules}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="manual_input"
            checked={courseDetails.manual_input}
            onChange={handleChange}
            className="form-checkbox"
          />
          <span>Manual Input</span>
        </label>
        {courseDetails.manual_input && (
          <div className="space-y-4">
            {courseDetails.modules.map((module, moduleIndex) => (
              <div key={module.module_id} className="space-y-2">
                <input
                  type="text"
                  name="title"
                  placeholder={`Module ${module.module_id} Title`}
                  value={module.title}
                  onChange={(e) => handleModuleChange(e, moduleIndex)}
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                />
                {module.submodules.map((submodule, submoduleIndex) => (
                  <input
                    key={submodule.submodule_id}
                    type="text"
                    name="title"
                    placeholder={`Submodule ${submodule.submodule_id} Title`}
                    value={submodule.title}
                    onChange={(e) => handleModuleChange(e, moduleIndex, submoduleIndex)}
                    required
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => handleAddSubmodule(moduleIndex)}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Add Submodule
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddModule}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Add Module
            </button>
          </div>
        )}
        <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded">
          Submit
        </button>
      </form>
    </div>
  );
}

export default CourseDetails;
