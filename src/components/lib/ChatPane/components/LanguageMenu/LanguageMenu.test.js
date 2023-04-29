import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import LanguageMenu from './LanguageMenu';
 
afterEach(() => cleanup());
 
describe('<LanguageMenu/>', () => {
 it('LanguageMenu mounts without failing', () => {
   render(<LanguageMenu />);
   expect(screen.getAllByTestId("test-for-LanguageMenu").length).toBeGreaterThan(0);
 });
});

