'use client';

import { Stack, Typography } from '@mui/material';
import AuthWrapper from '@/sections/auth/AuthWrapper';
import AuthLoginNext from '@/sections/auth/AuthLoginNext';

export default function LoginPage() {
  return (
    <AuthWrapper>
      <Stack sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            color: '#FFFFFF',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            fontSize: { xs: '1.75rem', sm: '2rem' },
            fontFamily: '"Inter", sans-serif',
          }}
        >
          Welcome Back
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255,255,255,0.5)',
            mt: 1,
            fontWeight: 400,
            fontSize: '1rem',
          }}
        >
          Enter your credentials to access your fleet.
        </Typography>
      </Stack>
      
      <AuthLoginNext />
    </AuthWrapper>
  );
}
