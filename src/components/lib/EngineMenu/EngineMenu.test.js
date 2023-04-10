import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import EngineMenu from './EngineMenu';
 
afterEach(() => cleanup());
 
describe('<EngineMenu/>', () => {
 it('EngineMenu mounts without failing', () => {
   render(<EngineMenu />);
   expect(screen.getAllByTestId("test-for-EngineMenu").length).toBeGreaterThan(0);
 });
});

