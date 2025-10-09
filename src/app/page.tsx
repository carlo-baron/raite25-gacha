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
  PULL_COST,
  PokemonType,
} from '@/utils';

interface WalletHistory {
  ts: number;
  type: "credit" | "debit";
  amount: number;
  note: string;
}

interface Wallet {
  balance: number;
  history: WalletHistory[];
}

export default function Home() {
  const [monsters, setMonsters] = useState<PokemonType[]>([]);
  const [wallet, setWallet] = useState<Wallet>({ balance: 5000, history: [] });

  function addMonster(monster: PokemonType) {
    setMonsters(prev => [monster, ...prev]);
  }

  function spendTokens(amount: number, note = "") {
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

  function creditTokens(amount: number, note = "") {
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

