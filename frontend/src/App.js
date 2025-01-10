// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import CourseDetails from "./components/CourseDetails";
import SyllabusDisplay from "./components/SyllabusDisplay";
import ContentDisplay from "./components/ContentDisplay";
import './index.css'
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-course" element={<CourseDetails />} />
        <Route path="/syllabus" element={<SyllabusDisplay />} />
        <Route path="/content" element={<ContentDisplay />} />
      </Routes>
    </Router>
  );
}

export default App;
