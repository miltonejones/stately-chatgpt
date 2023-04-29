import React from 'react';
import { styled, IconButton } from '@mui/material';
import { TextIcon, IconTextField, TruncateText } from '../../../../../styled';

/**
 * A component that renders a question with specific typography styling.
 * @component
 * @param {Object} props - The props object for the component.
 * @param {Object} props.handler - The object that handles editing.
 * @param {Object} props.response - The response object containing the question.
 * @param {function} props.regererate - The function that updates the question.
 * @param {number} props.index - The index of the question in the list.
 * @param {function} props.updateQuestion - The function that updates the question.
 * @returns {JSX.Element} - The question item component.
 */
const QuestionItem = ({ handler, response, regererate, index, updateQuestion }) => {
  const isEditing = response.id === handler.editing; 

  return (
    <QuestionWrap small>
      {isEditing ? (
        <IconTextField
          sx={{ minWidth: '50vw' }}
          endIcon={
            <IconButton onClick={() => regererate(index)}>
              <TextIcon icon="Telegram" />
            </IconButton>
          }
          onChange={updateQuestion(response)}
          variant="standard"
          fullWidth
          size="small"
          value={response.question}
        />
      ) : (
        <TruncateText>{response.question}</TruncateText>
      )}
    </QuestionWrap>
  );
};

const QuestionWrap = styled('p')(({ theme }) => ({
  fontSize: '0.9rem',
  padding: 0,
  margin: 0,
  fontWeight: 600,
}));

QuestionItem.defaultProps = {};

export default QuestionItem;

