'use client';

// material-ui
import Box from '@mui/material/Box';

// ==============================|| AUTH - PREMIUM MESH BACKGROUND ||============================== //

export default function AuthBackground() {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        overflow: 'hidden',
        backgroundColor: '#050505', // Deep premium black
      }}
    >
      <Box
        component="style"
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes float1 {
              0% { transform: translate(0, 0) scale(1); }
              33% { transform: translate(5%, 10%) scale(1.1); }
              66% { transform: translate(-5%, 5%) scale(0.9); }
              100% { transform: translate(0, 0) scale(1); }
            }
            @keyframes float2 {
              0% { transform: translate(0, 0) scale(1); }
              33% { transform: translate(-10%, -5%) scale(1.05); }
              66% { transform: translate(5%, -10%) scale(1.15); }
              100% { transform: translate(0, 0) scale(1); }
            }
            @keyframes float3 {
              0% { transform: translate(0, 0) scale(1); }
              50% { transform: translate(10%, -10%) scale(1.2); }
              100% { transform: translate(0, 0) scale(1); }
            }
            .noise-overlay {
              position: absolute;
              top: 0; left: 0; right: 0; bottom: 0;
              background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
              opacity: 0.05;
              pointer-events: none;
              mix-blend-mode: overlay;
              z-index: 10;
            }
          `
        }}
      />

      {/* Mesh Gradient Orbs */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '60vw',
          height: '60vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(29, 78, 216, 0.15) 0%, rgba(29, 78, 216, 0) 70%)',
          animation: 'float1 20s ease-in-out infinite',
          filter: 'blur(80px)',
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: '70vw',
          height: '70vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0) 70%)',
          animation: 'float2 25s ease-in-out infinite',
          filter: 'blur(100px)',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: '40vw',
          height: '40vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(147, 197, 253, 0.05) 0%, rgba(147, 197, 253, 0) 70%)',
          animation: 'float3 18s ease-in-out infinite',
          filter: 'blur(60px)',
        }}
      />

      {/* Grid lines for a technical/aviation dashboard feel */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '4vw 4vw',
          maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)',
          zIndex: 1,
        }}
      />

      {/* Noise Texture for premium matte finish */}
      <div className="noise-overlay" />
    </Box>
  );
}
