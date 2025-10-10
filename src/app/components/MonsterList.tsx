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
} from 'react';
import MonsterCard from './MonsterCard';

interface MonsterListProps{
  monsters: PokemonType[]
}

export default function MonsterList({
  monsters,
}:MonsterListProps){

  const mappedMons = monsters.map((monster) => {
    return(
        <MonsterCard key={monster.uid}
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
        className='grow w-full flex flex-col p-4 gap-2'
        sx={{
          overflowY: 'auto',
          maxHeight: '350px',
        }}
        >
          <Autocomplete 
          loading
          disablePortal
          options={monsters}
          getOptionLabel={(option) => option.name}
          renderOption={(props, option) => {
            const { key, ...rest } = props;
            return(
              <li 
              key={key}
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
          />
          {
            monsters.length > 0 ? 
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
