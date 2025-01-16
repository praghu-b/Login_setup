import React from 'react';
import { useLoading } from '../../context/LoadingContext';
import { CircularProgress, Backdrop } from '@mui/material';

const LoadingComponent = () => {
  const { isLoading } = useLoading();

  return (
    <Backdrop
      open={isLoading}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        color: 'black',
        backdropFilter: 'blur(5px)',
      }}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default LoadingComponent;
