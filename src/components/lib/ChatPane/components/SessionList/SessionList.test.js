import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import SessionList from './SessionList';
 
afterEach(() => cleanup());
 
describe('<SessionList/>', () => {
 it('SessionList mounts without failing', () => {
   render(<SessionList />);
   expect(screen.getAllByTestId("test-for-SessionList").length).toBeGreaterThan(0);
 });
});

