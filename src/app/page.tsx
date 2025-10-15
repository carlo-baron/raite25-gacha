"use client" 

import {
  Container,
  Box,
  AppBar,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  useState,
  useEffect,
} from 'react';
import {
  PokemonType,
  WalletType,
  loadMonstersFromStorage,
  saveMonstersToStorage,
  loadWalletFromStorage,
  saveWalletToStorage,
} from '@/utils';
import Gacha from './components/Gacha';
import MonsterList from './components/MonsterList';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
} from '@coinbase/onchainkit/wallet';
import { 
  useReadContract,
  useAccount,
  useWatchContractEvent,
} from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import GachaTokenAbi from '@/abi/GachaToken.json';
import GachaSystemAbi from '@/abi/GachaSystem.json';

const GACHA_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_GACHA_TOKEN as `0x${string}`;
const GACHA_SYSTEM_ADDRESS = process.env.NEXT_PUBLIC_GACHA_SYSTEM as `0x${string}`;

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useReadContract({
    address: GACHA_TOKEN_ADDRESS,
    abi: GachaTokenAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: baseSepolia.id
  });
  const { data: price } = useReadContract({
    address: GACHA_SYSTEM_ADDRESS,
    abi: GachaSystemAbi,
    functionName: 'price',
    chainId: baseSepolia.id
  });

  const [monsters, setMonsters] = useState<PokemonType[]>([])
  const [wallet, setWallet] = useState<WalletType>({
    balance: 0,
    history: []
  });

  useEffect(()=>{
    if(!address || !isConnected || !balance){
      return;
    }
    const savedMons = loadMonstersFromStorage(address);
    if(savedMons){
      setMonsters(savedMons);
    }

    const savedWallet = loadWalletFromStorage(address);
    const formattedBalance = Number(balance)/1e18;
    if(!savedWallet){
      const initial: WalletType = {
        balance: formattedBalance,
        history: [],
      };
      saveWalletToStorage(address, initial)
      setWallet(initial);
    }else{
      setWallet(()=>{
        const newWallet = {...savedWallet, balance: formattedBalance}
        return newWallet
      })
    }

  }, [isConnected, address, balance]);

  useEffect(() => {
    if(!address) return;
    saveMonstersToStorage(address, monsters);
  }, [monsters]);

  useEffect(() => {
    if(!address || !wallet) return;
    saveWalletToStorage(address, wallet);
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
          <Wallet>
            <ConnectWallet/>
            <WalletDropdown />
          </Wallet>
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
        pullCost={price ? (Number(price)/1e18) : 0}
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

