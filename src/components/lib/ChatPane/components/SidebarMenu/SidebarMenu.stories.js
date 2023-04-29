import React from 'react';
import SidebarMenu from './SidebarMenu';
 
export default {
 title: 'SidebarMenu',
 component: SidebarMenu
};
 
const Template = (args) => <SidebarMenu {...args} />;
export const DefaultView = Template.bind({});
DefaultView.args = {};
