
import React from 'react';
import { Menu, Drawer, useTheme, useMediaQuery } from '@mui/material';

/**
A component that renders a menu using Menu or Drawer based on the screen size.
@param {Object} props - The props object.
@param {ReactNode} props.children - The content to render within the menu.
@param {React.ElementType} [props.component=Menu] - The component to use for rendering the menu. Defaults to Menu.
@param {Object} props.props - The props object passed to the component.
@returns {JSX.Element} - The rendered menu component.
*/
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
