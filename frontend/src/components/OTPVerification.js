import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from '../config/axios';

const OTPContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  marginTop: '1rem',
});

const TimerText = styled(Typography)({
  color: '#666',
  fontSize: '0.9rem',
  minWidth: '100px',
});

const ResendButton = styled(Button)({
  minWidth: '120px',
});

const OTPVerification = ({ type, onVerify, identifier }) => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOTP = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      let payload = {};

      if (type === 'email') {
        endpoint = '/api/send-signup-otp/';
        payload = { 
          email: identifier,
          type: 'email'
        };
      } else if (type === 'reset') {
        endpoint = '/api/send-reset-otp/';
        payload = {
          email: identifier,
          type: 'reset'
        };
      } else if (type === 'mobile') {
        endpoint = '/api/send-mobile-otp/';
        payload = { 
          mobile_number: identifier,
          email: localStorage.getItem('tempEmail'),
          type: 'mobile'
        };
      }

      const response = await axios.post(endpoint, payload);

      if (response.data && response.data.message) {
        setIsOtpSent(true);
        setTimer(60);
        setOtp('');
        alert(response.data.message);
      } else {
        throw new Error('Failed to send OTP');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      alert('Please enter OTP');
      return;
    }

    try {
      setLoading(true);
      let endpoint = '';
      let payload = {};

      if (type === 'email') {
        endpoint = '/api/verify-signup-otp/';
        payload = { 
          email: identifier,
          otp: otp,
          type: 'email'
        };
      } else if (type === 'reset') {
        endpoint = '/api/verify-reset-otp/';
        payload = {
          email: identifier,
          otp: otp,
          type: 'reset'
        };
      } else if (type === 'mobile') {
        endpoint = '/api/verify-mobile-otp/';
        payload = { 
          mobile_number: identifier,
          otp: otp,
          type: 'mobile'
        };
      }

      const response = await axios.post(endpoint, payload);

      if (response.data && response.data.message) {
        onVerify(true);
        setIsOtpSent(false);
        setTimer(0);
        alert(response.data.message);
      } else {
        throw new Error('Failed to verify OTP');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.error || 'Failed to verify OTP');
      onVerify(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <OTPContainer>
      <TextField
        size="small"
        label={`Enter ${type === 'email' ? 'Email' : 'Mobile'} OTP`}
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        disabled={loading || !isOtpSent}
        error={otp.length > 0 && otp.length !== 6}
        helperText={otp.length > 0 && otp.length !== 6 ? "OTP must be 6 digits" : ""}
        inputProps={{
          maxLength: 6,
          pattern: '[0-9]*',
        }}
      />

      {isOtpSent && timer > 0 ? (
        <TimerText>
          {`Expires in ${timer}s`}
        </TimerText>
      ) : (
        <ResendButton
          variant="outlined"
          onClick={handleSendOTP}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            isOtpSent ? 'Resend OTP' : 'Send OTP'
          )}
        </ResendButton>
      )}

      <Button
        variant="contained"
        onClick={handleVerifyOTP}
        disabled={loading || !isOtpSent || otp.length !== 6 || timer === 0}
      >
        {loading ? <CircularProgress size={24} /> : 'Verify'}
      </Button>
    </OTPContainer>
  );
};

export default OTPVerification; 