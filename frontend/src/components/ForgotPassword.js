import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from '../config/axios';
import {
  Button,
  TextField,
  Container,
  Typography,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import OTPVerification from './OTPVerification';
import GraduateImg from '../images/login.png'

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  new_password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    .required('Required'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('new_password'), null], 'Passwords must match')
    .required('Required'),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="md" sx={{ display: 'flex', minHeight: '100vh' }}>
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box sx={{ 
        display: 'flex',
        width: '100%',
        my: 4,
        bgcolor: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <Box sx={{
          flex: 1,
          bgcolor: '#FFE6F3',
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img
            src={GraduateImg}
            alt="Graduate Avatar"
            style={{ width: '80%', maxWidth: '400px' }}
          />
        </Box>

        <Box sx={{
          flex: 1,
          p: 6,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <Typography
            component="h1"
            variant="h4"
            sx={{ 
              mb: 1,
              color: '#F8B84E',
              fontWeight: 'bold'
            }}
          >
            Forgot your Password?
          </Typography>

          <Typography
            variant="h5"
            sx={{ 
              mb: 3,
              color: '#000',
              fontWeight: 'bold'
            }}
          >
            to get back in track
          </Typography>

          <Typography
            variant="body1"
            sx={{ 
              mb: 4,
              color: '#666'
            }}
          >
            Enter your email address to receive a One-Time Password (OTP) for verification and reset your password.
          </Typography>

          <Formik
            initialValues={{
              email: '',
              new_password: '',
              confirm_password: '',
            }}
            validationSchema={ForgotPasswordSchema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                if (!isEmailVerified) {
                  setSnackbar({
                    open: true,
                    message: 'Please verify your email first',
                    severity: 'error'
                  });
                  return;
                }

                await axios.post('/api/reset-password/', {
                  email: values.email,
                  new_password: values.new_password,
                });

                setSnackbar({
                  open: true,
                  message: 'Password reset successful!',
                  severity: 'success'
                });

                setTimeout(() => {
                  navigate('/login');
                }, 2000);

              } catch (error) {
                setSnackbar({
                  open: true,
                  message: error.response?.data?.error || 'Failed to reset password',
                  severity: 'error'
                });
              }
              setSubmitting(false);
            }}
          >
            {({ errors, touched, isSubmitting, values }) => (
              <Form>
                <Box sx={{ mb: 2 }}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="email"
                    label="Email"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        bgcolor: '#fff'
                      }
                    }}
                    error={touched.email && errors.email}
                    helperText={touched.email && errors.email}
                    disabled={isEmailVerified}
                  />
                  {!isEmailVerified && values.email && !errors.email && (
                    <OTPVerification
                      type="reset"
                      identifier={values.email}
                      onVerify={(success) => {
                        if (success) {
                          setIsEmailVerified(true);
                          setSnackbar({
                            open: true,
                            message: 'Email verified successfully',
                            severity: 'success'
                          });
                        }
                      }}
                    />
                  )}
                </Box>

                {isEmailVerified && (
                  <>
                    <Field
                      as={TextField}
                      fullWidth
                      name="new_password"
                      label="New Password"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          bgcolor: '#fff'
                        }
                      }}
                      type="password"
                      error={touched.new_password && errors.new_password}
                      helperText={touched.new_password && errors.new_password}
                    />
                    
                    <Field
                      as={TextField}
                      fullWidth
                      name="confirm_password"
                      label="Confirm Password"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          bgcolor: '#fff'
                        }
                      }}
                      type="password"
                      error={touched.confirm_password && errors.confirm_password}
                      helperText={touched.confirm_password && errors.confirm_password}
                    />
                  </>
                )}
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 3,
                    mb: 2,
                    borderRadius: '12px',
                    py: 1.5,
                    bgcolor: '#A84069',
                    '&:hover': {
                      bgcolor: '#8E355A'
                    }
                  }}
                  disabled={isSubmitting || !isEmailVerified}
                >
                  {!isEmailVerified ? 'Send Email' : 'Reset Password'}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    onClick={() => navigate('/login')}
                    variant="text"
                    sx={{ color: '#A84069' }}
                  >
                    Back to Login
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPassword; 