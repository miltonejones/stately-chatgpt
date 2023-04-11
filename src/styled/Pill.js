
// import React from 'react';
import { styled, Box } from '@mui/material';

 
/**

Pill component with customizable background color and text color
@param {Object} props - Component props
@param {boolean} props.active - Determines whether the pill is active or not
@param {string} [props.color] - Text color of the pill
@param {string} [props.bgColor] - Background color of the pill when inactive
@param {string} [props.activeBgColor] - Background color of the pill when active
@param {string} [props.borderRadius] - Border radius of the pill
@param {string} [props.padding] - Padding of the pill
@param {string} [props.width] - Width of the pill
@param {string} [props.height] - Height of the pill
@param {Object} [props.sx] - Custom styles to apply to the root element
@param {string} [props.className] - Custom class name to apply to the root element
@param {ReactNode} [props.children] - Content of the pill
@param {Object} [props.other] - Any other valid props to be passed to the Box component from Material-UI
@returns {JSX.Element} - Pill component
*/
const Pill = styled(Box)(({ theme, active }) => ({
  backgroundColor: active ? theme.palette.primary.main : theme.palette.grey[200], 
  padding: theme.spacing(0.25, 1),
  borderRadius: theme.spacing(.5),
  display: 'flex',
  color: active ? "white" : theme.palette.text.secondary
}))

export default Pill;
