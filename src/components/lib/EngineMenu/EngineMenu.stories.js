import React from 'react';
import EngineMenu from './EngineMenu';
 
export default {
 title: 'EngineMenu',
 component: EngineMenu
};
 
const Template = (args) => <EngineMenu {...args} />;
export const DefaultView = Template.bind({});
DefaultView.args = {};
