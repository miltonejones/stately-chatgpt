import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import SidebarMenu from './SidebarMenu';
 
afterEach(() => cleanup());
 
describe('<SidebarMenu/>', () => {
 it('SidebarMenu mounts without failing', () => {
   render(<SidebarMenu />);
   expect(screen.getAllByTestId("test-for-SidebarMenu").length).toBeGreaterThan(0);
 });
});

