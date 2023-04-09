import React from 'react';
import { Popover, TextField, Box } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { useMenu } from '../machines';

const IconTextField = ({ endIcon, startIcon, googlish, ...props }) => { 
  
  const menu = useMenu(console.log);

  const startAdornment = !!startIcon ? (
    <InputAdornment position="start">{startIcon}</InputAdornment>
  ) : null;

  const endAdornment = !!endIcon ? (
    <InputAdornment sx={{ cursor: 'pointer' }} position="end">
      {endIcon}
    </InputAdornment>
  ) : null;

  const inputProps = {
    ...props.InputProps,  
    style: { backgroundColor: "white" }, 
    startAdornment, 
    endAdornment,
    disableUnderline: true
  } 

  const sx = googlish ? {
    '& .MuiInputBase-root': {
      color: '#333',
      borderRadius: '24px',
      backgroundColor: '#f1f1f1',
      padding: '0.25rem 1rem',
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: '#fff',
        boxShadow: '0 1px 6px rgba(32,33,36,0.28)',
        borderColor: '#e8e8e8',
      },
      '& .MuiInputBase-input': {
        // fontSize: '16px',
        fontWeight: 'normal',
        lineHeight: '1.2',
        letterSpacing: 'normal',
        '&::placeholder': {
          color: '#999',
          opacity: '1',
        },
        '&:focus': {
          outline: 'none',
        },
      },
    },
  } : {}

  return (
   <>
    <TextField
      size="small"
      autoComplete="off"
      {...props}
      InputProps={inputProps}
      sx={{
        ...sx,
        ...props.sx
      }}
    
    />
    <Popover 
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    
      anchorEl={menu.anchorEl}
      open={Boolean(menu.anchorEl)} 
      >
      <Box sx={{m: 2, minWidth: 400}}>
      some stuff goes in here
      </Box>
    </Popover>
   </>
  );
};

export default IconTextField;
