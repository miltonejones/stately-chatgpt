import React from 'react';
import QuestionItem from './QuestionItem';
 
export default {
 title: 'QuestionItem',
 component: QuestionItem
};
 
const Template = (args) => <QuestionItem {...args} />;
export const DefaultView = Template.bind({});
DefaultView.args = {};
