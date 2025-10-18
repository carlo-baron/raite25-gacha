"use client";

import{
  useRouter
} from 'next/navigation';
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
  IconButton,
} from '@mui/material';
import{
  PokemonType,
  maxBaseStats,
  fetchPokemonData,
  TIER_POOLS,
} from '@/utils';
import ShuffleStatGame from './ShuffleStatGame';
import ElementalTossGame from './ElementalTossGame';
import {
  useState,
} from 'react';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

const NATO = ["Alpha","Bravo","Charlie","Delta","Echo","Foxtrot","Golf","Hotel","India","Juliett","Kilo","Lima","Mike","November","Oscar","Papa","Quebec","Romeo","Sierra","Tango","Uniform","Victor","Whiskey","Xray","Yankee","Zulu"];

function applyResultToLocal(local: PokemonType, result: ShuffleResult | TossResult) {
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

interface MonsterModalProps{
  open: boolean;
  onClose: () => void;
  monster: PokemonType;
  onDelete: (uid: string) => void;
  onSave: (monster: PokemonType) => void;
  onSell: (uid: string) => void;
  addMonster: (monster: PokemonType) => void;
  creditTokens: (amt: number, note: string) => void;
}

export default function MonsterModal({
  open,
  onClose,
  monster,
  onDelete,
  onSave,
  onSell,
  addMonster,
  creditTokens
}: MonsterModalProps){
  const [local, setLocal] = useState<PokemonType>({...monster});
  const [offered, setOffered] = useState<PokemonType | null>(null);
  const [sell, setSell] = useState<boolean>(false);

  function handleMiniGameResult(result: ShuffleResult | TossResult) {
    const updated = applyResultToLocal(local, result);
    setLocal(updated);
  }

  function saveChanges() {
    onSave(local);
    onClose();
  }

  function handleSell() {
    if (onSell) {
      onSell(local.uid);
    } else {
      if (onDelete) onDelete(local.uid);
      if (creditTokens) creditTokens(Math.round(local.cryptoWorth), `Sold ${local.name}`);
    }
    onClose();
  }

  async function generateTradeOfferPopup() {
    const pool = TIER_POOLS[local.rarity] || [];
    const options = pool.filter((s) => s.toLowerCase() !== local.name.toLowerCase());
    const candidates = options.length > 0 ? options : pool.slice();
    const pick = candidates[Math.floor(Math.random() * candidates.length)];

    try {
      const poke = await fetchPokemonData(pick);

      const phon = NATO[Math.floor(Math.random() * NATO.length)];
      const idnum = Math.floor(Math.random() * 9000) + 100;
      const traderName = `${phon}-${idnum}`;

      const offered = {
        ...poke,
        traderName
      };

      setOffered(offered);
    } catch (err) {
      console.error("Failed to generate trade offer", err);
      window.alert("Failed to generate trade offer. Try again.");
    } 
  }

  function handleTradeAccept(){
    if(!offered) return; 
    onDelete(local.uid);
    addMonster(offered);
    setOffered(null);
    onClose();
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
        onClick={generateTradeOfferPopup}
        >
          Trade
        </Button>
        <Button
        variant='contained'
        color='secondary'
        className='grow w-4 h-4'
        onClick={() => setSell(true)}
        >
          Sell
        </Button>
      </Box>
    </DialogTitle>
    <DialogContent
    className='overflow-y-scroll gap-2 flex flex-col'
    >
      <Dialog
      open={sell}
      onClose={()=>setSell(false)}
      >
        <DialogTitle>
          Sell {local.name} for {local.cryptoWorth}
        </DialogTitle>
        <DialogActions>
          <Button
          variant='contained'
          color='secondary'
          onClick={() => setSell(false)}
          >
          No
          </Button>
          <Button
          variant='contained'
          color='primary'
          onClick={handleSell}
          >
          Yes
          </Button>
        </DialogActions>
      </Dialog>
      {
        offered && (
          <Dialog
          open={offered !== null}
          slotProps={{
            paper: {
              className:'h-[80%] w-[80%]' 
            }
          }}
          onClose={() => setOffered(null)}
          >
            <DialogTitle
            className='flex flex-col items-center justify-center'
            >
              <Typography
              fontWeight={600}
              >
                Trade Offer
              </Typography>
              <Typography
              variant='caption'
              color='textSecondary'
              >
                From: {offered.traderName}
              </Typography>
            </DialogTitle>
            <DialogContent
            className='p-4'
            >
              {
                <Paper
                elevation={5}
                className='flex flex-col gap-2 p-4'
                >
                  <Box
                  className='flex flex-col justify-center items-center'
                  >
                    <img 
                    src={offered.sprite}
                    alt={offered.name}
                    className='object-cover w-[60%]'
                    />
                    <Box>
                      <Typography
                      variant='body1'
                      fontWeight={600}
                      >
                        {offered.name.toUpperCase()}
                      </Typography>
                      <Typography
                      variant='caption'
                      color='textSecondary'
                      >
                        {offered.rarity} • Ξ{offered.cryptoWorth}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                  className='flex flex-col'
                  >
                    <Box className="justify-between w-full flex">
                      <Box
                      className='flex gap-2'
                      >
                        {
                          (
                             offered.types.map((type, index) => {
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
                            })
                          )
                        }
                      </Box>
                      <Typography>
                        ID: {offered.speciesId}
                      </Typography>
                    </Box>
                    <Typography>
                      Offered monster: {local.name.toUpperCase()}
                    </Typography>
                    <Box
                    className='flex gap-2 justify-end'
                    >
                      <Button
                      variant='contained'
                      color='secondary'
                      onClick={() => setOffered(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                      variant='contained'
                      color='primary'
                      onClick={handleTradeAccept}
                      >
                        Accept 
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              }
            </DialogContent>
          </Dialog>
        )
      }

      <MonsterInfoCard 
      monster={monster}
      />
      <MonsterStatCard 
      monster={monster}
      />
      <Paper 
      elevation={3}
      className="flex flex-col gap-4 p-2"
      >
        <Typography variant="h6">Care Interactions</Typography>
        <ShuffleStatGame
        monster={monster}
        onResult={handleMiniGameResult}
        />
        <ElementalTossGame 
        monster={monster}
        onResult={handleMiniGameResult}
      />
      </Paper>
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
      onClick={saveChanges}
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
        initial={{ width: 0 }}
        animate={
          { width: `${(value / maxBaseStats[name]) * 100}%` }
        }
        transition={{ duration: 1, ease: 'easeOut' }}
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
  const [crying, setCrying] = useState<boolean>(false);

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
  const router = useRouter();

  return(
    <Paper
    elevation={3}
    className='p-2 grid grid-cols-2 gap-2'
    >
      <Paper
      elevation={5}
      className='relative'
      >
        <IconButton
        size='large'
        sx={{position: 'absolute', right: 4, top: 4, zIndex: 10}}
        onClick={() => {
          if(crying) return;
          setCrying(true);
          const cry = monster.cry; 
          const audio = new Audio(cry);
          audio.volume = 0.5;
          audio.play();
          audio.onended = () =>setCrying(false);
        }}
        >
          <VolumeUpIcon />
        </IconButton>
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
      <Button
      variant='contained'
      className='col-span-2'
      onClick={() => router.push(`/catch/${monster.name}`)}
      >
        Feed
      </Button>
      <Button
      variant='contained'
      className='col-span-2'
      onClick={() => router.push(`/battle/${monster.uid}`)}
      >
        Battle
      </Button>
    </Paper>
  );
}
