'use client';

import React from 'react';
import LoginForm from '@/components/LoginForm';
import { Box, Container, Paper, Typography } from '@mui/material';

export default function LoginPage() {
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            YellowTip Reservations
          </Typography>
          <LoginForm />
        </Paper>
      </Box>
    </Container>
  );
}




