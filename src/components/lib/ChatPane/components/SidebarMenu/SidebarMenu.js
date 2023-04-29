/**
 * Renders the sidebar menu for the chat app.
 * @function
 * @param {Object} props - Component props.
 * @param {Object} props.handler - Handler object for chat sessions.
 * @returns {JSX.Element} - Rendered component.
 */

import React from 'react';
import { Stack } from '@mui/material';
import { 
  Nowrap, 
  ConfirmPop, 
  TinyButton,
  FlexButton
} from '../../../../../styled';
import Login from '../../../Login/Login'; 
import LanguageMenu from '../LanguageMenu/LanguageMenu';

const SidebarMenu = (props) => {
  // Destructure necessary properties from handler
  const { sessions, user, send } = props.handler;
  const priorQuestions = Object.keys(sessions);

  /**
   * Handler function for clearing all conversations when ConfirmPop is confirmed.
   * Sends 'CLEAR' event to chat handler.
   * @function
   * @param {Boolean} ok - Whether the ConfirmPop has been confirmed.
   */
  const handleClearConfirm = (ok) => {
    if (ok) {
      send('CLEAR');
    }
  };

  return (
    <Stack>
      {/* Render Clear Conversations option only if there are prior questions */}
      {!!priorQuestions.length && (
        <ConfirmPop 
          message="Are you are you want to clear all your conversations?"
          label="Confirm clear"
          okayText="Clear conversations"
          onChange={handleClearConfirm}
        >
          <FlexButton>
            <TinyButton icon="Delete" />
            <Nowrap hover>Clear conversations</Nowrap>
          </FlexButton>
        </ConfirmPop>
      )}

      {/* Render Language Menu */}
      <LanguageMenu   {...props} />

      {/* Render Login Menu */}
      <Login>
        <FlexButton sx={{ mb: 4 }}>
          <TinyButton icon="Lock" />
          <Nowrap hover>Sign {!!user ? 'Out' : 'In'}</Nowrap>
        </FlexButton>
      </Login>
    </Stack>
  );
}

SidebarMenu.defaultProps = {}; // Add default props if necessary
export default SidebarMenu;

/*
    Critiques of the code:

    1. There are unused imports that should be removed.
    2. The LanguageMenu component was unnecessarily spread out into the props of SidebarMenu.
    3. The variable name 'handler' is too abstract and should be more descriptive.
*/