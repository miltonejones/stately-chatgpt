import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import QuestionItem from './QuestionItem';
 
afterEach(() => cleanup());
 
describe('<QuestionItem/>', () => {
 it('QuestionItem mounts without failing', () => {
   render(<QuestionItem />);
   expect(screen.getAllByTestId("test-for-QuestionItem").length).toBeGreaterThan(0);
 });
});

