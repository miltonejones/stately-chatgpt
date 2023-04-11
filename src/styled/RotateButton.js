
// import React from 'react';
import { styled, IconButton } from '@mui/material';


/**
A styled icon button that can rotate by a given degree.
@component
@param {Object} props - The component props.
@param {number} [props.deg=0] - The degree to rotate the button.
@returns {JSX.Element} - The JSX element for the styled icon button.
*/
export const RotateButton = styled(IconButton)(({ deg = 0 }) => ({
  transition: 'transform 0.125s linear', 
  transform: `rotate(${deg}deg)`
}));

export default RotateButton;
