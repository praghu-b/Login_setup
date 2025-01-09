import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Avatar, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';

// Styled components
const PageContainer = styled(Box)({
  minHeight: '100vh',
  backgroundColor: '#f5f5f5', // Changed to a light gray for a softer login theme
  padding: '2rem 0',
});

const Header = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 2rem',
  marginBottom: '3rem',
});

const GridContainer = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '2rem',
  padding: '0 2rem',
});

const Card = styled(Box)({
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', // Slightly increased shadow for depth
  transition: 'transform 0.3s, box-shadow 0.3s',
  cursor: 'pointer',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)', // Enhanced hover effect
  },
});

const CardImage = styled('img')({
  width: '100%',
  height: '200px',
  objectFit: 'cover',
});

const CardContent = styled(Box)({
  padding: '1.5rem',
});

const CardTitle = styled(Typography)({
  fontSize: '1.25rem',
  fontWeight: '600',
  color: '#e91e63', // Changed to a primary theme color
  marginBottom: '0.5rem',
});

const CardDescription = styled(Typography)({
  color: '#666666',
  fontSize: '0.9rem',
});

const items = [
  {
    title: 'Python Course',
    description: 'Learn python from the masters',
    image: 'https://via.placeholder.com/400x200?text=Python+Course',
    link: '/python'
  },
  {
    title: 'Java',
    description: 'Learn java from the masters',
    image: 'https://via.placeholder.com/400x200?text=Java+Course',
    link: '/java'
  },
];

const UserHome = () => {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userInfo);
    if (parsedUser.user_type === 'admin') {
      navigate('/admin-home');
      return;
    }
    setUser(parsedUser);
  }, [navigate]);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path) => {
    handleClose();
    navigate(path);
  };

  if (!user) return null;

  const firstName = user.name.split(' ')[0];

  return (
    <PageContainer>
      <Header>
        <Box>
          <Typography variant="h4" sx={{ color: '#e91e63', fontWeight: '600' }}> {/* Changed color to match theme */}
            AI Coursify
          </Typography>
          <Typography variant="h6" sx={{ color: '#666666', mt: 1 }}>
            Welcome, {firstName}!
          </Typography>
        </Box>
        <IconButton onClick={handleProfileClick} size="large">
          <AccountCircleIcon sx={{ fontSize: 40, color: '#e91e63' }} /> {/* Changed color to match theme */}
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={() => handleMenuItemClick('/profile')}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Profile Info</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleMenuItemClick('/dashboard')}>
            <ListItemIcon>
              <DashboardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Dashboard</ListItemText>
          </MenuItem>
        </Menu>
      </Header>

      <Typography variant="h5" sx={{ color: '#e91e63', fontWeight: '900', mb: 2 }}> {/* Changed color to match theme */}
        Courses
      </Typography>
      <GridContainer>
        {items.map((item, index) => (
          <Card key={index} onClick={() => navigate(item.link)}>
            <CardImage src={item.image} alt={item.title} />
            <CardContent>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </GridContainer>
    </PageContainer>
  );
};

export default UserHome;