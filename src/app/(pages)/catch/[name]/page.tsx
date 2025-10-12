"use client";

import { useParams, useRouter } from 'next/navigation';
import {
  useState,
  useEffect,
  useRef,
} from 'react';
import{
  Container,
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CloseIcon from '@mui/icons-material/Close';
import{
  motion
} from 'motion/react';
import {
  fetchPokemonData
} from '@/utils';

interface Berry{
  id: string;
  name: string;
  sprite: string;
}

interface GameObj{
  name: string;
  sprite: string;
}

export default function BerryCatcherGame(){
  const {name} = useParams();
  const [mon, setMon] = useState<GameObj | null>(null);
  const [berryData, setBerryData] = useState<GameObj[]>([]);
  const [fallingBerries, setFallingBerries] = useState<Berry[]>([]);
  const [score, setScore] = useState<number>(0);
  const [over, setOver] = useState<boolean>(false);
  const [loss, setLoss] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(10);
  const router = useRouter();

  const arenaRef = useRef<HTMLDivElement | null>(null);
  const userRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    async function initGame() {
      try {
        const pokemon = await fetchPokemonData(name);
        if (!pokemon) {
          router.push('/');
          return;
        }
        setMon({
          name: pokemon.name,
          sprite: pokemon.sprite
        });

        const res = await fetch('https://pokeapi.co/api/v2/berry/');
        const data = await res.json();

        const berryPromises = data.results.map(async (berry: { name: string; url: string }) => {
          const berryDetail = await fetch(berry.url);
          const berryData = await berryDetail.json();

          const itemDetail = await fetch(berryData.item.url);
          const itemData = await itemDetail.json();

          return {
            name: berry.name,
            sprite: itemData.sprites.default
          };
        });

        const berries = await Promise.all(berryPromises);
        setBerryData(berries);
      } catch (error) {
        console.error("Error initializing game:", error);
        router.push('/');
      }
    }

    initGame();
  }, [name]);

  useEffect(() => {
    if(berryData.length <= 0 || over) return;
    const interval = setInterval(() => {
      setFallingBerries(prev=>{
        const newBerryData = berryData[Math.floor(Math.random() * berryData.length)];
        const newBerry = {
          ...newBerryData,
          id: `${Date.now()}-${Math.random()}`
        }
        return [...prev, newBerry];
      });
      setSpeed(prev=>{
        return Math.min(Math.max(prev - 0.1, 1), 50);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [berryData, over]);

  useEffect(()=>{
    if(loss >= 3){
      setOver(true);
    }
  }, [loss]);

  const mappedBerries = fallingBerries.map(b => {
    return(
        <Berry 
        key={b.id}
        id={b.id}
        data={b}
        speed={speed}
        constraint={arenaRef}
        user={userRef}
        onOutOfBounds={(id) => {
          setFallingBerries(prev =>{
            return prev.filter(berry => berry.id !== id);
          });
          setLoss(prev=>prev+1);
        }}
        onCollide={(id) => {
          setFallingBerries(prev =>{
            return prev.filter(berry => berry.id !== id);
          });
          setScore(prev=>prev+1);
        }}
        />
    );
  });

  return(
    <Container
    className='relative flex flex-col items-center justify-center w-full h-screen'
    disableGutters
    >
      <IconButton
      size='large'
      sx={{
        position: 'absolute',
        top: 4,
        left: 4
      }}
      onClick={() => router.push('/')}
      >
        <ArrowBackIosNewIcon />
      </IconButton>
     <Paper
     elevation={5}
      className='relative flex flex-col max-w-xl min-w-xs w-[90%] h-[90%]'
     >
       <Box
       className='flex justify-between w-full border-b border-black-500 p-4'
       >
        <Box
        className='flex'
        >
          <CloseIcon color={loss >= 1 ? 'warning' : 'inherit'} />
          <CloseIcon color={loss >= 2 ? 'warning' : 'inherit'} />
          <CloseIcon color={loss >= 3 ? 'warning' : 'inherit'} />
        </Box>
        <Typography>
          Score: {score}
        </Typography>
       </Box>
       <Box
       className='grow relative arena overflow-hidden'
       ref={arenaRef}
       >
          {
            !over ?
              mappedBerries
            :
              (
                <Box
                className='flex flex-col absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                >
                  <Typography
                  variant='h3'
                  className='text-center'
                  >
                    Game Over
                  </Typography>
                  <Button
                  variant='contained'
                  className='self-center'
                  onClick={()=>{
                    setOver(false)
                    setFallingBerries([]);
                    setScore(0);
                    setLoss(0);
                  }}
                  >
                    Restart
                  </Button>
                </Box>
              )
          }
          <Box
          className='flex justify-center w-full absolute bottom-0 h-fit'
          >
            <motion.img 
            ref={userRef}
            className='w-[96px]'
            drag='x'
            dragMomentum={false}
            dragConstraints={arenaRef}
            src={mon?.sprite}
            alt={mon?.name} 
            />
          </Box>
       </Box>
     </Paper>
    </Container>
  );
}

interface BerryProps{
  data: Berry;
  constraint: React.RefObject<HTMLDivElement | null>;
  id: string;
  user: React.RefObject<HTMLImageElement | null>;
  speed?: number;
  onCollide: (id: string) => void;
  onOutOfBounds: (id: string) => void;
}

function Berry({data, speed=10, constraint, id, user, onCollide, onOutOfBounds}:BerryProps){
  const self = useRef<HTMLImageElement | null>(null);

  let animate = {y: 0};
  let initial = {x: 0, y: -30}
  if(constraint.current){
      const constRect = constraint.current.getBoundingClientRect();
      const targetY = constRect.bottom;
      animate={y: targetY}

      const BERRY_WIDTH = 32; //px

      const min = BERRY_WIDTH;
      const max = constRect.width - (BERRY_WIDTH / 2);
      const randomX = Math.random() * (max - min) + min;
      initial={x: randomX, y: -30 }
  }

  return(
    <motion.img
    ref={self}
    className="absolute w-[36px] h-fit"
    src={data?.sprite}
    alt={data?.name}
    initial={initial}
    animate={animate}
    transition={{duration: speed, ease: 'linear'}}
    onUpdate={()=>{
      if(!self.current || !constraint.current || !user.current) return;
      const selfRect = self.current.getBoundingClientRect();
      const constRect = constraint.current.getBoundingClientRect();
      const userRect = user.current.getBoundingClientRect();

      const overlap = isOverlapping(selfRect, userRect);

      const top = selfRect.top;
      if(top >= constRect.bottom) onOutOfBounds(id);
      if(overlap) onCollide(id);
    }}
    />
  );    
}

function isOverlapping(rect1: DOMRect, rect2: DOMRect) {
  return (
    rect1.left < rect2.right &&
    rect1.right > rect2.left &&
    rect1.top < rect2.bottom &&
    rect1.bottom > rect2.top
  );
}
