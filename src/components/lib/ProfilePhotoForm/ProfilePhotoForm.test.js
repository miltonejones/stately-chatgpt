import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import ProfilePhotoForm from './ProfilePhotoForm';
 
afterEach(() => cleanup());
 
describe('<ProfilePhotoForm/>', () => {
 it('ProfilePhotoForm mounts without failing', () => {
   render(<ProfilePhotoForm />);
   expect(screen.getAllByTestId("test-for-ProfilePhotoForm").length).toBeGreaterThan(0);
 });
});

