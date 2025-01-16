import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoading } from '../context/LoadingContext';
import Sidebar from "./Sidebar";
import Main from "./Main";
import Enrollers from "./Enrollers";
import Profile from "./Profile";

const Dashboard = () => {
  const { setIsLoading } = useLoading();
  const [courses, setCourses] = useState([]);
  const [username, setUsername] = useState();
  const [selectedOption, setSelectedOption] = useState('Main');
  
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(userInfo);
    if (user.user_type !== 'admin') {
      navigate('/login'); // Redirect if not an admin
      return;
    }

    const adminId = user.id;
    const username = user.name;
    setUsername(username);

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/admins/${adminId}/courses/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        if (data.courses) {
          setCourses(data.courses);
        } else {
          console.error("No courses data in response");
          setCourses([]);
        }
      } catch (error) {
        console.error("Error fetching courses data:", error);
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();  // Call the async fetchData function
}, [navigate]);


  const renderContent = () => {
    switch (selectedOption) {
      case 'Main':
        return <Main courses={courses} setCourses={setCourses} username={username} />;
      case 'Enrollers':
        return <Enrollers id={'enrollers'} />;
      case 'Profile':
        return <Profile/>
      default:
        return <Main courses={courses} username={username} />;
    }
  };

  return (
    <div className="flex justify-end min-h-screen bg-gray-100">
      <Sidebar setSelectedOption={setSelectedOption} />
      {/* Content Space */}
      <div className="flex flex-col w-4/5">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;