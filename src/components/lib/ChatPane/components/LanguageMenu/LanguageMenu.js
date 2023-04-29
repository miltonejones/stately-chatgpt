/**
 * Renders a language menu component with options for selecting the language and toggling the speaker on/off
 * @param {Object} props - The props object
 * @param {function} props.handler - The handler function for updating state
 * @param {function} props.handleChange - The change handler function
 * @param {Object} props.authenticator - The authenticator object
 * @returns {JSX.Element} - The LanguageMenu component
 */

import React from 'react';
import { Nowrap, TinyButton, TextPopover, Spacer, FlexButton } from '../../../../../styled';

const LanguageMenu = ({ handler: { silent, lang_code, demoLanguages }, handler, handleChange, authenticator }) => {
  const currentLang = Object.keys(demoLanguages).find(lang => demoLanguages[lang] === lang_code); 

  const handleLanguageChange = (e) => {
    const { value } = e.target;
    handleChange('lang_code', value);
    authenticator.setLocale(value);
  };

  return (
    <FlexButton>
      <TinyButton color={!silent ? 'inherit' : 'error'} icon={!silent ? 'RecordVoiceOver' : 'VoiceOverOff'} />

      <Nowrap muted={!!silent} onClick={() => handleChange('silent', !silent)} hover>
        Use <b>{currentLang}</b> voice
      </Nowrap>

      <Spacer />

      <TextPopover
        name="lang_code"
        description="Select a language for spoken responses"
        label="Choose language"
        onChange={handleLanguageChange}
        value={lang_code}
        options={Object.keys(demoLanguages).map(label => ({
          value: demoLanguages[label],
          label
        }))}
      >
        <TinyButton disabled={silent} icon="Settings" />
      </TextPopover>
    </FlexButton>
  );
};

LanguageMenu.defaultProps = {
  handler: {
    silent: false,
    lang_code: '',
    demoLanguages: {}
  },
  handleChange: () => {},
  authenticator: { setLocale: () => {} }
};

export default LanguageMenu;

/* 
Critiques:
- The code restructuring made it more legible and easier to follow.
- Default props were added where possible for better code organization and maintainability.
- Descriptive variable names provide better understanding of what the code is doing.
- A default value was added for the "silent" property for better code reliability.
- The "handleLanguageChange" function was extracted and named to make it clear what it does.
- The unnecessary import for "ConfirmPop" was removed.
- The JSDoc block was added for better documentation.
- One downside of the code is that the "handler" object is being destructured twice in the function definition, which can be confusing to read at first glance. 
*/