import { useMemo, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { ThemeProvider, alpha } from '@mui/material/styles';
import {
  DEFAULT_THEME_PRESET_ID,
  THEME_PRESETS,
  createAppTheme,
  type ThemePresetId,
} from './app/theme';
import { PartsPage } from './features/parts/PartsPage';
import { ReactNodeIcon } from './shared/ui/ReactGlyphs';

function App() {
  const [themePresetId, setThemePresetId] = useState<ThemePresetId>(
    DEFAULT_THEME_PRESET_ID,
  );
  const appTheme = useMemo(
    () => createAppTheme(themePresetId),
    [themePresetId],
  );

  const handleOpenCreatePage = () => {
    window.dispatchEvent(new Event('parts:open-create'));
  };

  const handleThemeChange = (nextThemeId: ThemePresetId) => {
    setThemePresetId(nextThemeId);
  };

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Paper
        sx={{
          width: '100%',
          maxWidth: '100%',
          height: 'auto',
          minHeight: '100vh',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 1, md: 1.6, lg: 1.9 },
          borderRadius: { xs: 0, md: 3 },
          border: '1px solid',
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.22),
          background: (theme) =>
            `radial-gradient(1200px 420px at -10% -20%, ${alpha(theme.palette.primary.main, 0.18)} 0%, transparent 60%), radial-gradient(900px 360px at 110% -10%, ${alpha(theme.palette.primary.light, 0.2)} 0%, transparent 58%), linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${theme.palette.background.default} 100%)`,
          boxShadow: '0 8px 18px rgba(15, 23, 42, 0.06)',
          overflowX: 'hidden',
          overflowY: 'auto',
        }}
      >
        <AppBar
          position="static"
          color="transparent"
          elevation={0}
          sx={{
            borderRadius: 2.2,
            border: '1px solid',
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.35),
            background: (theme) =>
              `linear-gradient(110deg, ${alpha(theme.palette.primary.main, 0.22)} 0%, ${alpha(theme.palette.background.paper, 0.94)} 60%, ${alpha(theme.palette.primary.light, 0.22)} 100%)`,
            boxShadow: (theme) => `inset 0 1px 0 ${alpha(theme.palette.common.white, 0.6)}`,
          }}
        >
          <Toolbar
            sx={{
              px: { xs: 1.1, md: 1.4 },
              py: 0.7,
              minHeight: '66px !important',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
              <ReactNodeIcon color="primary" fontSize="small" />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ lineHeight: 1.2, fontWeight: 800 }}>
                  Part &amp; BOM Management
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary' }}
                >
                  Client Operations Dashboard
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={0.85}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              sx={{ width: { xs: '100%', md: 'auto' } }}
            >
              <Stack
                direction="row"
                spacing={0.4}
                alignItems="center"
                sx={{
                  backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.94),
                  borderRadius: 1.6,
                  px: 0.5,
                  py: 0.3,
                  border: '1px solid',
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.32),
                }}
              >
                <Icon
                  baseClassName="material-symbols-rounded"
                  sx={{ fontSize: 18, color: 'text.secondary', mr: 0.1 }}
                >
                  palette
                </Icon>
                {THEME_PRESETS.map((preset) => {
                  const isActive = themePresetId === preset.id;
                  return (
                    <Tooltip key={preset.id} title={preset.label} arrow>
                      <IconButton
                        size="small"
                        onClick={() => handleThemeChange(preset.id)}
                        aria-label={`Switch theme to ${preset.label}`}
                        sx={{
                          width: 24,
                          height: 24,
                          border: '1px solid',
                          borderColor: isActive
                            ? 'primary.main'
                            : (theme) => alpha(theme.palette.divider, 0.9),
                          backgroundColor: isActive
                            ? (theme) => alpha(theme.palette.primary.main, 0.15)
                            : 'transparent',
                          '&:hover': {
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: preset.primaryMain,
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                  );
                })}
              </Stack>
              <Button
                type="button"
                variant="contained"
                onClick={handleOpenCreatePage}
                sx={{ whiteSpace: 'nowrap', minHeight: 36 }}
                startIcon={(
                  <Icon baseClassName="material-symbols-rounded" sx={{ fontSize: 18 }}>
                    add_circle
                  </Icon>
                )}
              >
                Create Part
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>

        <Box
          sx={{
            mt: 1.1,
            px: 0.8,
            py: 0.65,
            borderRadius: 1.8,
            border: '1px solid',
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.24),
            backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.92),
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Search parts, create BOM links, and track lifecycle changes with theme presets.
          </Typography>
        </Box>

        <Box sx={{ mt: 1.4, flex: 1, minHeight: 0, display: 'flex' }}>
          <PartsPage />
        </Box>
      </Paper>
    </ThemeProvider>
  );
}

export default App;
