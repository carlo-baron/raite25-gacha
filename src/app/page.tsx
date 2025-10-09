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
import {
  PULL_COST
} from '@/utils';

export default function Home() {
  const [monsters, setMonsters] = useState([]);
  const [wallet, setWallet] = useState({ balance: 5000, history: [] });

  function addMonster(monster) {
    setMonsters(prev => [monster, ...prev]);
  }

  function spendTokens(amount, note = "") {
    if (amount <= 0) return true;
    if (wallet.balance >= amount) {
      setWallet((prev) => {
        const next = { ...prev, balance: Math.max(0, prev.balance - amount) };
        next.history = [...(prev.history || []), { ts: Date.now(), type: "debit", amount, note }];
        return next;
      });
      return true;
    } else {
      return false;
    }
  }

  function creditTokens(amount, note = "") {
    if (amount <= 0) return;
    setWallet((prev) => {
      const next = { ...prev, balance: prev.balance + amount };
      next.history = [...(prev.history || []), { ts: Date.now(), type: "credit", amount, note }];
      return next;
    });
  }

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
      <Gacha 
      onPull={addMonster}
      walletBalance={wallet.balance}
      spendTokens={(amt, note) => {
        return spendTokens(amt, note);
      }}
      refundTokens={(amt, note) => {
        creditTokens(amt, note || "Refund");
      }}
      pullCost={PULL_COST}
      />
    </Container>
  );
}

