import React from 'react';
import ChatPane from './ChatPane';
 
export default {
 title: 'ChatPane',
 component: ChatPane
};
 
const Template = (args) => <ChatPane {...args} />;
export const DefaultView = Template.bind({});
DefaultView.args = {};
