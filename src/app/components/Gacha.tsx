import {
  useState,
} from 'react';

import {
  Box,
  Chip,
  Typography,
  Paper,
  Button
} from '@mui/material';
import { TIERS } from '@/utils';

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

function getRarityMultiplier(rarity) {
  switch (rarity) {
    case "EX": return 10;
    case "Ultra-Rare": return 5;
    case "Rare": return 2.5;
    case "Uncommon": return 1.5;
    default: return 1;
  }
}

interface GachaProps{
  onPull: () => void;
  walletBalance: number;
  refundTokens: () => void;
  pullCost: number;
}

export default function Gacha({
  onPull,
  walletBalance = 0,
  refundTokens,
  pullCost = 55
}: GachaProps){
  const [selected, setSelected] = useState<string | null>('ex');
  const [isPulling, setIsPulling] = useState<boolean>(false);

  function pull(){
    if(isPulling) return;
    setIsPulling(true);
  }

  return(
      <Paper
      className='p-2 rounded-md'
      elevation={3}
      >
        <Box
        className='flex flex-col gap-2 items-center'
        >
          <Box 
          className="flex flex-col w-full wallet"
          >
            <Typography
            variant='h6'
            >
              Wallet Balance: 
            </Typography>
            <Typography
            variant='h4'
            fontWeight={600}
            className='self-center'
            >
              Ξ1,000
            </Typography>
          </Box>
          <Box 
          className="flex flex-col items-center gap-2 w-full pull"
          >
            <Button
            variant='contained'
            className='w-full'
            onClick={pull}
            >
              {
                isPulling ?
                  'Pulling...'
                :
                  'Pull(1x) * 55 tokens'
              }
            </Button>
            <BadgeSelector selected={selected}/>
          </Box>
          <Box 
          className="pulled flex flex-col"
          >
            <img 
            className='w-[256px]'
            src='/infernape.png'
            alt=""
            />
            <Typography
            className='self-center'
            >
            Pulled Infernape
            </Typography>
          </Box>
        </Box>
      </Paper>
  );
}

const rarityBadges = [
  {text: 'Common', color: '#fff'},
  {text: 'Uncommon', color: '#22c55e'},
  {text: 'Rare', color: '#f87316'},
  {text: 'Ultra-Rare', color: '#ec4899'},
  {text: 'EX', color: '#ef4444'},
];

export  function BadgeSelector({selected=null}:{selected?: string | null;}) {

  return (
    <Box className="flex gap-2">
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
