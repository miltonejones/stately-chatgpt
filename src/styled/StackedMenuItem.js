
import React from 'react';
import { MenuItem, Stack, IconButton } from '@mui/material';
import Flex from './Flex';
import TextIcon from './TextIcon';

/**
A stacked menu item component that includes an icon, a caption, and children.
@param {object} props - The props object containing the following properties:
@param {string} icon - The icon name to be displayed in the menu item.
@param {string} caption - The caption to be displayed in the menu item.
@param {ReactNode} children - The children to be displayed in the menu item.
@param {boolean} bold - Whether to display the text in bold.
@returns {ReactNode} - A stacked menu item component.
*/
const StackedMenuItem = ({ 
    icon, 
    caption, 
    children, 
    bold, 
    ...props
  }) => {
  return (
  <MenuItem {...props}>
    <Flex>
      {!!icon && <IconButton>
        <TextIcon icon={icon} />
      </IconButton>}
      <Stack>
        <Flex bold={bold}>{children}</Flex>
        <Flex small muted>{caption}</Flex>
      </Stack>
    </Flex> 
  </MenuItem>
  )
}

export default StackedMenuItem;
