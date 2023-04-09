
import React from 'react';
import { Menu, Drawer, useTheme, useMediaQuery } from '@mui/material';

const FlexMenu = ({ children, component: Component = Menu, ...props }) => {
  const theme = useTheme();
  const small = useMediaQuery(theme.breakpoints.down('md'));
  if (small) {
    return <Drawer
      anchor="bottom"
      {...props}
      >
        {children}
    </Drawer>
  }

  return <Component {...props}>{children}</Component>
}

export default FlexMenu;
