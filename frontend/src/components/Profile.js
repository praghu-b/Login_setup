import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EditIcon from '@mui/icons-material/Edit';
import axios from '../config/axios';
import OTPVerification from './OTPVerification';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editDialog, setEditDialog] = useState({ open: false, field: null });
  const [newValue, setNewValue] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userInfo);
    setUser(parsedUser);
  }, [navigate]);

  const handleBack = () => {
    navigate('/user-home');
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const handleEdit = (field) => {
    setEditDialog({ open: true, field });
    setNewValue('');
    setIsEmailVerified(false);
    setIsMobileVerified(false);
  };

  const handleClose = () => {
    setEditDialog({ open: false, field: null });
    setNewValue('');
  };

  const handleUpdate = async () => {
    try {
      if (editDialog.field === 'email' && !isEmailVerified) {
        alert('Please verify your new email first');
        return;
      }
      if (editDialog.field === 'mobile_number' && !isMobileVerified) {
        alert('Please verify your new mobile number first');
        return;
      }

      const response = await axios.post('/api/update-profile/', {
        user_id: user.id,
        field: editDialog.field,
        value: newValue
      });

      if (response.data.success) {
        // Update local storage with new user data
        const updatedUser = { ...user, [editDialog.field]: newValue };
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        setUser(updatedUser);
        handleClose();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update profile');
    }
  };

  if (!user) return null;

  const [firstName, lastName] = user.name.split(' ');

  const renderEditDialog = () => {
    const isPassword = editDialog.field === 'password';
    const isEmail = editDialog.field === 'email';
    const isMobile = editDialog.field === 'mobile_number';

    return (
      <Dialog open={editDialog.open} onClose={handleClose}>
        <DialogTitle>Update {editDialog.field?.replace('_', ' ')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={`New ${editDialog.field?.replace('_', ' ')}`}
            type={isPassword ? 'password' : 'text'}
            fullWidth
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
          {isEmail && newValue && (
            <OTPVerification
              type="email"
              identifier={newValue}
              onVerify={(success) => setIsEmailVerified(success)}
            />
          )}
          {isMobile && newValue && (
            <OTPVerification
              type="mobile"
              identifier={newValue}
              onVerify={(success) => setIsMobileVerified(success)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleUpdate}>Update</Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button onClick={handleBack} variant="outlined" sx={{ mb: 2 }}>
          Back to Home
        </Button>
        
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ width: 100, height: 100, mb: 2 }}>
              <AccountCircleIcon sx={{ fontSize: 100 }} />
            </Avatar>
            <Typography variant="h4" gutterBottom>
              Profile Details
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="textSecondary">
                First Name
              </Typography>
              <Typography variant="h6" gutterBottom>
                {firstName}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="textSecondary">
                Last Name
              </Typography>
              <Typography variant="h6" gutterBottom>
                {lastName}
              </Typography>
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" color="textSecondary">
                  Email
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {user.email}
                </Typography>
              </Box>
              <IconButton onClick={() => handleEdit('email')}>
                <EditIcon />
              </IconButton>
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" color="textSecondary">
                  Mobile Number
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {user.mobile_number}
                </Typography>
              </Box>
              <IconButton onClick={() => handleEdit('mobile_number')}>
                <EditIcon />
              </IconButton>
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" color="textSecondary">
                  Password
                </Typography>
                <Typography variant="h6" gutterBottom>
                  ••••••••
                </Typography>
              </Box>
              <IconButton onClick={() => handleEdit('password')}>
                <EditIcon />
              </IconButton>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" color="textSecondary">
                Account Type
              </Typography>
              <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize' }}>
                {user.user_type}
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleLogout}
              sx={{ minWidth: 200 }}
            >
              Logout
            </Button>
          </Box>
        </Paper>
      </Box>
      {renderEditDialog()}
    </Container>
  );
};

export default Profile; 