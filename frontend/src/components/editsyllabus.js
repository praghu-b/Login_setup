import React, { useState } from 'react';
import axios from 'axios';
import './EditSyllabus.css';

const EditSyllabus = () => {
  const [syllabusId, setSyllabusId] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/edit-syllabus/', {
        syllabus_id: syllabusId,
        content: content,
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage('An error occurred while updating the syllabus.');
    }
  };

  return (
    <div className="edit-syllabus-container">
      <h2>Edit Syllabus</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Syllabus ID:</label>
          <input
            type="text"
            value={syllabusId}
            onChange={(e) => setSyllabusId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>New Content:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <button type="submit">Update Syllabus</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default EditSyllabus;