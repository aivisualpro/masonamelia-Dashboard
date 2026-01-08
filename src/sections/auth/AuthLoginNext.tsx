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
import { loginAccount } from '@/api/auth.api';

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
          password: Yup.string()
            .required('Password is required')
            .test(
              'no-leading-trailing-whitespace',
              'Password cannot start or end with spaces',
              (value) => !value || value === value.trim()
            )
            .max(50, 'Password must be less than 50 characters')
        })}
        onSubmit={async (values) => {
          setLoading(true);
          const data = { email: values.email, password: values.password };
          
          try {
            const response = await loginAccount(data);
            if (response.success) {
              setSnack({ open: true, severity: 'success', msg: 'Login Successfully' });
              localStorage.setItem("user", JSON.stringify(response.user));
              localStorage.setItem("token", response.token);
              setLoading(false);
              setTimeout(() => {
                router.push("/");
              }, 1000);
            } else {
              setSnack({ open: true, severity: 'error', msg: 'Email or Password is incorrect' });
              setLoading(false);
            }
          } catch (error: any) {
            console.error('Login error:', error);
            setSnack({ open: true, severity: 'error', msg: error?.response?.data?.message || 'Login failed' });
            setLoading(false);
          }
        }}
      >
        {({ errors, handleBlur, handleChange, touched, values, handleSubmit }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="email-login">Email Address</InputLabel>
                  <OutlinedInput
                    id="email-login"
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
                  <FormHelperText error id="standard-weight-helper-text-email-login">
                    {errors.email}
                  </FormHelperText>
                )}
              </Grid>

              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="password-login">Password</InputLabel>
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
                  <FormHelperText error id="standard-weight-helper-text-password-login">
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
                  Login
                </Button>
              </Grid>

              <Grid size={12}>
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Typography variant="body2">Don't have an account?</Typography>
                  <Link href="/register" variant="body2" sx={{ textDecoration: 'none', cursor: 'pointer' }}>
                    Register here
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
