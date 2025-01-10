import React from 'react';

const LoadingPage = () => {
  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <div className="text-center">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-purple-600" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <h1 className="text-3xl font-bold mt-4">Loading...</h1>
      </div>
    </div>
  );
};

export default LoadingPage;


