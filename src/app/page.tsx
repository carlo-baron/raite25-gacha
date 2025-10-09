"use client";

import {
  Container,
  Box,
  Button,
  AppBar,
  Paper,
  Toolbar,
  Typography,
  Chip,
} from '@mui/material';
import {
  useState,
  useEffect,
  useRef,
} from 'react';
import Gacha from './components/Gacha';

export default function Home() {
  return (
    <Container
    className='p-4 flex flex-col'
    disableGutters
    >
      <AppBar
      className='rounded-md mb-4'
      position='static'
      >
        <Toolbar
        className='flex justify-between'
        >
          <Typography
          className='font-bold text-md'
          >
            GachaCare
          </Typography>
          <Button
          variant='contained'
          className='text-xs'
          size='small'
          >
            Connect
          </Button>
        </Toolbar>
      </AppBar>
      <Gacha />
    </Container>
  );
}

