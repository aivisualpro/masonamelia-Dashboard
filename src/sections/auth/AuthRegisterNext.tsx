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

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import IconButton from '@/components/@extended/IconButton';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';
import { createAccount } from '@/api/auth.api';

export default function AuthRegisterNext() {
  const [showPassword, setShowPassword] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' as 'success' | 'error' });
  const [loading, setLoading] = useState(false);

  const handleClickShowPassword = () => setShowPassword((s) => !s);
  const handleMouseDownPassword = (e: React.MouseEvent) => e.preventDefault();

  const router = useRouter();

  return (
    <>
      <Formik
        initialValues={{ name: '', email: '', username: '', password: '', submit: null }}
        validationSchema={Yup.object().shape({
          name: Yup.string().max(255).required('Name is required'),
          email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
          username: Yup.string().max(255).required('Username is required'),
          password: Yup.string()
            .required('Password is required')
            .min(6, 'Password must be at least 6 characters')
            .max(50, 'Password must be less than 50 characters')
        })}
        onSubmit={async (values) => {
          setLoading(true);
          const data = { 
            name: values.name,
            email: values.email, 
            username: values.username,
            password: values.password 
          };
          
          try {
            const response = await createAccount(data);
            if (response.success) {
              setSnack({ open: true, severity: 'success', msg: 'Registration Successful! Redirecting to login...' });
              setLoading(false);
              setTimeout(() => {
                router.push("/login");
              }, 2000);
            } else {
              setSnack({ open: true, severity: 'error', msg: response.message || 'Registration failed' });
              setLoading(false);
            }
          } catch (error: any) {
            console.error('Registration error:', error);
            setSnack({ open: true, severity: 'error', msg: error?.response?.data?.message || 'Registration failed' });
            setLoading(false);
          }
        }}
      >
        {({ errors, handleBlur, handleChange, touched, values, handleSubmit }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="name-register">Full Name</InputLabel>
                  <OutlinedInput
                    id="name-register"
                    type="text"
                    value={values.name}
                    name="name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    fullWidth
                    error={Boolean(touched.name && errors.name)}
                  />
                </Stack>
                {touched.name && errors.name && (
                  <FormHelperText error id="standard-weight-helper-text-name-register">
                    {errors.name}
                  </FormHelperText>
                )}
              </Grid>

              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="email-register">Email Address</InputLabel>
                  <OutlinedInput
                    id="email-register"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                  />
                </Stack>
                {touched.email && errors.email && (
                  <FormHelperText error id="standard-weight-helper-text-email-register">
                    {errors.email}
                  </FormHelperText>
                )}
              </Grid>

              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="username-register">Username</InputLabel>
                  <OutlinedInput
                    id="username-register"
                    type="text"
                    value={values.username}
                    name="username"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter username"
                    fullWidth
                    error={Boolean(touched.username && errors.username)}
                  />
                </Stack>
                {touched.username && errors.username && (
                  <FormHelperText error id="standard-weight-helper-text-username-register">
                    {errors.username}
                  </FormHelperText>
                )}
              </Grid>

              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="password-register">Password</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="password-register"
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
                          color="secondary"
                        >
                          {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="Enter password"
                  />
                </Stack>
                {touched.password && errors.password && (
                  <FormHelperText error id="standard-weight-helper-text-password-register">
                    {errors.password}
                  </FormHelperText>
                )}
              </Grid>

              <Grid size={12}>
                <Button
                  type="submit"
                  fullWidth
                  size="large"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  Register
                </Button>
              </Grid>

              <Grid size={12}>
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Typography variant="body2">Already have an account?</Typography>
                  <Link href="/login" variant="body2" sx={{ textDecoration: 'none', cursor: 'pointer' }}>
                    Login here
                  </Link>
                </Stack>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          sx={{ width: '100%' }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
