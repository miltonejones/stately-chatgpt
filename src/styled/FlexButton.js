
import React from 'react';
import { styled } from '@mui/material';
import Flex from './Flex';


/**
A styled component that renders a Flex component with additional styling.
@component
@param {Object} props - The props object.
@param {boolean} [props.active] - Determines if the component is active.
@param {number} [props.spacing=1] - The spacing between child elements.
@returns {JSX.Element} - A Flex component with additional styling.
@example
<FlexButton active spacing={2}>
<ChildComponent />
</FlexButton>
/ const FlexButton = styled((props) => <Flex {...props} spacing={1} />)( */
const FlexButton = styled((props) => <Flex {...props} spacing={1} />)(
  ({ theme, active }) => ({
    margin: theme.spacing(0.5, 0),
    padding: theme.spacing(1),
    borderRadius: '.25rem',
    backgroundColor: !active ? 'transparent' : theme.palette.grey[300],
    maxWidth: '19vw',
    [theme.breakpoints.down('md')]: {
      maxWidth: '75vw',
    },
    '&:hover': {
      backgroundColor: theme.palette.grey[300],
    },
  })
);

export default FlexButton;
