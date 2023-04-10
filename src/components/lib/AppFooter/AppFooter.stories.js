import React from 'react';
import AppFooter from './AppFooter';
 
export default {
 title: 'AppFooter',
 component: AppFooter
};
 
const Template = (args) => <AppFooter {...args} />;
export const DefaultView = Template.bind({});
DefaultView.args = {};
