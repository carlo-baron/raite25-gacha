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
import { 
  TIERS,
  fetchPokemonData,
  Rarity,
  PokemonType,
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

export default function Gacha({
  onPull,
  walletBalance = 0,
  spendTokens = () => false,
  refundTokens,
  pullCost = 55
}: GachaProps){
  const [selected, setSelected] = useState<string | null>('ex');
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [pulledMon, setPulledMon] = useState<PokemonType | null>(null);
  const [message, setMessage] = useState<string>('');

  async function pull(){
    if(isPulling) return;
    setIsPulling(true);

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

    try {
      const poke = await fetchPokemonData(pick);
      const sumStats = (Object.values(poke.stats) as number[]).reduce(
        (a,b) => a + b,
          0
      );
      const multiplier = getRarityMultiplier(tier.name);
      const cryptoWorth = Math.max(1, Math.round((sumStats / 10) * multiplier));

      const monster = {
        uid: Date.now() + "-" + Math.floor(Math.random()*10000),
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

      onPull(monster);
      setPulledMon(monster);
      setMessage(`Pulled ${monster.name.toUpperCase()}`);
      setSelected(monster.rarity.toLowerCase())
    } catch (err) {
      console.error("Gacha pull failed", err);
      setMessage("Pull failed — refunding tokens.");
      refundTokens(pullCost, "Refund failed pull");
    } finally {
      setTimeout(() => setIsPulling(false), 600);
    }
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
            fontWeight={600}
            >
              Wallet Balance: 
            </Typography>
            <Typography
            variant='h4'
            fontWeight={700}
            className='self-center'
            >
              Ξ{walletBalance.toLocaleString()}
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
          {
            pulledMon && (
              <img 
              className='w-[256px] self-center'
              src={pulledMon.sprite}
              alt=""
              />
            )
          }
            <Typography
            className='self-center'
            >
              {
                message 
              }
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
] as const;

export  function BadgeSelector({selected=null}:{selected?: string | null;}) {

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
