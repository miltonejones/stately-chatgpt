import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import Login from './Login';
 
afterEach(() => cleanup());
 
describe('<Login/>', () => {
 it('Login mounts without failing', () => {
   render(<Login />);
   expect(screen.getAllByTestId("test-for-Login").length).toBeGreaterThan(0);
 });
});

