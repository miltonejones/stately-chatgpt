
import React from 'react';
import { styled, Avatar } from '@mui/material';

/** 
A styled Avatar component for displaying photos.
@param {Object} props - The props object for the Avatar component.
@param {ReactNode} props.children - The content of the Avatar.
@returns {JSX.Element} - The Photo component.
*/
const Photo = styled(({ children, ...props }) => (
  <Avatar {...props}>{children}</Avatar>
))(({ theme }) => ({
  cursor: 'pointer',
  '&:hover': {
    outline: 'solid 2px ' + theme.palette.primary.main,
    outlineOffset: 2,
  },
}));

export default Photo;
