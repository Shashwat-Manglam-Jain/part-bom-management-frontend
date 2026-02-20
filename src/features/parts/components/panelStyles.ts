import { alpha, type SxProps, type Theme } from '@mui/material/styles';

export const panelSx: SxProps<Theme> = {
 padding:'30px',
 paddingBottom:'4rem',
  borderRadius: 1,
  marginTop:'10px',
  border: '1px solid',
  borderColor: (theme) => alpha(theme.palette.primary.main, 0.16),
  boxShadow: (theme) =>
    `0 14px 34px ${alpha(theme.palette.primary.main, 0.08)}, 0 1px 0 ${alpha(theme.palette.common.white, 0.92)} inset`,
  background: (theme) =>
    `linear-gradient(180deg, ${alpha(theme.palette.primary.light, 0.2)} 0%, ${theme.palette.background.paper} 130px)`,
};

export const sectionHeaderSx: SxProps<Theme> = (theme) => ({
  px: 1.2,
  py: 1.05,
  borderRadius: 1,
  border: '1px solid',
  borderColor: alpha(theme.palette.primary.main, 0.24),
  background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.16)} 0%, ${alpha(theme.palette.primary.main, 0.06)} 100%)`,
});

export const subtleCardSx: SxProps<Theme> = {
  p: 1.05,
  borderRadius: 1,
  border: '1px solid',
  borderColor: (theme) => alpha(theme.palette.primary.main, 0.14),
  backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.24),
};
