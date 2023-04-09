
import React from 'react';
import { styled, Avatar } from '@mui/material';

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
