"use client";

import {
  Container,
  Box,
  Button,
  AppBar,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  useState,
  useEffect,
} from 'react';
import {
  PULL_COST,
  PokemonType,
  Wallet,
  loadMonstersFromStorage,
  saveMonstersToStorage,
  loadWalletFromStorage,
  saveWalletToStorage,
  INITIAL_TOKENS,
} from '@/utils';
import Gacha from './components/Gacha';
import MonsterList from './components/MonsterList';

export default function Home() {
  const [monsters, setMonsters] = useState<PokemonType[]>(() => {
    const saved = loadMonstersFromStorage();
    return saved ? saved : [];
  });
  const [wallet, setWallet] = useState<Wallet>(() => {
    const w = loadWalletFromStorage();
    if (w && typeof w.balance === "number") return w;
    else {
      const initial: Wallet = {
        balance: INITIAL_TOKENS,
        history: [
          { ts: Date.now(), type: "credit", amount: INITIAL_TOKENS, note: "Starting demo balance" },
        ],
      };
      saveWalletToStorage(initial);
      return(initial);
    }
  });

  useEffect(() => {
    saveMonstersToStorage(monsters);
  }, [monsters]);

  useEffect(() => {
    saveWalletToStorage(wallet);
  }, [wallet]);

  function addMonster(monster: PokemonType) {
    setMonsters(prev => [monster, ...prev]);
  }

  function updateMonster(updated: PokemonType) {
    setMonsters((prev) => prev.map((m) => (m.uid === updated.uid ? updated : m)));
  }

  function removeMonsterByUid(uid: string) {
    setMonsters((prev) => prev.filter((m) => m.uid !== uid));
  }

  function sellMonster(uid: string){
    const monster = monsters.find(mon => mon.uid === uid);
    if(!monster) return;

    const worth = Math.max(0, Math.round(monster.cryptoWorth || 0));
    removeMonsterByUid(uid);
    creditTokens(worth, `Sold ${monster.name} (₿${worth})`);
    return true;
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
        onUpdate={updateMonster}
        onDelete={removeMonsterByUid}
        onSell={(uid) => sellMonster(uid)}
        addMonster={addMonster}
        creditTokens={(amt, note) => creditTokens(amt, note)}
        />
      </Box>
    </Container>
  );
}

