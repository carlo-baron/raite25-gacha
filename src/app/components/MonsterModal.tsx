"use client";

import {
  motion
} from 'motion/react';
import{
  Paper,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
} from '@mui/material';
import{
  PokemonType,
  maxBaseStats,
} from '@/utils';
import ShuffleStatGame from './ShuffleStatGame';
import {
  useState,
} from 'react';

interface MonsterModalProps{
  open: boolean;
  onClose: () => void;
  monster: PokemonType;
}

const TIER_POOLS = {
  "Common": [
    "pikachu","pidgeot","gengar","alakazam",
    // Gen4 (20)
    "turtwig","grotle","torterra","chimchar","monferno","infernape","piplup","prinplup","empoleon","starly",
    "staravia","staraptor","bidoof","bibarel","kricketot","kricketune","shinx","luxio","luxray","budew",
    // Gen6 (15)
    "chespin","quilladin","chesnaught","fennekin","braixen","delphox","froakie","frogadier","greninja","fletchling",
    "fletchinder","talonflame","scatterbug","spewpa","vivillon",
    // Gen3 (10)
    "treecko","grovyle","sceptile","torchic","combusken","blaziken","mudkip","marshtomp","swampert","breloom"
  ],
  "Uncommon": ["lapras","ninetales","goodra","kommo-o"],
  "Rare": [
    "zapdos","dragonite",
    "raikou","entei","suicune","lugia","ho-oh","celebi",
    "regirock","regice","registeel","latias","latios","kyogre","groudon","rayquaza","jirachi","deoxys"
  ],
  "Ultra-Rare": [
    "dialga","palkia","giratina","uxie","mesprit","azelf","heatran","regigigas","cresselia","phione","manaphy","darkrai","shaymin","arceus",
    "victini","cobalion","terrakion","virizion","tornadus","thundurus","landorus","reshiram","zekrom","kyurem","keldeo","meloetta","genesect"
  ],
  "EX": ["mew"]
};

const NATO = ["Alpha","Bravo","Charlie","Delta","Echo","Foxtrot","Golf","Hotel","India","Juliett","Kilo","Lima","Mike","November","Oscar","Papa","Quebec","Romeo","Sierra","Tango","Uniform","Victor","Whiskey","Xray","Yankee","Zulu"];

function applyResultToLocal(local: PokemonType, result: ShuffleResult) {
  const now = Date.now();
  const newStats = { ...local.stats };
  const delta = result.delta || 0;
  if (result.statKey) {
    if (typeof newStats[result.statKey] === "undefined") newStats[result.statKey] = 0;
    newStats[result.statKey] = Math.max(0, newStats[result.statKey] + delta);
  }

  const newWorth = Math.max(0, Math.round((local.cryptoWorth || 0) + (result.deltaWorth || 0)));

  const newHistory = [
    ...local.history,
    { ts: now, event: `${result.source}: ${result.message}`, deltaWorth: result.deltaWorth || 0 },
  ];

  return { ...local, stats: newStats, cryptoWorth: newWorth, history: newHistory };
}

interface ShuffleResult {
  statKey: string;
  delta: number;
  deltaWorth: number;
  success: boolean;
  message: string;
  source: string;
}

export default function MonsterModal({
  open,
  onClose,
  monster,
}: MonsterModalProps){
  const [local, setLocal] = useState<PokemonType>({...monster});
  const [lastActionMsg, setLastActionMsg] = useState<string | null>(null);

  function handleMiniGameResult(result: ShuffleResult) {
    const updated = applyResultToLocal(local, result);
    setLocal(updated);
    setLastActionMsg(result.message);
  }

  return(
    <Dialog
    open={open}
    onClose={onClose}
    slotProps={{
      paper: {
        className:'h-full w-full' 
      }
    }}
    >
    <DialogTitle
    className='p-0j flex justify-between'
    >
      <Box
      className='text-sm/tight info'
      >
        <Typography
        variant='h6'
        fontWeight={600}
        >
          {monster.name.toUpperCase()}
        </Typography>
        <Typography
        variant='caption'
        color='textSecondary'
        >
          {monster.rarity} • #{monster.speciesId}
        </Typography>
      </Box>
      <Box
      className='gap-1 flex flex-col action'
      >
        <Button
        variant='contained'
        className='grow w-4 h-4'
        >
          Trade
        </Button>
        <Button
        variant='contained'
        color='secondary'
        className='grow w-4 h-4'
        >
          Sell
        </Button>
      </Box>
    </DialogTitle>
    <DialogContent
    className='overflow-y-scroll gap-2 flex flex-col'
    >
      <MonsterInfoCard 
      monster={monster}
      />
      <MonsterStatCard 
      monster={monster}
      />
      <ShuffleStatGame
      monster={monster}
      onResult={handleMiniGameResult}
      />
    </DialogContent>
    <DialogActions>
      <Button
      size='small'
      onClick={onClose}
      >
      Cancel
      </Button>
      <Button
      size='small'
      >
      Save Changes
      </Button>
    </DialogActions>
    </Dialog>
  );
}

function MonsterStatCard({monster}:{monster: PokemonType}){
  const mappedStats = Object.entries(monster.stats).map(([name, value]) => (
    <Box 
    key={name}
    className="flex h-4 gap-2"
    >
      <Typography
      className='min-w-[120px] capitalize self-center'
      >
        {name}
      </Typography>
      <Paper 
      className="grow"
      sx={{ borderRadius: '99999px' }}
      >
        <Box
        component={motion.div}
        className='rounded-full bg-green-500 h-full'
        initial={{width: 0}}
        whileInView={{
          width: `${(value/maxBaseStats[name]) * 100}%`
        }}
        transition={{duration: 1, ease: 'easeOut'}}
        />
      </Paper>
      <Typography
      className='min-w-[30px] text-center self-center'
      >
        {value}
      </Typography>
    </Box>
  ));

  return(
    <Paper
    elevation={3}
    className='flex flex-col gap-4 p-2'
    >
      <Typography
      variant='h6'
      fontWeight={400}
      >
        Stats
      </Typography>
      <Box
      className='flex flex-col gap-4'
      >
        {mappedStats}
        <Typography
        className='text-end'
        >
        Total: {
          Object.values(monster.stats).reduce((sum, value) => sum + value, 0)
        }
        </Typography> 
      </Box>
    </Paper>
  );
}

function MonsterInfoCard({
  monster,
}: { monster: PokemonType; }){

  const mappedTypes = monster.types.map((type, index) => {
    return (
      <Chip 
      key={index}
      className='capitalize'
      label={type}
      size='small'
      sx={{
        fontSize: '10px',
        fontWeight: 700,
      }}
      />
    );
  });

  return(
    <Paper
    elevation={3}
    className='p-2 grid grid-cols-2 gap-2'
    >
      <Paper
      elevation={5}
      >
        <motion.img 
        src={monster.sprite}
        alt={monster.name}
        whileHover={{
          scale: 1.2
        }}
        />
      </Paper>
      <Box
      className='flex flex-col justify-between gap-2'
      >
        <Paper
        elevation={10}
        className='p-2 grow flex flex-col '
        >
          <Typography
          variant='body1'
          >
            Worth: 
          </Typography>
          <Typography
          className='h-full flex  items-center justify-center'
          variant='h5'
          fontWeight={600}
          >
            Ξ{monster.cryptoWorth} 
          </Typography>
        </Paper>
        <Paper
        elevation={10}
        className='p-2'
        >
          <Box
          className='flex gap-1 justify-center'
          >
            {
              mappedTypes
            }
          </Box>
        </Paper>
      </Box>
    </Paper>
  );
}
