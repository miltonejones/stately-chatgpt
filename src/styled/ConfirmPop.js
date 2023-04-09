
import React from 'react';
import { Popover, Stack, Box, Typography } from '@mui/material'; 
import { useMenu } from '../machines';
import Flex from './Flex';
import Spacer from './Spacer';
import Nowrap from './Nowrap';
import TinyButton from './TinyButton';
import FlexMenu from './FlexMenu';
import Btn from './Btn';

const ConfirmPop =  ({ 
    children, 
    onChange, 
    caption, 
    message = "Are you sure you want to delete this item?",
    label = "Are you sure?", 
    okayText = 'Okay' }) => {
  const menu = useMenu(onChange)  ;

  return (
    <>
    <Box onClick={menu.handleClick}>
      {children}
    </Box>

    <FlexMenu component={Popover}
      anchorEl={menu.anchorEl}
      onClose={menu.handleClose()}
      open={Boolean(menu.anchorEl)}
    >
      <Stack sx={{ backgroundColor: 'white' }}>
        <Stack sx={{ p: 2, minWidth: 400 , maxWidth: 500 }} spacing={2}>
          <Flex sx={{ mb: 1 }} spacing={1}>
            <TinyButton icon="CheckCircle" />
            <Nowrap bold small muted>
              {label}
            </Nowrap>
            <Spacer />
         
            <TinyButton icon="Close" onClick={menu.handleClose()} />
          </Flex>

          <Typography variant="body1">{message}</Typography>
          <Nowrap small color="error" bold>{caption}</Nowrap>
 
        </Stack>
        <Flex
          sx={{
            p: 2,
            backgroundColor: (t) => t.palette.grey[200],
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Spacer />
 

          <Btn onClick={menu.handleClose()}>cancel</Btn>
          <Btn 
            onClick={menu.handleClose(true)}
            variant="contained"
          >
            {okayText}
          </Btn>
        </Flex>
      </Stack>
    </FlexMenu>
  </>
  )
}

export default ConfirmPop;
