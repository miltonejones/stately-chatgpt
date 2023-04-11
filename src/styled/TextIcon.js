
import React from 'react';
import * as Icons from "@mui/icons-material";


/** 
TextIcon component displays an icon with the given name as a string.
@param {Object} props - The component props.
@param {string} props.icon - The name of the icon to display.
@returns {JSX.Element} - A JSX Element containing the icon component to display.
*/
const TextIcon = ({ icon , ...props}) => {
  if (typeof icon === 'string') {
    const Icon = Icons[icon];
    if (icon) {
      return <Icon {...props}/>
    }
    return <i />
  } 
 
  return <i/>
} 

export default TextIcon;
