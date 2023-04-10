
import React from 'react';
import { MenuItem, Stack, IconButton } from '@mui/material';
import Flex from './Flex';
import TextIcon from './TextIcon';

const StackedMenuItem = ({ icon, caption, children, bold, ...props}) => {
  return <MenuItem {...props}>
    <Flex wrap="wrap">
      {!!icon && <IconButton>
        <TextIcon icon={icon} />
      </IconButton>}
      <Stack>
        <Flex bold={bold}>{children}</Flex>
        <Flex wrap="wrap" small muted>{caption}</Flex>
      </Stack>
    </Flex> 
  </MenuItem>
}

export default StackedMenuItem;
