
// import React from 'react';
import { styled, IconButton } from '@mui/material';

export const RotateButton = styled(IconButton)(({ deg = 0 }) => ({
  transition: 'transform 0.125s linear', 
  transform: `rotate(${deg}deg)`
}));

export default RotateButton;
