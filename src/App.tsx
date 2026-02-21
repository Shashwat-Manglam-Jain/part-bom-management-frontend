import { lazy, Suspense, useMemo } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Icon from '@mui/material/Icon';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { ThemeProvider, alpha } from '@mui/material/styles';
import { createAppTheme } from './app/theme';
import { ReactNodeIcon } from './shared/ui/ReactGlyphs';

const PartsPage = lazy(async () => {
  const module = await import('./features/parts/PartsPage');
  return {
    default: module.PartsPage,
  };
});

function App() {
  const appTheme = useMemo(() => createAppTheme(), []);

  const handleOpenCreatePage = () => {
    window.dispatchEvent(new Event('parts:open-create'));
  };

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Paper
        sx={{
          width: '100%',
          borderRadius: 0,
          maxWidth: '100%',
          height: { xs: 'auto', lg: '100dvh' },
          minHeight: { xs: '100dvh', lg: '100vh' },
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 1, md: 1.6, lg: 1.9 },
          border: '1px solid',
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.22),
          background: (theme) =>
            `radial-gradient(1200px 420px at -10% -20%, ${alpha(theme.palette.primary.main, 0.18)} 0%, transparent 60%), radial-gradient(900px 360px at 110% -10%, ${alpha(theme.palette.primary.light, 0.2)} 0%, transparent 58%), linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${theme.palette.background.default} 100%)`,
          boxShadow: '0 8px 18px rgba(15, 23, 42, 0.06)',
          overflowX: 'hidden',
          overflowY: { xs: 'auto', lg: 'hidden' },
        }}
      >
        <AppBar
          position="static"
          color="transparent"
          elevation={0}
          sx={{
            borderRadius: 1,
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

        <Box sx={{ mt: 1.4, flex: 1, minHeight: 0, display: 'flex', overflow: { lg: 'hidden' } }}>
          <Suspense
            fallback={(
              <Box sx={{ p: 2, color: 'text.secondary' }}>
                <Typography variant="body2">Loading workspace...</Typography>
              </Box>
            )}
          >
            <PartsPage />
          </Suspense>
        </Box>
      </Paper>
    </ThemeProvider>
  );
}

export default App;
