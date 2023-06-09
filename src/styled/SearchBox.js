
import React from 'react';
import { styled, Paper, Autocomplete } from '@mui/material'; 
import IconTextField from './IconTextField';
import Flex from './Flex';
import Nowrap from './Nowrap';
import TinyButton from './TinyButton';
import { makeStyles } from '@mui/styles'; 

const Dropdown = styled(Paper)(({ theme }) => ({
  borderRadius: '1rem',
}))

const useStyles = makeStyles((theme) => ({
  root: {
    '&.Mui-focused': {
      borderRadius: '24px 24px 0 0',
    },
    '& .MuiAutocomplete-inputRoot': {
      // padding: '0',
      width: '100%',
      backgroundColor: '#f1f3f4',
      borderRadius: '24px',
      display: 'flex',
      alignItems: 'center',
      boxShadow: 'none',
      '& input': {
        padding: '0.25rem 1rem',
        border: 'none',
        flex: '1',
        lineHeight: '1.2',
        marginLeft: '8px',
      },
      '&:hover': {
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
      },
      '&:focus': {
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px 0 rgba(0, 0, 255, 0.1)',
        borderRadius: '24px 24px 0 0',
      },
    },
    '& .MuiAutocomplete-endAdornment': {
      display: 'none',
    },
  },
}));
 

/**
SearchBox component for autocomplete search input
@param {Object} props - Component props
@param {string[]} props.options - Array of strings to populate autocomplete options
@param {string} props.label - Label for the search input
@param {string} props.value - Value of the search input
@param {string} props.name - Name of the search input
@param {function} props.onUserSelect - Function to handle user selection from the autocomplete options
@param {function} props.onChange - Function to handle changes to the search input value
@returns {JSX.Element} - Rendered component
*/
export default function SearchBox({ options = [], ...props}) {
  const classes = useStyles();
  const handleChange = value => {
    props.onChange({ target: {
      name: props.name,
      value
    }});    
  }
  const renderOption = (props, option) => <Flex {...props} spacing={1}>
    <TinyButton icon="AccessTime" />
    <Nowrap small muted>{option}</Nowrap>
  </Flex>

  return (
    <Autocomplete
      autoFocus
      freeSolo
      label={props.label}
      options={options}
      value={props.value}
      PaperComponent={(props) => (
        <Dropdown {...props} />
      )}
      PopperProps={{
        anchorEl: null,
        placement: 'bottom-start',
        style: { marginTop: '-10px' },
      }}

      onChange={(event, value) => {
        props.onUserSelect(value);
      }}
      onInputChange={(event, value) => {
        handleChange(value);
      }}

      sx={{ minWidth: 'calc(75vw - 200px)' }}
      renderInput={(params) => (
        <IconTextField

          {...params}
          {...props} 
          
          googlish 
          autoFocus
          variant="standard"
         
        />
      )}
      renderOption={renderOption}
      classes={classes}
    />
  );
}
//  InputProps={{ ...params.InputProps, disableUnderline: true }}