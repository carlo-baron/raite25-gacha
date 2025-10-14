import { 
  motion,
} from 'motion/react';
import{
  Box,
  Paper,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { PokemonType, rarityBadges } from '@/utils';
import {
  useState
} from 'react';

export default function MonsterCard({id, monster, onClick}: {id: string; monster: PokemonType; onClick: (monster: PokemonType) => void}){
  const [hovered, setHovered] = useState<boolean>(false);

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

  const rarityColor = rarityBadges.find(rarity => rarity.text == monster.rarity);

  return(
    <Paper
    id={id}
    component={motion.div}
    onHoverStart={() => setHovered(true)}
    onHoverEnd={() => setHovered(false)}
    whileHover={{
      y: -5
    }}
    onClick={() => onClick(monster)}
    sx={{
      overflow: 'visible',
      position: 'relative'
    }}
    >
      <Card
      sx={{
        overflow: 'visible',
        position: 'relative'
      }}
      >
        <CardActionArea>
          <CardContent
          className='justify-center items-center flex flex-col'
          sx={{
            overflow: 'visible',
            position: 'relative'
          }}
          >
            <motion.img 
            className='self-center w-[60%] h-fit object-cover'
            src={monster.sprite}
            alt={monster.name} 
            animate={
              hovered ? {scale: 1.2, y: -5} : {}
            }
            />
            <Chip 
            component={motion.div}
            animate={
              hovered ? {scale: 1.2} : {}
            }
            className='absolute left-4 top-4 capitalize'
            label={monster.rarity}
            size='small'
            sx={{
              fontSize: '12px',
              fontWeight: 800,
              background: rarityColor?.color == '#fff' 
                ? '' 
                : alpha(rarityColor!.color!, 0.7),
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
