/**
 * Renders a list of prior session questions with options to restore and delete them.
 * @param {Object} props - The props object containing a handler function for sending messages
 * and a sessions object containing prior session data.
 * @returns The SessionList component.
 */
import React from 'react';
import { Box } from '@mui/material';
import { FlexButton, Nowrap, TinyButton, ConfirmPop } from '../../../../../styled';

const SessionList = (props) => {
  const { handler } = props;
  const { sessions } = handler;
  const priorQuestions = Object.keys(sessions);
  const hasAnswers = !!handler.answers.length;
  const lastQuestion = hasAnswers ? handler.answers[handler.answers.length - 1].question : null;

  /**
   * Sends a message to restore a prior session.
   * @param {String} query - The question of the prior session.
   */
  const handleRestore = (query) => {
    handler.send({
      type: 'RESTORE',
      answers: sessions[query]
    });
  };

  return (
    <Box>
      {hasAnswers &&
        <FlexButton active>
          <Nowrap>{lastQuestion}</Nowrap>
          <TinyButton icon="BorderColor" />

          <ConfirmPop
            message="Are you sure you want to remove this conversation?"
            label="Confirm clear"
            okayText="delete"
            onChange={(ok) => ok && handler.send({
              type: 'DROP',
              question: lastQuestion
            })}
          >
            <TinyButton icon="Delete" />
          </ConfirmPop>

        </FlexButton>
      }

      {priorQuestions
        .filter((query) => query !== lastQuestion)
        .slice(priorQuestions.length - 10)
        .map((query) => (
          <FlexButton key={query} onClick={() => handleRestore(query)}>
            <TinyButton icon="Chat" />
            <Nowrap muted hover>{query}</Nowrap>
          </FlexButton>
        ))}
    </Box>
  );
};

SessionList.defaultProps = {
  handler: {
    send: () => {},
    answers: []
  },
  sessions: {}
};

export default SessionList;

// Critiques:
// 1. It would be helpful to include JSDoc comments for the defaultProps as well.
// 2. The naming of the "handler" prop could be more descriptive, but it's unclear what this component is used for so it's difficult to suggest a better name.
// 3. It's unclear from this code where the "sessions" object comes from, so it would be helpful to have more context around that.