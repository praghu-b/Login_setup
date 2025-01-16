import { useNavigate } from 'react-router-dom';

const Sidebar = ({ setSelectedOption }) => {
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    return (
        <div className="fixed left-0 bg-gray-800 text-white w-1/5 min-h-screen p-4">
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
            <ul>
                {userInfo.user_type === 'admin' && (
                    <>
                        <li className="mb-2">
                            <button
                                onClick={() => setSelectedOption('Main')}
                                className="w-full py-2 px-4 rounded hover:bg-gray-700 transition duration-300"
                            >
                                Main
                            </button>
                        </li>
                        <li className="mb-2">
                            <button
                                onClick={() => setSelectedOption('Enrollers')}
                                className="w-full py-2 px-4 rounded hover:bg-gray-700 transition duration-300"
                            >
                                Enrollers
                            </button>
                        </li>
                    </>
                )}
                {userInfo.user_type === 'user' && (
                    <>
                        <li className="mb-2">
                            <button
                                onClick={() => setSelectedOption('Courses')}
                                className="w-full py-2 px-4 rounded hover:bg-gray-700 transition duration-300"
                            >
                                Courses
                            </button>
                        </li>
                        <li className="mb-2">
                            <button
                                onClick={() => setSelectedOption('Enrolled')}
                                className="w-full py-2 px-4 rounded hover:bg-gray-700 transition duration-300"
                            >
                                Enrolled
                            </button>
                        </li>
                    </>
                )}
                <li className="mb-2">
                    <button
                        onClick={() => setSelectedOption('Profile')}
                        className="w-full py-2 px-4 rounded hover:bg-gray-700 transition duration-300"
                    >
                        Profile
                    </button>
                </li>
                <li className="mb-2">
                    <button
                        onClick={handleLogout}
                        className="w-full py-2 px-4 rounded bg-red-500 hover:bg-red-700 transition duration-300"
                    >
                        Logout
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;