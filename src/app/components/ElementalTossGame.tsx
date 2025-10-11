"use client";

import { motion } from "motion/react";
import { useState, useMemo } from "react";
import { Paper, Box, Typography, Button } from "@mui/material";
import { PokemonType, Rarity } from "@/utils";

type ZoneId = "fire" | "water" | "electric" | "psychic" | "ice" | "grass";

interface Zone {
  id: ZoneId;
  label: string;
  prefers: string[];
}

interface ZoneWeights {
  [key: string]: number;
}

interface TossResult {
  zone: string;
  zoneId: string;
  statKey: string;
  delta: number;
  deltaWorth: number;
  matched: boolean;
  message: string;
  source: string;
}

const ZONES: Zone[] = [
  { id: "fire", label: "Fire", prefers: ["attack", "special-attack"] },
  { id: "water", label: "Water", prefers: ["special-attack", "defense"] },
  { id: "electric", label: "Electric", prefers: ["speed", "attack"] },
  { id: "psychic", label: "Psychic", prefers: ["special-attack", "special-defense"] },
  { id: "ice", label: "Ice", prefers: ["defense", "speed"] },
  { id: "grass", label: "Grass", prefers: ["hp", "special-attack"] },
];

function getRarityConfig(rarity: Rarity) {
  switch (rarity) {
    case "EX":
      return { matchMult: 6, baseMin: 6, baseMax: 12, baseWorthMult: 5, extraChance: 0.15 };
    case "Ultra-Rare":
      return { matchMult: 4, baseMin: 4, baseMax: 9, baseWorthMult: 3, extraChance: 0.12 };
    case "Rare":
      return { matchMult: 3, baseMin: 3, baseMax: 6, baseWorthMult: 2, extraChance: 0.1 };
    case "Uncommon":
      return { matchMult: 1.8, baseMin: 2, baseMax: 4, baseWorthMult: 1.5, extraChance: 0.07 };
    default:
      return { matchMult: 1.2, baseMin: 1, baseMax: 3, baseWorthMult: 1, extraChance: 0.05 };
  }
}

function buildZoneWeights(monsterTypes: string[] = []): ZoneWeights {
  const weights: ZoneWeights = {};
  const base = 1;
  const typeMatchBoost = 4;
  ZONES.forEach((z) => {
    weights[z.id] = base;
    if (monsterTypes.includes(z.id)) weights[z.id] += typeMatchBoost;
  });
  return weights;
}

function weightedPick(weights: Record<string, number>): string {
  const entries = Object.entries(weights);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [k, w] of entries) {
    if (r < w) return k;
    r -= w;
  }
  return entries[entries.length - 1][0];
}

interface ElementalTossGameProps{
  monster: PokemonType;
  onResult: (result: TossResult) => void;
}

export default function ElementalTossGame({
  monster,
  onResult,
}: ElementalTossGameProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isTossing, setIsTossing] = useState<boolean>(false);
  const [lastOutcome, setLastOutcome] = useState<TossResult | null>(null);

  const cfg = useMemo(() => getRarityConfig(monster.rarity), [monster.rarity]);
  const zoneWeights = useMemo(() => buildZoneWeights(monster.types || []), [monster.types]);

  async function doToss() {
    if (isTossing) return;
    setIsTossing(true);
    setLastOutcome(null);

    const zoneId = weightedPick(zoneWeights);
    const zoneDef = ZONES.find((z) => z.id === zoneId);
    if (!zoneDef) return;

    const matched = (monster.types || []).includes(zoneId);
    const statChoices = zoneDef.prefers;
    const statKey = statChoices[Math.floor(Math.random() * statChoices.length)];
    const baseMin = cfg.baseMin;
    const baseMax = cfg.baseMax;
    const baseDelta = Math.floor(Math.random() * (baseMax - baseMin + 1)) + baseMin;

    let delta: number;
    if (matched) {
      delta = Math.max(1, Math.round(baseDelta * cfg.matchMult));
    } else {
      delta = Math.max(0, Math.round(baseDelta * 0.6));
    }

    if (Math.random() < cfg.extraChance) {
      const bonus = Math.ceil(delta * 0.5);
      delta += bonus;
    }

    const deltaWorth = Math.max(0, Math.round(delta * cfg.baseWorthMult));

    const message = matched
      ? `Toss landed in ${zoneDef.label} — matched type! ${statKey} +${delta} (Δ ₿${deltaWorth})`
      : `Toss landed in ${zoneDef.label} — minor gain. ${statKey} +${delta} (Δ ₿${deltaWorth})`;

    const result: TossResult = {
      zone: zoneDef.label,
      zoneId,
      statKey,
      delta,
      deltaWorth,
      matched,
      message,
      source: "ElementalLuckToss",
    };

    function delay(ms: number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function runSequence() {
      for (let i = 0; i < 3; i++) {
        for (const zone of ZONES) {
          setSelected(zone.id);
          await delay(100);
        }
      }
    }

    await runSequence();

    setTimeout(() => {
      setSelected(result.zoneId);
      setLastOutcome(result);
      onResult(result);
      setIsTossing(false);
    }, 600);
  }

  const mappedZones = ZONES.map((zone) => {
    const weight = zoneWeights[zone.id];
    let color = "";
    switch (zone.id) {
      case "fire":
        color = "bg-red-400";
        break;
      case "water":
        color = "bg-blue-400";
        break;
      case "electric":
        color = "bg-yellow-400";
        break;
      case "psychic":
        color = "bg-purple-400";
        break;
      case "ice":
        color = "bg-blue-300";
        break;
      case "grass":
        color = "bg-green-400";
        break;
    }
    return (
      <Paper
        key={zone.id}
        component={motion.div}
        initial={{scale: 1}}
        animate={selected === zone.id ? { scale: 1.1 } : {scale: 1}}
        elevation={10}
        className="w-[90px] aspect-[9/16]"
      >
        <Box className={`${color} text-sm/tight flex-col rounded-md h-full flex justify-center items-center`}>
          <Typography variant="body1" color="black" fontWeight={600}>
            {zone.label}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Weight {Math.round(weight)}
          </Typography>
        </Box>
      </Paper>
    );
  });

  return (
    <Box className="flex flex-col">
      <Typography variant="body1" className="capitalize">
        Elemental Toss Bonus
      </Typography>
      <Box className="flex gap-2 p-2 justify-center">{mappedZones}</Box>
      <Button
        variant="contained"
        color="secondary"
        size="small"
        className="self-end"
        sx={{ marginRight: 1 }}
        onClick={doToss}
        disabled={isTossing}
      >
        {isTossing ? "Tossing..." : "Toss Token"}
      </Button>
      <Typography variant="subtitle2">{lastOutcome ? lastOutcome.message : ""}</Typography>
    </Box>
  );
}

