import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    return (
        <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
            <ul>
                <li className="mb-2">
                    <button
                        onClick={() => navigate('/user-home/enrollers')}
                        className="w-full py-2 px-4 rounded hover:bg-gray-700 transition duration-300"
                    >
                        Enrollers
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