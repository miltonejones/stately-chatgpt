
import React from 'react';
import * as Icons from "@mui/icons-material";

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
