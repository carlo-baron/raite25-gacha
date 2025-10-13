"use client";

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import {
  fetchBattleMon,
  BattleMonType,
  Move,
  loadMonstersFromStorage,
  TIERS,
} from '@/utils';
import{
  Paper,
  Container,
  Box,
  Typography,
  ButtonBase,
  Backdrop,
  Button,
  CircularProgress,
} from '@mui/material';
import typeRelations from '@/../public/type-relations.json'; 

interface BattleState {
  playerMon: BattleMonType | null;
  enemyMon: BattleMonType | null;
  playerHP: number;
  enemyHP: number;
  maxPlayerHP: number;
  maxEnemyHP: number;
  isOver: boolean;
  winner: BattleMonType | null;
  isLoading: boolean;
}

export default function Home() {
  const [battleState, setBattleState] = useState<BattleState>({
    playerMon: null,
    enemyMon: null,
    playerHP: 0,
    enemyHP: 0,
    maxPlayerHP: 0,
    maxEnemyHP: 0,
    isOver: false,
    winner: null,
    isLoading: true
  });
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);
  const param = useParams();
  const router = useRouter();

  useEffect(() => {
    const loadBattleData = async () => {
      setBattleState(prev => ({ ...prev, isLoading: true }));
      
      const mons = loadMonstersFromStorage();
      const playerMonRaw = mons.find(m => m.name === param.name);
      
      if (!playerMonRaw) {
        router.push('/');
        return;
      }

      try {
        const player = await fetchBattleMon(param.name as string);
        player.stats = playerMonRaw.stats;
        player.rarity = playerMonRaw.rarity;

        const enemyPool = TIERS.find(tier => tier.name === player.rarity);
        if (!enemyPool || !enemyPool.pokemon.length) {
          throw new Error('No enemy pool available');
        }

        const randomEnemy = enemyPool.pokemon[Math.floor(Math.random() * enemyPool.pokemon.length)];
        const enemy = await fetchBattleMon(randomEnemy);

        if (!player || !enemy) {
          throw new Error('Failed to load battle monsters');
        }

        setBattleState({
          playerMon: player,
          enemyMon: enemy,
          playerHP: player.stats.hp,
          enemyHP: enemy.stats.hp,
          maxPlayerHP: player.stats.hp,
          maxEnemyHP: enemy.stats.hp,
          isOver: false,
          winner: null,
          isLoading: false
        });
      } catch (error) {
        console.error('Failed to load battle data:', error);
        router.push('/');
      }
    };

    if (!battleState.isOver) {
      loadBattleData();
    }
  }, [battleState.isOver, param.name, router]);

  function calculateDamage(move: Move, attacker: BattleMonType, defender: BattleMonType): number {
    // gen v damage calcaulation formula di included iv ev at set na yung level 50 for simplicity
    const crit = Math.random() < 0.0625 ? 1.5 : 1;
    const power = move.power;
    const random = (Math.floor(Math.random() * 16) + 85) / 100;
    const atk = move.class === 'physical' ? attacker.stats.attack : attacker.stats['special-attack'];
    const def = move.class === 'physical' ? defender.stats.defense : defender.stats['special-defense'];
    const stab = attacker.types.includes(move.type) ? 1.5 : 1;
    let typeMult = 1;
    
    const relation = typeRelations.find(t => t.name === move.type);
    defender.types.forEach(type => {
      if (!relation) return;
      typeMult *= relation.damage_relations.double_damage_to.includes(type) ? 2 : 1;
      typeMult *= relation.damage_relations.half_damage_to.includes(type) ? 0.5 : 1;
      typeMult *= relation.damage_relations.no_damage_to.includes(type) ? 0 : 1;
    });

    const damage = (((((2 * 50) / 5) + 2) * power * (atk / def) / 50) + 2) * crit * random * stab * typeMult;
    return Math.floor(damage);
  }

  function getRandomEnemyMove(enemyMon: BattleMonType): Move {
    return enemyMon.moves[Math.floor(Math.random() * enemyMon.moves.length)];
  }

  async function executeTurnSequence(playerFirst: boolean, playerDamage: number, enemyDamage: number) {
    setIsProcessingTurn(true);

    await new Promise(resolve => setTimeout(resolve, 100));

    setBattleState(prev => {
      let newPlayerHP = prev.playerHP;
      let newEnemyHP = prev.enemyHP;
      let winner: BattleMonType | null = null;
      let isOver = false;

      if (playerFirst) {
        newEnemyHP = Math.max(prev.enemyHP - playerDamage, 0);
        if (newEnemyHP <= 0) {
          winner = prev.playerMon;
          isOver = true;
        } else {
          newPlayerHP = Math.max(prev.playerHP - enemyDamage, 0);
          if (newPlayerHP <= 0) {
            winner = prev.enemyMon;
            isOver = true;
          }
        }
      } else {
        newPlayerHP = Math.max(prev.playerHP - enemyDamage, 0);
        if (newPlayerHP <= 0) {
          winner = prev.enemyMon;
          isOver = true;
        } else {
          newEnemyHP = Math.max(prev.enemyHP - playerDamage, 0);
          if (newEnemyHP <= 0) {
            winner = prev.playerMon;
            isOver = true;
          }
        }
      }

      return {
        ...prev,
        playerHP: newPlayerHP,
        enemyHP: newEnemyHP,
        winner,
        isOver
      };
    });

    setIsProcessingTurn(false);
  }

  async function handleBattle(move: Move) {
    if (!battleState.playerMon || !battleState.enemyMon || battleState.isOver || isProcessingTurn) return;

    const playerDamage = calculateDamage(move, battleState.playerMon, battleState.enemyMon);
    const enemyMove = getRandomEnemyMove(battleState.enemyMon);
    const enemyDamage = calculateDamage(enemyMove, battleState.enemyMon, battleState.playerMon);

    const playerFirst = battleState.playerMon.stats.speed > battleState.enemyMon.stats.speed;
    await executeTurnSequence(playerFirst, playerDamage, enemyDamage);
  }

  const mappedMoves = battleState.playerMon?.moves.map((move, index) => (
    <ButtonBase
      key={index}
      onClick={() => handleBattle(move)}
      disabled={battleState.isOver || isProcessingTurn || !battleState.playerMon || !battleState.enemyMon}
    >
      <Paper
        elevation={10}
        className='min-w-30 flex flex-col p-2'
      >
        <Typography className='capitalize'>
          {move.name}
        </Typography>
        <Box className="flex justify-between info">
          <Typography variant='caption' color='textSecondary' className='capitalize'>
            {move.type}
          </Typography>
          <Typography variant='caption' color='textSecondary'>
            {move.power}
          </Typography>
        </Box>
      </Paper>
    </ButtonBase>
  ));

  if (battleState.isLoading) {
    return (
      <Container className='relative flex flex-col gap-4 h-screen justify-center items-center' disableGutters>
        <CircularProgress />
        <Typography>Loading battle...</Typography>
      </Container>
    );
  }

  return (
    <Container className='relative flex flex-col gap-4 h-screen justify-center items-center' disableGutters>
      <Backdrop open={battleState.isOver} className='gap-4 flex flex-col'>
        <Typography variant='h2' fontWeight={700}>
          {battleState.winner?.name === battleState.playerMon?.name ? 'You Win' : 'You Lost'}
        </Typography>
        <Button
          variant='contained'
          color={battleState.winner?.name === battleState.playerMon?.name ? 'success' : 'error'}
          onClick={() => {
            setBattleState(prev => ({
              ...prev,
              isOver: false,
              winner: null
            }));
          }}
        >
          Battle Again
        </Button>
      </Backdrop>

      <Backdrop open={isProcessingTurn} className='gap-4 flex flex-col'>
        <CircularProgress />
        <Typography>Processing turn...</Typography>
      </Backdrop>

      <Paper className='max-w-lg flex flex-col aspect-1/1 w-[90%]' elevation={3}>
        <Box className="grid grid-cols-2 h-[50%] top">
          {battleState.enemyMon && (
            <>
              <Box className="p-4 flex justify-center items-center col-span-1 info">
                <Paper elevation={10} className='self-start flex flex-col p-2 w-full'>
                  <Box className='flex justify-between'>
                    <Typography className='uppercase'>
                      {battleState.enemyMon.name}
                    </Typography>
                    <Typography>Lv50</Typography>
                  </Box>
                  <Box className='flex items-center gap-2'>
                    <Typography>HP:</Typography>
                    <Box className='rounded-xl w-full h-4'>
                      <Box
                        className='rounded-xl bg-green-500 h-4'
                        component={motion.div}
                        animate={{
                          width: `${Math.floor((battleState.enemyHP / battleState.maxEnemyHP) * 100)}%`
                        }}
                      />
                    </Box>
                  </Box>
                  <Box className='self-end'>
                    {battleState.enemyHP}/{battleState.maxEnemyHP}
                  </Box>
                </Paper>
              </Box>
              <Box className='justify-center items-center flex col-span-1'>
                <img 
                  className='w-[60%] h-fit object-cover'
                  src={battleState.enemyMon.sprites.front}
                  alt={battleState.enemyMon.name}
                  style={{imageRendering: 'pixelated'}}
                />
              </Box>
            </>
          )}
        </Box>
        <Box className="grid grid-cols-2 h-[50%] bottom">
          {battleState.playerMon && (
            <>
              <Box className='justify-center items-center flex col-span-1'>
                <img 
                  className='w-[60%] h-fit object-cover'
                  src={battleState.playerMon.sprites.back}
                  alt={battleState.playerMon.name}
                  style={{imageRendering: 'pixelated'}}
                />
              </Box>
              <Box className="p-4 flex justify-center items-center col-span-1 info">
                <Paper elevation={10} className='self-end flex flex-col p-2 w-full'>
                  <Box className='flex justify-between'>
                    <Typography className='uppercase'>
                      {battleState.playerMon.name}
                    </Typography>
                    <Typography>Lv50</Typography>
                  </Box>
                  <Box className='flex items-center gap-2'>
                    <Typography>HP:</Typography>
                    <Box className='rounded-xl w-full h-4'>
                      <Box
                        className='bg-green-500 rounded-xl h-4'
                        component={motion.div}
                        animate={{
                          width: `${Math.floor((battleState.playerHP / battleState.maxPlayerHP) * 100)}%`
                        }}
                      />
                    </Box>
                  </Box>
                  <Box className='self-end'>
                    {battleState.playerHP}/{battleState.maxPlayerHP}
                  </Box>
                </Paper>
              </Box>
            </>
          )}
        </Box>
      </Paper>
      <Paper className="max-w-xl p-4 gap-2 w-fit flex justify-between" elevation={3}>
        {mappedMoves}
      </Paper>
    </Container>
  );
}
