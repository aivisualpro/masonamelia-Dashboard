'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// material-ui
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid2';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import IconButton from '@/components/@extended/IconButton';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';
import { loginAccount } from '@/api/auth.api';

// Super Premium Input Styles
const inputSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(10px)',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.08)',
      transition: 'all 0.3s ease',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.4)',
      borderWidth: '1px',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      boxShadow: 'none',
    },
    '& input': {
      color: '#FFFFFF',
      fontSize: '1rem',
      padding: '14px 16px',
      '&::placeholder': {
        color: 'rgba(255, 255, 255, 0.3)',
        opacity: 1,
      },
    },
  },
};

const labelSx = {
  color: 'rgba(255, 255, 255, 0.6)',
  fontWeight: 500,
  fontSize: '0.875rem',
  marginBottom: '8px',
};

export default function AuthLoginNext() {
  const [showPassword, setShowPassword] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' as 'success' | 'error' });
  const [loading, setLoading] = useState(false);

  const handleClickShowPassword = () => setShowPassword((s) => !s);
  const handleMouseDownPassword = (e: React.MouseEvent) => e.preventDefault();

  const router = useRouter();

  return (
    <>
      <Formik
        initialValues={{ email: '', password: '', submit: null }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
          password: Yup.string().required('Password is required')
        })}
        onSubmit={async (values) => {
          setLoading(true);
          const data = { email: values.email, password: values.password };
          
          try {
            const response = await loginAccount(data);
            if (response.success) {
              setSnack({ open: true, severity: 'success', msg: 'Authentication successful. Redirecting...' });
              localStorage.setItem("user", JSON.stringify(response.user));
              localStorage.setItem("token", response.token);
              document.cookie = `token=${response.token}; path=/; max-age=604800; SameSite=Lax`;
              
              setLoading(false);
              setTimeout(() => router.push("/dashboard"), 800);
            } else {
              setSnack({ open: true, severity: 'error', msg: 'Invalid credentials. Please try again.' });
              setLoading(false);
            }
          } catch (error: any) {
            setSnack({ open: true, severity: 'error', msg: error?.response?.data?.message || 'Connection error.' });
            setLoading(false);
          }
        }}
      >
        {({ errors, handleBlur, handleChange, touched, values, handleSubmit }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Stack sx={{ gap: 0 }}>
                  <InputLabel htmlFor="email-login" sx={labelSx}>
                    Email Address
                  </InputLabel>
                  <Box sx={inputSx}>
                    <OutlinedInput
                      id="email-login"
                      type="email"
                      value={values.email}
                      name="email"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="name@company.com"
                      fullWidth
                      error={Boolean(touched.email && errors.email)}
                    />
                  </Box>
                </Stack>
                {touched.email && errors.email && (
                  <FormHelperText error sx={{ ml: 1, mt: 1, color: '#ef4444' }}>
                    {errors.email}
                  </FormHelperText>
                )}
              </Grid>

              <Grid size={12}>
                <Stack sx={{ gap: 0 }}>
                  <InputLabel htmlFor="password-login" sx={labelSx}>
                    Password
                  </InputLabel>
                  <Box sx={inputSx}>
                    <OutlinedInput
                      fullWidth
                      error={Boolean(touched.password && errors.password)}
                      id="password-login"
                      type={showPassword ? 'text' : 'password'}
                      value={values.password}
                      name="password"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.4)',
                              '&:hover': {
                                color: 'rgba(255, 255, 255, 0.9)',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              },
                            }}
                          >
                            {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                          </IconButton>
                        </InputAdornment>
                      }
                      placeholder="••••••••"
                    />
                  </Box>
                </Stack>
                {touched.password && errors.password && (
                  <FormHelperText error sx={{ ml: 1, mt: 1, color: '#ef4444' }}>
                    {errors.password}
                  </FormHelperText>
                )}
                

              </Grid>

              <Grid size={12} sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  fullWidth
                  disabled={loading}
                  sx={{
                    borderRadius: '12px',
                    py: 1.8,
                    fontSize: '1rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    transition: 'all 0.3s ease',
                    boxShadow: 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      transform: 'translateY(-2px)',
                      boxShadow: 'none',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CircularProgress size={20} sx={{ color: '#000000' }} />
                      <span>Authenticating...</span>
                    </Box>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          sx={{
            width: '100%',
            borderRadius: '8px',
            backgroundColor: snack.severity === 'success' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
            color: '#FFF',
            backdropFilter: 'blur(10px)',
            '& .MuiAlert-icon': {
              color: '#FFF'
            }
          }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
