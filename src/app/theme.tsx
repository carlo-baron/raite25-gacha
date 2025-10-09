"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import {
    LightMode,
    DarkMode,
} from '@mui/icons-material';
import {
    Button,
} from '@mui/material';
import { 
    useState,
    useEffect
} from 'react';

const cache = createCache({ key: 'css', prepend: true });

export default function ThemeRegistry({ children }: { children: React.ReactNode; }) {
    const [isLight, setIsLight] = useState<boolean>(() =>{
      if(typeof window !== 'undefined'){
        return window.matchMedia("(prefers-color-scheme: light)").matches;
      }
      return false;
    });
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


//<Button
//variant={ isLight ? "contained" : "outlined" }
//size="small"
//sx={{
//  p: 1,
//  position: 'fixed',
//  top: '1rem',
//  right: '1rem',
//  width: 'fit-content',
//  height: 'fit-content',
//  zIndex: 10000,
//}}
//onClick={() => setIsLight(!isLight)}
//>
//  {
//      isLight ?
//          <LightMode />
//      :
//          <DarkMode />
//  }
//</Button>
