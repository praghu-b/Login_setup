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
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

const ResetPasswordSchema = Yup.object().shape({
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

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const email = location.state?.email;

  if (!email) {
    navigate('/forgot-password');
    return null;
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Reset Password
        </Typography>

        {error && (
          <Box sx={{ mb: 2, width: '100%' }}>
            <Typography color="error" align="center">
              {error}
            </Typography>
          </Box>
        )}

        <Formik
          initialValues={{
            new_password: '',
            confirm_password: '',
          }}
          validationSchema={ResetPasswordSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              setError('');
              await axios.post('/api/reset-password/', {
                email,
                new_password: values.new_password,
              });
              alert('Password reset successful!');
              navigate('/login');
            } catch (error) {
              setError(error.response?.data?.error || 'Failed to reset password');
            }
            setSubmitting(false);
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
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
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isSubmitting}
              >
                Reset Password
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default ResetPassword; 