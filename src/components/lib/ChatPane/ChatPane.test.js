import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import ChatPane from './ChatPane';
 
afterEach(() => cleanup());
 
describe('<ChatPane/>', () => {
 it('ChatPane mounts without failing', () => {
   render(<ChatPane />);
   expect(screen.getAllByTestId("test-for-ChatPane").length).toBeGreaterThan(0);
 });
});

