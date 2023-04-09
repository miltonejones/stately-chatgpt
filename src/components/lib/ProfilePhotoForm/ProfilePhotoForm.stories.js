import React from 'react';
import ProfilePhotoForm from './ProfilePhotoForm';
 
export default {
 title: 'ProfilePhotoForm',
 component: ProfilePhotoForm
};
 
const Template = (args) => <ProfilePhotoForm {...args} />;
export const DefaultView = Template.bind({});
DefaultView.args = {};
