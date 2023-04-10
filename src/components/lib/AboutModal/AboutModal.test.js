import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import AboutModal from './AboutModal';
 
afterEach(() => cleanup());
 
describe('<AboutModal/>', () => {
 it('AboutModal mounts without failing', () => {
   render(<AboutModal />);
   expect(screen.getAllByTestId("test-for-AboutModal").length).toBeGreaterThan(0);
 });
});

