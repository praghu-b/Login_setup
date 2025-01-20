"use client";

import { useState } from "react";

export default function CourseForm() {
  const [formData, setFormData] = useState({
    course_name: "",
    domain: "",
    level: "",
    tone: "",
    duration: "",
    modules: 1,
    moduleNames: [],
    submoduleNames: [],
  });

  const [isManualInput, setIsManualInput] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleManualInputChange = () => {
    setIsManualInput(!isManualInput);
  };

  const handleAddModule = () => {
    setFormData((prevData) => ({
      ...prevData,
      moduleNames: [...prevData.moduleNames, ""],
      submoduleNames: [...prevData.submoduleNames, []],
    }));
  };

  const handleAddSubmodule = (index) => {
    const updatedSubmodules = [...formData.submoduleNames];
    if (!updatedSubmodules[index]) {
      updatedSubmodules[index] = [];
    }
    updatedSubmodules[index].push("");
    setFormData((prevData) => ({ ...prevData, submoduleNames: updatedSubmodules }));
  };

  const handleDeleteModule = (index) => {
    const updatedModuleNames = [...formData.moduleNames];
    const updatedSubmoduleNames = [...formData.submoduleNames];
    updatedModuleNames.splice(index, 1);
    updatedSubmoduleNames.splice(index, 1);

    setFormData((prevData) => ({
      ...prevData,
      moduleNames: updatedModuleNames,
      submoduleNames: updatedSubmoduleNames,
    }));
  };

  const handleDeleteSubmodule = (moduleIndex, subIndex) => {
    const updatedSubmodules = [...formData.submoduleNames];
    updatedSubmodules[moduleIndex].splice(subIndex, 1);
    setFormData((prevData) => ({
      ...prevData,
      submoduleNames: updatedSubmodules,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://your-backend-api-url.com/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Form Data Submitted:", data);
      alert("Form Submitted Successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form");
    }
  };

  return (
    <div className="w-full bg-gray-100">
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-4 border-2 border-gray-300">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Create a New Course
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Course Name */}
            <div>
              <label htmlFor="course_name" className="block text-base font-semibold text-gray-800">
                Course Name
              </label>
              <input
                type="text"
                id="course_name"
                name="course_name"
                value={formData.course_name}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-indigo-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter course name"
                required
              />
            </div>

            {/* Domain */}
            <div>
              <label htmlFor="domain" className="block text-base font-semibold text-gray-800">
                Domain
              </label>
              <input
                type="text"
                id="domain"
                name="domain"
                value={formData.domain}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-indigo-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter domain"
                required
              />
            </div>

            {/* Level */}
            <div>
              <label htmlFor="level" className="block text-base font-semibold text-gray-800">
                Level
              </label>
              <input
                type="text"
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-indigo-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter level (e.g., Beginner, Intermediate, Advanced)"
                required
              />
            </div>

            {/* Tone */}
            <div>
              <label htmlFor="tone" className="block text-base font-semibold text-gray-800">
                Tone
              </label>
              <input
                type="text"
                id="tone"
                name="tone"
                value={formData.tone}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-indigo-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter tone (e.g., Formal, Informal)"
                required
              />
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-base font-semibold text-gray-800">
                Duration (in weeks)
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-indigo-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter duration"
                required
              />
            </div>

            {/* Manual Input Checkbox */}
            <div>
              <label htmlFor="manual" className="inline-flex items-center text-gray-800">
                <input
                  type="checkbox"
                  id="manual"
                  name="manual"
                  className="form-checkbox h-5 w-5 text-indigo-500"
                  onChange={handleManualInputChange}
                />
                <span className="ml-3 text-base font-semibold">Enable Manual Input</span>
              </label>
            </div>

            {/* Show Modules if Manual Input is selected */}
            {isManualInput && (
              <div>
                {/* Add Module Button */}
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleAddModule}
                    className="w-full bg-gradient-to-r from-green-400 to-teal-400 text-white py-2 rounded-lg font-semibold hover:from-green-500 hover:to-teal-500 transform transition-all duration-200"
                  >
                    Add Module
                  </button>
                </div>

                {/* Module Name Inputs */}
                {formData.moduleNames.map((_, index) => (
                  <div key={index} className="mt-4">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor={`module_name_${index}`}
                        className="block text-base font-semibold text-gray-800"
                      >
                        Module {index + 1} Name
                      </label>
                      <button
                        type="button"
                        onClick={() => handleDeleteModule(index)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg font-semibold hover:bg-red-600 transform transition-all duration-200"
                      >
                        Delete
                      </button>
                    </div>
                    <input
                      type="text"
                      id={`module_name_${index}`}
                      name={`module_name_${index}`}
                      value={formData.moduleNames[index] || ""}
                      onChange={(e) => {
                        const updatedModuleNames = [...formData.moduleNames];
                        updatedModuleNames[index] = e.target.value;
                        setFormData((prevData) => ({
                          ...prevData,
                          moduleNames: updatedModuleNames,
                        }));
                      }}
                      className="mt-1 w-full p-2 border border-indigo-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder={`Enter Module ${index + 1} Name`}
                    />

                    {/* Add Submodule Button */}
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => handleAddSubmodule(index)}
                        className="w-full bg-gradient-to-r from-blue-400 to-purple-500 text-white py-2 rounded-lg font-semibold hover:from-blue-500 hover:to-purple-600 transform transition-all duration-200"
                      >
                        Add Submodule
                      </button>
                    </div>

                    {/* Submodule Inputs */}
                    {formData.submoduleNames[index] &&
                      formData.submoduleNames[index].map((_, subIndex) => (
                        <div key={subIndex} className="mt-4">
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor={`submodule_name_${index}_${subIndex}`}
                              className="block text-base font-semibold text-gray-800"
                            >
                              Submodule {subIndex + 1}
                            </label>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubmodule(index, subIndex)}
                              className="bg-red-500 text-white px-3 py-1 rounded-lg font-semibold hover:bg-red-600 transform transition-all duration-200"
                            >
                              Delete
                            </button>
                          </div>
                          <input
                            type="text"
                            id={`submodule_name_${index}_${subIndex}`}
                            name={`submodule_name_${index}_${subIndex}`}
                            value={formData.submoduleNames[index][subIndex] || ""}
                            onChange={(e) => {
                              const updatedSubmodules = [...formData.submoduleNames];
                              updatedSubmodules[index][subIndex] = e.target.value;
                              setFormData((prevData) => ({
                                ...prevData,
                                submoduleNames: updatedSubmodules,
                              }));
                            }}
                            className="mt-1 w-full p-2 border border-indigo-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder={`Enter Submodule ${subIndex + 1}`}
                          />
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-orange-600 transform transition-all duration-200"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
