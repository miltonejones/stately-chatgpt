import React from 'react';
import { Popover, TextField, Box } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { useMenu } from '../machines';


/**
IconTextField is a custom text field component with support for start and end icons,
and the ability to display a popover menu when clicked.
@param {object} props - Component props
@param {ReactNode} props.startIcon - Icon component to display at the start of the input
@param {ReactNode} props.endIcon - Icon component to display at the end of the input
@param {boolean} props.googlish - Whether to style the input like a Google search bar (default: false)
@param {object} props.InputProps - Props to pass to the input element
@param {string} props.label - Input label
@param {string} props.placeholder - Input placeholder
@param {string} props.value - Input value
@param {function} props.onChange - Function to handle input change events
@param {object} props.sx - Additional styles to apply to the component
@returns {JSX.Element} - The IconTextField component
*/
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
