'use client';
import PropTypes from 'prop-types';
import { useMemo, useState, createContext, useEffect } from 'react';

// material-ui
import StyledEngineProvider from '@mui/material/StyledEngineProvider';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// project imports
import Palette from './palette';
import Typography from './typography';
import CustomShadows from './shadows';
import componentsOverride from './overrides';

// ==============================|| THEME MODE CONTEXT ||============================== //

export const ThemeModeContext = createContext({
  mode: 'light',
  toggleMode: () => {}
});

// ==============================|| DEFAULT THEME - MAIN ||============================== //

export default function ThemeCustomization({ children }) {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    const savedMode = localStorage.getItem('theme_mode');
    if (savedMode === 'dark' || savedMode === 'light') {
      setMode(savedMode);
    }
  }, []);

  const toggleMode = () => {
    setMode((prev) => {
      const newMode = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme_mode', newMode);
      return newMode;
    });
  };

  const theme = Palette(mode, 'default');

  const themeTypography = Typography(`'Public Sans', sans-serif`);
  const themeCustomShadows = useMemo(() => CustomShadows(theme), [theme]);

  const themeOptions = useMemo(
    () => ({
      breakpoints: {
        values: {
          xs: 0,
          sm: 768,
          md: 1024,
          lg: 1266,
          xl: 1440
        }
      },
      direction: 'ltr',
      mixins: {
        toolbar: {
          minHeight: 60,
          paddingTop: 8,
          paddingBottom: 8
        }
      },
      palette: theme.palette,
      customShadows: themeCustomShadows,
      typography: themeTypography
    }),
    [theme, themeTypography, themeCustomShadows]
  );

  const themes = createTheme(themeOptions);
  themes.components = componentsOverride(themes);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={themes}>
          <CssBaseline enableColorScheme />
          {children}
        </ThemeProvider>
      </StyledEngineProvider>
    </ThemeModeContext.Provider>
  );
}

ThemeCustomization.propTypes = { children: PropTypes.node };
