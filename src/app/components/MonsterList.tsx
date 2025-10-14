"use client";

import{
  Paper,
  Box,
  Typography,
  Autocomplete,
  TextField,
} from '@mui/material';
import{
  PokemonType,
} from '@/utils';
import{
  useState,
  useEffect,
} from 'react';
import MonsterCard from './MonsterCard';
import MonsterModal from './MonsterModal';

interface MonsterListProps{
  monsters: PokemonType[];
  onUpdate: (updated: PokemonType) => void;
  onDelete: (uid: string) => void;
  onSell: (uid: string) => void;
  addMonster: (monster: PokemonType) => void;
  creditTokens: (amt: number, note: string) => void;
}

export default function MonsterList({
  monsters,
  onUpdate,
  onDelete,
  onSell,
  addMonster,
  creditTokens
}:MonsterListProps){
  const [filtered, setFiltered] = useState<PokemonType[]>(monsters);
  const [selected, setSelected] = useState<PokemonType | null>(null);
  useEffect(() => setFiltered(monsters), [monsters]);

  function handleSearchChange(event: React.SyntheticEvent, newValue: PokemonType | null){
    if(newValue){
      setFiltered([newValue]);
    }else{
      setFiltered(monsters);
    }
  }

  const mappedMons = filtered.map((monster) => {
    return(
        <MonsterCard 
        id={monster.uid}
        key={monster.uid}
        monster={monster}
        onClick={monster => setSelected(monster)}
        />
    );
  });


  return(
      <Paper
      className='mb-4 rounded-md'
      elevation={3}
      >
        <Box 
        className="p-2 header text-sm/tight"
        >
          <Typography
          variant='h6'
          fontWeight={600}
          >
            Your Monsters
          </Typography>
          <Typography
          variant='caption'
          color='textSecondary'
          >
            Click card to view monster details.
          </Typography>
        </Box>
        <Box
        className="px-2"
        >
          <Autocomplete 
          className='md:hidden sticky top-0'
          loading
          disablePortal
          options={monsters}
          getOptionLabel={(option) => option.name}
          renderOption={(props, option) => {
            const { key, ...rest } = props;
            return(
              <li 
              key={option.uid}
              {...rest}
              className='p-2 capitalize'
              >
                {option.name}
              </li>
            );
          }}
          renderInput={
            (params) => {
              return (
                <TextField {...params} label='Monsters' />
              );
            }
          }
          onChange={handleSearchChange}
          />
        </Box>
        <Box
        className='md:grid lg:grid-cols-5 md:grid-cols-3 grow w-full flex flex-col px-4 py-2 gap-2'
        sx={{
          overflowY: 'auto',
          maxHeight: {
            xs: '65vh',
            sm: '85vh',
            md: '100vh',
          },
        }}
        >
          {
            filtered.length > 0 ? 
              mappedMons
            :
              (
                <Typography
                className='self-center'
                >
                  No monsters found.
                </Typography>
              )
          }
        </Box>
        {
          selected && (
            <MonsterModal 
            monster={selected}
            open={selected !== null}
            onClose={() => setSelected(null)}
            onSave={(updated) => {
              onUpdate(updated);
              setSelected(null);
            }}
            onDelete={(uid) => {
              if(onDelete) onDelete(uid);
              setSelected(null);
            }}
            onSell={(uid) => {
              if(onSell) onSell(uid);
              setSelected(null);
            }}
            addMonster={(monster) => addMonster(monster)}
            creditTokens={(amt, note) => {
              if(creditTokens) creditTokens(amt, note);
            }}
            />
          )
        }
      </Paper>
  );
}

