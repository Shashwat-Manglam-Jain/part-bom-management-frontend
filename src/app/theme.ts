import { createTheme } from '@mui/material/styles';

export type ThemePresetId =
  | 'pink'
  | 'teal'
  | 'indigo'
  | 'emerald'
  | 'amber'
  | 'slate';

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

export const DEFAULT_THEME_PRESET_ID: ThemePresetId = 'slate';

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'pink',
    label: 'Rose Orchid',
    primaryMain: '#c23b7a',
    primaryDark: '#9f2f63',
    primaryLight: '#ffd9ea',
    secondaryMain: '#6a2b50',
    divider: '#efcfe0',
    backgroundDefault: '#fff7fb',
    backgroundPaper: '#ffffff',
  },
  {
    id: 'teal',
    label: 'Teal Ocean',
    primaryMain: '#0f766e',
    primaryDark: '#0b5f59',
    primaryLight: '#d6efec',
    secondaryMain: '#334155',
    divider: '#d7e0e7',
    backgroundDefault: '#f3f6f8',
    backgroundPaper: '#ffffff',
  },
  {
    id: 'indigo',
    label: 'Purple Aura',
    primaryMain: '#7c3aed',
    primaryDark: '#5b21b6',
    primaryLight: '#ddd6fe',
    secondaryMain: '#3f2a74',
    divider: '#d8cef6',
    backgroundDefault: '#f7f3ff',
    backgroundPaper: '#ffffff',
  },
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
  {
    id: 'amber',
    label: 'Amber Field',
    primaryMain: '#d97706',
    primaryDark: '#b45309',
    primaryLight: '#fde68a',
    secondaryMain: '#4b3a1d',
    divider: '#efe1c3',
    backgroundDefault: '#fffbf2',
    backgroundPaper: '#ffffff',
  },
  {
    id: 'slate',
    label: 'Executive Slate',
    primaryMain: '#334e68',
    primaryDark: '#243b53',
    primaryLight: '#d9e2ec',
    secondaryMain: '#102a43',
    divider: '#c7d3e0',
    backgroundDefault: '#f4f7fb',
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
