import React from 'react';
import LanguageMenu from './LanguageMenu';
 
export default {
 title: 'LanguageMenu',
 component: LanguageMenu
};
 
const Template = (args) => <LanguageMenu {...args} />;
export const DefaultView = Template.bind({});
DefaultView.args = {};
