"use client";
import { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Typography,
  Paper,
  Button
} from '@mui/material';
import { 
  TIERS,
  fetchPokemonData,
  Rarity,
  PokemonType,
  rarityBadges,
} from '@/utils';

const cumulative = (function buildCumulative() {
  const total = TIERS.reduce((s, t) => s + t.weight, 0);
  let sum = 0;
  return TIERS.map((t) => {
    sum += t.weight / total;
    return { ...t, cum: Math.min(1, sum) };
  });
})();

function weightedPickTier(rand = Math.random()) {
  for (const t of cumulative) {
    if (rand <= t.cum) return t;
  }
  return cumulative[cumulative.length - 1];
}

function getRarityMultiplier(rarity: Rarity) {
  switch (rarity) {
    case "EX": return 10;
    case "Ultra-Rare": return 5;
    case "Rare": return 2.5;
    case "Uncommon": return 1.5;
    default: return 1;
  }
}

interface GachaProps{
  onPull: (monster: PokemonType) => void;
  walletBalance: number;
  spendTokens: (cost: number, message: string) => boolean;
  refundTokens: (cost: number, message: string) => void;
  pullCost: number;
}

import { 
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useReadContract,
  useSwitchChain,
} from 'wagmi';
import { 
  decodeEventLog,
  TransactionReceipt,
} from 'viem';
import { baseSepolia } from 'wagmi/chains';
import GachaTokenAbi from '@/abi/GachaToken.json';
import GachaSystemAbi from '@/abi/GachaSystem.json';

const GACHA_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_GACHA_TOKEN as `0x${string}`;
const GACHA_SYSTEM_ADDRESS = process.env.NEXT_PUBLIC_GACHA_SYSTEM as `0x${string}`;

const generateTokenURI = (monster: PokemonType): string => {
  const metadata = {
    "name": `${monster.name}`,
    "image": monster.sprite
  };
  const jsonString = JSON.stringify(metadata);
  return `data:application/json,${encodeURIComponent(jsonString)}`;
};

