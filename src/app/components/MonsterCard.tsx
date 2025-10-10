import { 
  motion,
} from 'motion/react';
import{
  Box,
  Paper,
  Typography,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Chip,
} from '@mui/material';
import { PokemonType } from '@/utils';

export default function MonsterCard({monster}: {monster: PokemonType}){
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
    >
      <Card
      component={motion.div}
      whileHover={{
        y: -5
      }}
      >
        <CardActionArea>
          <CardContent
          className='justify-center items-center flex flex-col'
          >
            <CardMedia
            component='img'
            image={monster.sprite}
            alt={monster.name}
            className='relative self-center'
            sx={{
              width: '60%',
              height: 'fit-content',
              objectFit: 'cover',
            }}
            />
            <Chip 
            className='absolute left-4 top-4 capitalize'
            label={monster.rarity}
            size='small'
            sx={{
              fontSize: '10px',
              fontWeight: 800,
            }}
            />
          </CardContent>
          <CardContent
          >
            <Box
            className='flex justify-between'
            >
              <Typography
              variant='h5'
              fontWeight={700}
              >
                {monster.name.toUpperCase()}
              </Typography>
              <Typography
              variant='h6'
              fontWeight={500}
              >
                Ξ{monster.cryptoWorth}
              </Typography>
            </Box>
            <Box
            className='flex gap-2'
            >
              {
                mappedTypes
              }
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    </Paper>
  );
}
