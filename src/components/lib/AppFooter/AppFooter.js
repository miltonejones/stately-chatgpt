import React from 'react';
import { Nowrap, Flex, TinyButton } from '../../../styled';
import AboutModal from '../AboutModal/AboutModal';

const AppFooter = ({ small }) => {
  return (
    <Flex
      between
      sx={{ p: (t) => t.spacing(1, 3), height: 'var(--bottom-bar-offset)' }}
      spacing={1}
    >
      {!small && <Flex spacing={2} small muted>
        <AboutModal />
        <Flex spacing={1}>
          <TinyButton icon="GitHub" />
          <Nowrap small hover muted onClick={() => window.open(GITHUB_URL)}>
            Github Repo
          </Nowrap>
        </Flex>
      </Flex>}

      {!small && <Nowrap small hover muted onClick={() => window.open(OPENAI_API)}>
        {' '}
        Powered by the <b>OpenAI Chat API</b>
      </Nowrap>}

      <Flex spacing={1}>
        <img src="/logo.png" 
          alt="logo"
          style={{
            width: 24,
            height: 24
          }} />
        <Nowrap hover small muted onClick={() => window.open(XSTATE_HOME)}>
          <b>GoatGPT</b>. An xstate web application
        </Nowrap>
      </Flex>
    </Flex>
  );
};
AppFooter.defaultProps = {};
export default AppFooter;

const OPENAI_API =
  'https://openai.com/blog/openai-api';
const GITHUB_URL = 'https://github.com/miltonejones/stately-chatgpt';
const XSTATE_HOME = 'https://xstate.js.org/';
