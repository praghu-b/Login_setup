import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Courses from './home/Courses';
import Enrolled from './home/Enrolled';
import { useUser } from '../context/UserProvider';
import Profile from './Profile';

const UserHome = () => {
  const user = useUser();
  const [selectedOption, setSelectedOption] = useState('Courses');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.user_type === 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);


  const renderContent = () => {
    switch (selectedOption) {
      case 'Courses':
        return <Courses user={user} />;
      case 'Enrolled':
        return <Enrolled />;
      case 'Profile':
        return <Profile />;
      default:
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold">Welcome, {user?.name.split(' ')[0]}!</h1>
            <p>Select an option from the sidebar to get started.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex justify-end min-h-screen bg-gray-100">
      <Sidebar setSelectedOption={setSelectedOption} />
      <div className="w-4/5">{renderContent()}</div>
    </div>
  );
};

export default UserHome;
