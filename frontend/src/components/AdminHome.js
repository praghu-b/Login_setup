import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Paper, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AdminHome = () => {
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(userInfo);
    if (user.user_type !== 'admin') {
      navigate('/login');
      return;
    }
    setAdmin(user);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  if (!admin) return null;

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Admin Dashboard
            </Typography>
            <Button variant="contained" color="error" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
          
          <Typography variant="h6" gutterBottom>
            Welcome, Admin {admin.name}!
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          {/* Admin Statistics */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6">Total Users</Typography>
              <Typography variant="h4">0</Typography>
              <Button variant="text" sx={{ mt: 2 }}>View All Users</Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6">New Users Today</Typography>
              <Typography variant="h4">0</Typography>
              <Button variant="text" sx={{ mt: 2 }}>View Details</Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6">Active Users</Typography>
              <Typography variant="h4">0</Typography>
              <Button variant="text" sx={{ mt: 2 }}>View Active Users</Button>
            </Paper>
          </Grid>
        </Grid>

        {/* Admin Actions */}
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Admin Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button variant="contained" color="primary">Manage Users</Button>
            <Button variant="contained" color="secondary">System Settings</Button>
            <Button variant="contained">View Reports</Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminHome; 