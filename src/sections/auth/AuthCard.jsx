import PropTypes from 'prop-types';
import Box from '@mui/material/Box';

// ==============================|| AUTHENTICATION - CARD WRAPPER ||============================== //

export default function AuthCard({ children, ...other }) {
  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: '24px',
        backgroundColor: 'rgba(15, 15, 15, 0.6)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'none',
        overflow: 'hidden',
        p: { xs: 4, sm: 5, md: 6 },
        transition: 'all 0.3s ease',
        '&:hover': {
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: 'none',
        },
        // Subtle top light sweep
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '20%',
          right: '20%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          opacity: 0.5,
        }
      }}
      {...other}
    >
      {children}
    </Box>
  );
}

AuthCard.propTypes = { children: PropTypes.any, other: PropTypes.any };
