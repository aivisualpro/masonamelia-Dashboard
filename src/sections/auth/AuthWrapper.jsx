import PropTypes from 'prop-types';

// material-ui
import Box from '@mui/material/Box';

// next
import Image from 'next/image';

// project imports
import AuthCard from './AuthCard';

// assets
import AuthBackground from './AuthBackground';

// ==============================|| AUTHENTICATION - WRAPPER ||============================== //

export default function AuthWrapper({ children }) {
  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: 2, sm: 4 }
      }}
    >
      <AuthBackground />
      
      {/* Central Login Container with Entrance Animation */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 480,
          zIndex: 10,
          animation: 'fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
          '@keyframes fadeInUp': {
            '0%': { 
              opacity: 0, 
              transform: 'translateY(40px) scale(0.98)',
              filter: 'blur(10px)'
            },
            '100%': { 
              opacity: 1, 
              transform: 'translateY(0) scale(1)',
              filter: 'blur(0)'
            },
          },
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mb: 4,
            animation: 'floatLogo 6s ease-in-out infinite',
            '@keyframes floatLogo': {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-5px)' },
            }
          }}
        >
          <Image
            src="/logowhite.svg"
            alt="Mason Amelia"
            width={220}
            height={66}
            priority
            unoptimized
            style={{
              maxWidth: 220,
              height: 'auto',
            }}
          />
        </Box>
        
        <AuthCard>{children}</AuthCard>
        
        {/* Footer Text */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Box 
            component="p" 
            sx={{ 
              color: 'rgba(255,255,255,0.4)', 
              fontSize: '0.8rem',
              letterSpacing: '0.05em' 
            }}
          >
            © {new Date().getFullYear()} MASON AMELIA. ALL RIGHTS RESERVED.
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

AuthWrapper.propTypes = { children: PropTypes.node };
