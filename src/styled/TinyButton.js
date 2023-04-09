
import React from 'react';
import * as Icons from "@mui/icons-material";
import RotateButton from './RotateButton';

// const Icons = React.lazy(() => import('./icons'));

const TinyButton = ({ icon , ...props}) => {
  const Icon = Icons[icon] || Icons.Error;
  return <RotateButton {...props}  sx={{width: 18, height: 18}} >
    <Icon sx={{width: 16, height: 16}} />
  </RotateButton>
}

export default TinyButton;