export default function Gacha({
  onPull,
  walletBalance = 0,
  spendTokens = () => false,
  refundTokens,
  pullCost,
}: GachaProps){
  const [selected, setSelected] = useState<string | null>('ex');
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [pulledMon, setPulledMon] = useState<PokemonType | null>(null);
  const [message, setMessage] = useState<string>('');
  const [revealMon, setRevealMon] = useState<boolean>(false);
  const { address } = useAccount();
  const { switchChain } = useSwitchChain();
  
  const { data: currentAllowance } = useReadContract({
    address: GACHA_TOKEN_ADDRESS,
    abi: GachaTokenAbi,
    functionName: 'allowance',
    args: [address, GACHA_SYSTEM_ADDRESS],
  }) as {data: bigint | undefined };

  const { writeContract, data: txHash, error: writeError, reset: resetWrite } = useWriteContract();
  const { isLoading: isTxLoading, isSuccess: isTxSuccess, error: txError, data: receipt } = useWaitForTransactionReceipt({ hash: txHash });

  const rarityToNumber = (rarity: string): number => {
    const rarityMap: Record<string, number> = {
      "Common": 1,
      "Uncommon": 2, 
      "Rare": 3,
      "Ultra-Rare": 4,
      "EX": 5
    };
    return rarityMap[rarity] || 1;
  };


  useEffect(() => {
    if (writeError) {
      setMessage("Transaction cancelled");
      setIsPulling(false);
      refundTokens(pullCost, "Refund cancelled transaction");
      resetWrite();
    }
  }, [writeError, pullCost, refundTokens, resetWrite]);


  useEffect(() => {
    if (txError) {
      console.error("Transaction failed:", txError);
      setMessage("Transaction failed — refunding tokens.");
      refundTokens(pullCost, "Refund failed transaction");
      setIsPulling(false);
    }
  }, [txError, pullCost, refundTokens]);

  function getTokenId(receipt: TransactionReceipt){
    try {
      for (const log of receipt.logs || []) {
        try {
          const parsed = decodeEventLog({
            abi: GachaSystemAbi,
            data: log.data,
            topics: log.topics
          }) as {
            eventName: string;
            args?: {tokenId?: bigint};
          };
          if (parsed.eventName === 'Bought' && parsed.args?.tokenId !== undefined) {
            const tokenId = Number(parsed.args.tokenId);
            return tokenId;
          }
        } catch {}
      }
      return null;
    } catch {}
  }

  useEffect(() => {
    if(!isTxSuccess || !receipt || !pulledMon) return;

    const tokenId = getTokenId(receipt);
    if(tokenId !== null){
      const updatedMon = {...pulledMon, tokenId};
      setPulledMon(updatedMon);
      onPull(updatedMon);
      setMessage(`Successfully pulled ${updatedMon.name.toUpperCase()}! NFT minted!`);
      setRevealMon(true);
    }else{
      setPulledMon(null);
      setMessage("Pull failed — refunding tokens.");
      refundTokens(pullCost, "Refund failed pull");
    }
    setIsPulling(false);

  }, [isTxSuccess, receipt]);

  useEffect(()=>{
    if(isTxLoading){
      setMessage("Minting NFT...");
    }
  }, [isTxLoading]);

  async function pull() {
    if(isPulling || !address) return;
    setRevealMon(false);
    setPulledMon(null);

    setIsPulling(true);
    setMessage("Starting gacha pull...");

    try {
      try{
        await switchChain({chainId: baseSepolia.id});
      } catch(err){
        console.error("Network switch failed");
        setMessage("Please switch your wallet to Base sepolia.");
        setIsPulling(false);
        return;
      }
      if (walletBalance < pullCost) {
        setMessage("Insufficient tokens — top up to pull.");
        setIsPulling(false);
        return;
      }

      const canSpend = spendTokens(pullCost, `Gacha pull (${pullCost})`);
      if (!canSpend) {
        setMessage("Insufficient tokens — top up to pull.");
        setIsPulling(false);
        return;
      }

      const random = Math.random();
      const tier = weightedPickTier(random);
      const list = tier.pokemon;
      const pick = list[Math.floor(Math.random() * list.length)];

      const poke = await fetchPokemonData(pick);
      const sumStats = (Object.values(poke.stats) as number[]).reduce((a, b) => a + b, 0);
      const multiplier = getRarityMultiplier(tier.name);
      const cryptoWorth = Math.max(1, Math.round((sumStats / 10) * multiplier));

      const monster = {
        uid: Date.now() + "-" + Math.floor(Math.random() * 10000),
        acquiredAt: Date.now(),
        name: poke.name,
        speciesId: poke.id,
        sprite: poke.sprite,
        types: poke.types,
        cry: poke.cry,
        baseStats: poke.stats,
        stats: { ...poke.stats },
        rarity: tier.name,
        cryptoWorth,
        history: [
          { ts: Date.now(), event: `Pulled (${tier.name})`, deltaWorth: 0 }
        ]
      };

      setPulledMon(monster);
      setSelected(monster.rarity.toLowerCase());

      const requiredAmount = BigInt(pullCost * 10 ** 18);
      
      if (currentAllowance && currentAllowance >= requiredAmount) {
        setMessage("Waiting for confirmation...");
        await executeGachaPull(monster);
      } else {
        setMessage("Approving tokens...");
        
        const approveAmount = BigInt(1000 * 10 ** 18);
        
        await writeContract({
          address: GACHA_TOKEN_ADDRESS,
          abi: GachaTokenAbi,
          functionName: "approve",
          args: [
            GACHA_SYSTEM_ADDRESS,
            approveAmount
          ],
          chainId: baseSepolia.id
        });
        
        setIsPulling(false);
        return;
      }

    } catch (err) {
      console.error("Gacha pull failed", err);
      setMessage("Pull failed — refunding tokens.");
      refundTokens(pullCost, "Refund failed pull");
      setIsPulling(false);
    }
  }

  async function executeGachaPull(monster: PokemonType) {
    try {
      //const tokenURI = generateTokenURI(monster);
      const tokenURI = '';
      
      await writeContract({
        address: GACHA_SYSTEM_ADDRESS,
        abi: GachaSystemAbi,
        functionName: "buyAndMint",
        args: [
          monster.speciesId,
          rarityToNumber(monster.rarity),
          tokenURI
        ],
        chainId: baseSepolia.id
      });

    } catch (err) {
      console.error("Minting failed:", err);
    }
  }

  return (
    <Paper className='p-2 rounded-md' elevation={3}>
      <Box className='flex flex-col gap-2 items-center'>
        <Box className="flex flex-col w-full wallet">
          <Typography variant='h6' fontWeight={600}>
            Wallet Balance: 
          </Typography>
          <Typography variant='h4' fontWeight={700} className='self-center'>
            Ξ{walletBalance.toLocaleString()}
          </Typography>
        </Box>
        
        <Box className="flex flex-col items-center gap-2 w-full pull">
          <Button
            variant='contained'
            className='w-full'
            onClick={pull}
            disabled={isPulling || !address}
          >
            {isPulling ? 'Processing...' : `Pull(1x) * ${pullCost} tokens`}
          </Button>
          <BadgeSelector selected={revealMon ? selected:null}/>
        </Box>
        
        <Box className="pulled flex flex-col">
          {pulledMon && revealMon && (
            <>
              <img 
                className='w-[256px] self-center'
                src={pulledMon.sprite}
                alt={pulledMon.name}
              />
            </>
          )}
          <Typography className='self-center text-center'>
            {message}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export function BadgeSelector({selected = null}: {selected?: string | null;}) {
  return (
    <Box className="flex flex-wrap gap-2">
      {rarityBadges.map((badge) => (
        <Chip
          key={badge.text}
          label={badge.text}
          sx={{
            backgroundColor: selected === badge.text.toLowerCase() ? 'success.main' : 'transparent',
            color: selected === badge.text.toLowerCase() ? 'white' : badge.color,
            fontWeight: 700,
            borderRadius: '100rem',
            border: `2px solid ${badge.color}`,
            fontSize: '10px'
          }}
          size='small'
        />
      ))}
    </Box>
  );
}
