import SvgIcon from '@mui/material/SvgIcon';
import type { SvgIconProps } from '@mui/material/SvgIcon';

export function ReactSparkIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        d="M12 2 14.6 8.4 21 11l-6.4 2.6L12 20l-2.6-6.4L3 11l6.4-2.6L12 2Z"
        fill="currentColor"
      />
      <path
        d="M5.5 3.5 6.3 5.7 8.5 6.5 6.3 7.3 5.5 9.5 4.7 7.3 2.5 6.5 4.7 5.7Z"
        fill="currentColor"
      />
      <path
        d="M18.5 14.5 19.1 16.1 20.7 16.7 19.1 17.3 18.5 18.9 17.9 17.3 16.3 16.7 17.9 16.1Z"
        fill="currentColor"
      />
    </SvgIcon>
  );
}

export function ReactNodeIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <circle cx="6" cy="6" r="2.5" fill="currentColor" />
      <circle cx="18" cy="6" r="2.5" fill="currentColor" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      <circle cx="6" cy="18" r="2.5" fill="currentColor" />
      <circle cx="18" cy="18" r="2.5" fill="currentColor" />
      <path
        d="M8.5 6h7M7.7 7.8l2.8 2.8M16.3 7.8l-2.8 2.8M8.5 18h7M7.7 16.2l2.8-2.8M16.3 16.2l-2.8-2.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </SvgIcon>
  );
}
