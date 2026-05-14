// material-ui
import { createTheme } from '@mui/material/styles';

// third-party
import { presetDarkPalettes, presetPalettes } from '@ant-design/colors';

// project imports
import ThemeOption from './theme';

// ==============================|| DEFAULT THEME - PALETTE ||============================== //

export default function Palette(mode, presetColor) {
  const colors = mode === 'dark' ? presetDarkPalettes : presetPalettes;

  let greyPrimary = [
    '#ffffff',
    '#fafafa',
    '#f5f5f5',
    '#f0f0f0',
    '#d9d9d9',
    '#bfbfbf',
    '#8c8c8c',
    '#595959',
    '#262626',
    '#141414',
    '#000000'
  ];
  let greyAscent = ['#fafafa', '#bfbfbf', '#434343', '#1f1f1f'];
  let greyConstant = ['#fafafb', '#e6ebf1'];

  if (mode === 'dark') {
    greyPrimary = [
      '#000000',
      '#141414',
      '#1e1e1e',
      '#262626',
      '#434343',
      '#595959',
      '#8c8c8c',
      '#bfbfbf',
      '#d9d9d9',
      '#f0f0f0',
      '#ffffff'
    ];
    greyAscent = ['#141414', '#434343', '#bfbfbf', '#fafafa'];
    greyConstant = ['#121212', '#1e1e1e'];
  }

  colors.grey = [...greyPrimary, ...greyAscent, ...greyConstant];

  const paletteColor = ThemeOption(colors, presetColor, mode);

  return createTheme({
    palette: {
      mode,
      common: {
        black: '#000',
        white: '#fff'
      },
      ...paletteColor,
      primary: mode === 'dark'
        ? {
            lighter: 'rgba(255,255,255,0.08)',
            light: 'rgba(255,255,255,0.6)',
            main: '#ffffff',
            dark: '#e0e0e0',
            darker: '#bdbdbd',
            contrastText: '#091413',
          }
        : {
            lighter: 'rgba(0,0,0,0.04)',
            light: '#434343',
            main: '#141414',
            dark: '#000000',
            darker: '#000000',
            contrastText: '#ffffff',
          },
      text: {
        primary: mode === 'dark' ? 'rgba(255, 255, 255, 0.87)' : paletteColor.grey[700],
        secondary: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : paletteColor.grey[500],
        disabled: mode === 'dark' ? 'rgba(255, 255, 255, 0.38)' : paletteColor.grey[400]
      },
      action: {
        disabled: paletteColor.grey[300]
      },
      divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : paletteColor.grey[200],
      background: {
        paper: mode === 'dark' ? '#112220' : paletteColor.grey[0],
        default: mode === 'dark' ? '#091413' : '#BFC9D1'
      }
    }
  });
}
