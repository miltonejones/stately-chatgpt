import React from 'react';
import AboutModal from './AboutModal';
 
export default {
 title: 'AboutModal',
 component: AboutModal
};
 
const Template = (args) => <AboutModal {...args} />;
export const DefaultView = Template.bind({});
DefaultView.args = {};
