import React from 'react';
import SessionList from './SessionList';
 
export default {
 title: 'SessionList',
 component: SessionList
};
 
const Template = (args) => <SessionList {...args} />;
export const DefaultView = Template.bind({});
DefaultView.args = {};
