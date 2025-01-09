import React from 'react';
import { Box } from '@mui/material';
import GraduateImg from '../images/login.png';

const AuthBackground = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '90vh', bgcolor: '#FFE6F3' }}>
      <Box
        sx={{
          flex: 1,
          bgcolor: '#FFE6F3',
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img
          src={GraduateImg}
          alt="Graduate Avatar"
          style={{ width: '80%', maxWidth: '400px' }}
        />
      </Box>
      <Box
        sx={{
          flex: 1,
          p: 4,
          m: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          bgcolor: 'white',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AuthBackground; 