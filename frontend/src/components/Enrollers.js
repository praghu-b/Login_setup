import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLoading } from '../context/LoadingContext';

const Enrollers = () => {
    const { setIsLoading } = useLoading();
    const [enrollers, setEnrollers] = useState([]);
    const adminId = JSON.parse(localStorage.getItem('userInfo')).id;

    useEffect(() => {
        const fetchEnrollers = async () => {
            setIsLoading(true); // Start loading
            try {
                const response = await axios.get(`http://localhost:8000/admins/enrollments/${adminId}`);
                setEnrollers(response.data.enrollments);
            } catch (error) {
                console.error('Error fetching enrollers:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEnrollers();
    }, [adminId, setIsLoading]);

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl text-gray-800 font-bold mb-4">Enrollers List</h2>
            <div className="overflow-x-auto text-xs">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr className="bg-gray-300 text-gray-800">
                            <th className="py-2 px-2 border border-gray-400">User Name</th>
                            <th className="py-2 px-2 border border-gray-400">Course Name</th>
                            <th className="py-2 px-2 border border-gray-400">Email</th>
                            <th className="py-2 px-2 border border-gray-400">Mobile</th>
                            <th className="py-2 px-2 border border-gray-400">Status</th>
                            <th className="py-2 px-2 border border-gray-400">Enrollment Date</th>
                            <th className="py-2 px-2 border border-gray-400">Progress</th>
                        </tr>
                    </thead>
                    <tbody>
                        {enrollers.map(enroller => (
                            <tr key={enroller.enrollment_id} className="text-center cursor-pointer">
                                <td className="py-2 px-2 border border-gray-400 hover:bg-gray-100">{enroller.user_name}</td>
                                <td className="py-2 px-2 border border-gray-400 hover:bg-gray-100">{enroller.course_name}</td>
                                <td className="py-2 px-2 border border-gray-400 hover:bg-gray-100">{enroller.email}</td>
                                <td className="py-2 px-2 border border-gray-400 hover:bg-gray-100">{enroller.mobile_number}</td>
                                <td className="py-2 px-2 border border-gray-400 hover:bg-gray-100">{enroller.status}</td>
                                <td className="py-2 px-2 border border-gray-400 hover:bg-gray-100">{new Date(enroller.enrollment_date).toLocaleDateString()}</td>
                                <td className="py-2 px-2 border border-gray-400 hover:bg-gray-100">{enroller.progress}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Enrollers;
