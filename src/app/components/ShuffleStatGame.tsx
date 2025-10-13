'use client';

import { motion } from 'motion/react';
import {
  useState,
  useMemo
} from 'react';

import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import {
  PokemonType,
} from '@/utils';

import {
  Paper,
  Box,
  Typography,
} from '@mui/material';

const STAT_KEYS = [
  { key: "hp", label: "HP" },
  { key: "attack", label: "Attack" },
  { key: "defense", label: "Defense" },
  { key: "speed", label: "Speed" },
  { key: "special-attack", label: "Special" },
];

function getRarityConfig(rarity: string) {
  switch (rarity) {
    case "EX":
      return { chance: 0.88, min: 8, max: 15, worthMult: 5 };
    case "Ultra-Rare":
      return { chance: 0.80, min: 5, max: 9, worthMult: 3 };
    case "Rare":
      return { chance: 0.72, min: 3, max: 6, worthMult: 2 };
    case "Uncommon":
      return { chance: 0.65, min: 2, max: 4, worthMult: 1.5 };
    default:
      return { chance: 0.58, min: 1, max: 3, worthMult: 1 };
  }
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface ShuffleResult {
  statKey: string;
  delta: number;
  deltaWorth: number;
  success: boolean;
  message: string;
  source: string;
}

export default function ShuffleStatGame({
  monster, 
  onResult
}: {
  monster: PokemonType;
  onResult: (result: ShuffleResult) => void;
}) {

  const [lockedIndex, setLockedIndex] = useState<number | null>(null);
  const [shuffled, setShuffled] = useState(() => shuffleArray(STAT_KEYS));
  const [message, setMessage] = useState<string | null>(null);

  const config = useMemo(() => getRarityConfig(monster.rarity), [monster.rarity]);

  //function reshuffle() {
  //  setLockedIndex(null);
  //  setMessage(null);
  //  setShuffled(shuffleArray(STAT_KEYS));
  //}

  async function onPick(index: number) {
    if (lockedIndex !== null) return;
    setLockedIndex(index);

    const picked = shuffled[index];
    const roll = Math.random();
    const success = roll <= config.chance;

    let delta = 0;
    let deltaWorth = 0;
    let msg = "";

    if (success) {
      delta = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
      deltaWorth = Math.max(1, Math.round(delta * config.worthMult));
      msg = `Success! ${picked.label} +${delta} (Δ ₿${deltaWorth})`;
    } else {
      msg = `No effect. Better luck next time.`;
    }

    setMessage(msg);

    setTimeout(() => {
      onResult({
        statKey: picked.key,
        delta,
        deltaWorth,
        success,
        message: msg,
        source: "StatBoostShuffle",
      });
    }, 600);
  }

  const mappedCards = shuffled.map((stat, index) => {
    const isFlipped = lockedIndex === index;

    return (
      <motion.div
        key={stat.key}
        className="relative w-[90px] aspect-[9/16]"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        onClick={() => onPick(index)}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Front Face */}
        <div
          className="absolute w-full h-full backface-hidden flex items-center justify-center"
          style={{
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
          }}
        >
          <Paper
            elevation={10}
            className="w-full h-full rounded-xl flex flex-col items-center justify-center"
          >
            <QuestionMarkIcon fontSize="large" />
          </Paper>
        </div>

        {/* Back Face */}
        <div
          className="absolute w-full h-full flex items-center justify-center"
          style={{
            transform: 'rotateY(180deg)',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
          }}
        >
          <Paper
            elevation={10}
            className="w-full h-full rounded-xl flex items-center justify-center"
          >
            <Typography variant="body2">{stat.label}</Typography>
          </Paper>
        </div>
      </motion.div>
    );
  });

  return (
    <Box>
      <Typography className="capitalize" variant="body1">
        Stat boost bonus
      </Typography>

      <Box
        className="flex justify-center gap-2 p-2"
        style={{ perspective: '800px' }}
      >
        {mappedCards}
      </Box>

      {message && (
        <Typography variant="subtitle2" className="mt-2">
          {message}
        </Typography>
      )}
    </Box>
  );
}

