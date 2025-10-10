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

interface MonsterListProps{
  monsters: PokemonType[]
}

export default function MonsterList({
  monsters,
}:MonsterListProps){
  const [filtered, setFiltered] = useState<PokemonType[]>(monsters);
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
        <MonsterCard id={monster.uid} key={monster.uid}
        monster={monster}
        />
    );
  });


  return(
      <Paper
      className='mb-4 rounded-md'
      elevation={3}
      >
        <Box className="p-2 header text-sm/tight">
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
          className='sticky top-0'
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
        className='grow w-full flex flex-col px-4 py-2 gap-2'
        sx={{
          overflowY: 'auto',
          maxHeight: '350px',
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
      </Paper>
  );
}
