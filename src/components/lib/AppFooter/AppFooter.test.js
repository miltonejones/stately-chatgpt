import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import AppFooter from './AppFooter';
 
afterEach(() => cleanup());
 
describe('<AppFooter/>', () => {
 it('AppFooter mounts without failing', () => {
   render(<AppFooter />);
   expect(screen.getAllByTestId("test-for-AppFooter").length).toBeGreaterThan(0);
 });
});

