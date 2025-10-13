"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { 
    useState,
    useEffect
} from 'react';

const cache = createCache({ key: 'css', prepend: true });

export default function ThemeRegistry({ children }: { children: React.ReactNode; }) {
    const [isLight] = useState<boolean>(false);
    const [mounted, setMounted] = useState<boolean>(false);
    const theme = createTheme({
      palette: {
        mode: isLight ? "light" : "dark",
      },
    });

    useEffect(()=>{
        setMounted(true);
    },[]);

    if(!mounted)return null;

  return (
    <CacheProvider value={cache}> 
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
    </CacheProvider>
  );
}
