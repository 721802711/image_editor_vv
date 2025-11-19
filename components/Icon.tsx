import React from 'react';
import type { IconName } from '../types';

interface IconProps {
  name: IconName;
  className?: string;
}

const ICONS: Record<IconName, React.ReactElement> = {
  upload: <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />,
  rotate: <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-11.664-5.303A8.25 8.25 0 0118 10.5c3.866 0 7.091-2.903 7.475-6.692m-15.025 0A8.25 8.25 0 016 10.5c-3.866 0-7.091-2.903-7.475-6.692" />,
  'rotate-left': <path strokeLinecap="round" strokeLinejoin="round" d="M7.977 9.348H2.985v-.001M21.015 19.644v-4.992m0 0h-4.992m4.993 0l-3.181 3.183a8.25 8.25 0 01-11.664 0l-3.181-3.183m11.664-5.303A8.25 8.25 0 006 10.5c-3.866 0-7.091-2.903-7.475-6.692m15.025 0A8.25 8.25 0 0018 10.5c3.866 0 7.091-2.903 7.475-6.692" />,
  resize: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />,
  crop: <g><path strokeLinecap="round" strokeLinejoin="round" d="M6 2v14a2 2 0 0 0 2 2h14" /><path strokeLinecap="round" strokeLinejoin="round" d="M18 22V8a2 2 0 0 0-2-2H2" /></g>,
  grayscale: <g><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5A7.5 7.5 0 003.75 12a7.5 7.5 0 007.5 7.5v-15z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12.75 4.5v15a7.5 7.5 0 000-15z" /></g>,
  collage: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25-2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />,
  download: <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />,
  add: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />,
  close: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />,
  reset: <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-11.664-5.303A8.25 8.25 0 0118 10.5c3.866 0 7.091-2.903 7.475-6.692m-15.025 0A8.25 8.25 0 016 10.5c-3.866 0-7.091-2.903-7.475-6.692" />,
  palette: <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 2.25a.75.75 0 00-1.5 0v.816c-1.34.22-2.583.692-3.718 1.346l-.603-.348a.75.75 0 10-.75 1.3l.603.348C5.59 7.15 5 8.51 5 10v2.25a.75.75 0 001.5 0v-.312c.3-.18.61-.343.93-.492a.75.75 0 00.582-1.077 8.25 8.25 0 1110.156 2.365.75.75 0 00-1.15-.745 6.75 6.75 0 00-8.86 2.052.75.75 0 00.722 1.052h.017c.995 0 1.958-.2 2.86-.583a.75.75 0 00.582-1.077 8.25 8.25 0 01-1.564-8.834.75.75 0 001.082-.993A6.75 6.75 0 0012.75 4.5v-2.25z" />,
  undo: <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />,
  save: <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />,
  home: <g>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a.75.75 0 011.06 0l8.955 8.955" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 21V12" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21V12" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21V15.75a1.5 1.5 0 011.5-1.5h0a1.5 1.5 0 011.5 1.5V21" />
  </g>,
  cutout: <g><path strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3" d="M12 21a9 9 0 01-9-9 9 9 0 019-9 9 9 0 01-9 9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 12.75l1.5-1.5-1.5-1.5m3 3l1.5-1.5-1.5-1.5m-4.5 1.5l1.5 1.5-1.5-1.5z M10.5 8.25l1.5 1.5-1.5 1.5" /></g>,
  expand: <g><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75V6a2.25 2.25 0 012.25-2.25h3.75" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75L7.5 10.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 3.75h3.75A2.25 2.25 0 0120.25 6v3.75" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5L12 12" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.25V18a2.25 2.25 0 01-2.25-2.25h-3.75" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 16.5L15 12" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 20.25H6a2.25 2.25 0 01-2.25-2.25v-3.75" /><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 19.5L12 15" /></g>,
  erase: <g><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.53L15.75 9l-5.25 5.25-4.5-4.5L11.25 4.53z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 9.75L9 12l-1.5 1.5-2.25-2.25L6.75 9.75z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12.75l-7.5 7.5-4.5-4.5 7.5-7.5 4.5 4.5z" /></g>,
  'flip-horizontal': <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />,
  'flip-vertical': <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />,
  'layout-horizontal': <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5v-15m0 0H5.25A2.25 2.25 0 003 6.75v10.5a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 17.25V6.75a2.25 2.25 0 00-2.25-2.25H10.5z" />,
  'layout-vertical': <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5h18M5.25 3h13.5A2.25 2.25 0 0121 5.25v13.5a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18.75V5.25A2.25 2.25 0 015.25 3z" />,
  'layout-grid': <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />,
  'ratio-free': <path strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4" d="M4 6h16v12H4z" />,
  'ratio-1-1': <rect x="5" y="5" width="14" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />,
  'ratio-16-9': <rect x="3" y="7" width="18" height="10" rx="2" strokeLinecap="round" strokeLinejoin="round" />,
  'ratio-4-3': <rect x="4" y="6" width="16" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round" />,
  'settings': <g><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></g>,
  'file-type': <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
};

const Icon: React.FC<IconProps> = ({ name, className = 'w-6 h-6' }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      {ICONS[name]}
    </svg>
  );
};

export default Icon;