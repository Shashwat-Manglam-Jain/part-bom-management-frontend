import { createTheme } from '@mui/material/styles';

export type ThemePresetId =
  | 'emerald';

interface ThemePreset {
  id: ThemePresetId;
  label: string;
  primaryMain: string;
  primaryDark: string;
  primaryLight: string;
  secondaryMain: string;
  divider: string;
  backgroundDefault: string;
  backgroundPaper: string;
}

export const DEFAULT_THEME_PRESET_ID: ThemePresetId = 'emerald';

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'emerald',
    label: 'Emerald Leaf',
    primaryMain: '#059669',
    primaryDark: '#047857',
    primaryLight: '#a7f3d0',
    secondaryMain: '#294a44',
    divider: '#cfe9df',
    backgroundDefault: '#f4fbf8',
    backgroundPaper: '#ffffff',
  },
];

export function createAppTheme(
  presetId: ThemePresetId = DEFAULT_THEME_PRESET_ID,
) {
  const activePreset =
    THEME_PRESETS.find((preset) => preset.id === presetId) ?? THEME_PRESETS[0];

  return createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: activePreset.primaryMain,
        dark: activePreset.primaryDark,
        light: activePreset.primaryLight,
      },
      secondary: {
        main: activePreset.secondaryMain,
      },
      text: {
        primary: '#0f172a',
        secondary: '#475569',
      },
      divider: activePreset.divider,
      background: {
        default: activePreset.backgroundDefault,
        paper: activePreset.backgroundPaper,
      },
    },
    typography: {
      fontFamily: 'Plus Jakarta Sans, Manrope, IBM Plex Sans, Segoe UI, Trebuchet MS, sans-serif',
      h4: {
        fontWeight: 800,
        letterSpacing: '-0.02em',
        lineHeight: 1.18,
      },
      h6: {
        fontWeight: 750,
        letterSpacing: '-0.012em',
        lineHeight: 1.24,
      },
      subtitle1: {
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      body2: {
        lineHeight: 1.5,
      },
      button: {
        fontWeight: 700,
        letterSpacing: '-0.005em',
      },
    },
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
      },
      MuiButton: {
        defaultProps: {
          size: 'small',
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 8,
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            textRendering: 'optimizeLegibility',
          },
        },
      },
      MuiIcon: {
        styleOverrides: {
          root: {
            fontVariationSettings: '"FILL" 0, "wght" 500, "GRAD" 0, "opsz" 24',
            lineHeight: 1,
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            shapeRendering: 'geometricPrecision',
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  });
}
