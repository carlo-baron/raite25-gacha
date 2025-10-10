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
import {
  PULL_COST,
  PokemonType,
} from '@/utils';
import Gacha from './components/Gacha';
import MonsterList from './components/MonsterList';

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
    className='gap-2 h-screen p-4 flex flex-col'
    disableGutters
    >
      <AppBar
      className='rounded-md'
      position='static'
      >
        <Toolbar
        className='flex justify-between'
        >
          <Typography
          variant='h6'
          fontWeight={800}
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
      <Box 
      className="flex flex-col gap-2 main"
      >
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
        <MonsterList 
        monsters={monsters}
        />
      </Box>
    </Container>
  );
}

