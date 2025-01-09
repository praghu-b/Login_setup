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
    <Container maxWidth="sm">
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

      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Reset Password
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
                  margin="normal"
                  name="email"
                  label="Email"
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
                    margin="normal"
                    name="new_password"
                    label="New Password"
                    type="password"
                    error={touched.new_password && errors.new_password}
                    helperText={touched.new_password && errors.new_password}
                  />
                  
                  <Field
                    as={TextField}
                    fullWidth
                    margin="normal"
                    name="confirm_password"
                    label="Confirm Password"
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
                sx={{ mt: 3, mb: 2 }}
                disabled={isSubmitting || !isEmailVerified}
              >
                Reset Password
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Button
                  onClick={() => navigate('/login')}
                  variant="text"
                >
                  Back to Login
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default ForgotPassword; 