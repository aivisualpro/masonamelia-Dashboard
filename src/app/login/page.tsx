'use client';

import { Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import AuthWrapper from '@/sections/auth/AuthWrapper';
import AuthLoginNext from '@/sections/auth/AuthLoginNext';

export default function LoginPage() {
  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Login</Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <AuthLoginNext />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
