
import React from 'react';
import { Popover, Stack, Box, Typography } from '@mui/material'; 
import { useMenu } from '../machines';
import Flex from './Flex';
import Spacer from './Spacer';
import Nowrap from './Nowrap';
import TinyButton from './TinyButton';
import FlexMenu from './FlexMenu';
import Btn from './Btn';

/**

A component that renders a confirm dialog when the user clicks on its children.
@param {Object} props - The component props.
@param {ReactNode} props.children - The children to be rendered as the trigger for the dialog.
@param {Function} props.onChange - The function to be called when the user confirms or cancels the action.
@param {string} [props.caption] - The caption text to be displayed in the dialog.
@param {string} [props.message="Are you sure you want to delete this item?"] - The message to be displayed in the dialog.
@param {string} [props.label="Are you sure?"] - The label text to be displayed in the dialog header.
@param {string} [props.okayText="Okay"] - The text to be displayed in the confirm button.
@returns {JSX.Element} - The ConfirmPop component.
*/
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
