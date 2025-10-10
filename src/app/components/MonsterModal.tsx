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
  Grid,
} from '@mui/material';
import{
  PokemonType,
} from '@/utils';

interface MonsterModalProps{
  open: boolean;
  onClose: () => void;
  monster: PokemonType;
}

export default function MonsterModal({
  open,
  onClose,
  monster,
}: MonsterModalProps){

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
        width: `${(value/255) * 100}%`
      }}
      transition={{duration: 1, ease: 'easeOut'}}
      />
    </Paper>
    <Typography
    className='self-center'
    >
      {value}
    </Typography>
  </Box>
));

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
      <MonsterInfoGrid 
      monster={monster}
      />
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

function MonsterInfoGrid({
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
          className='text-center'
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
