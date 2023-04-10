import React from 'react';
import { Box } from '@mui/material';
import {
  FlexMenu, StackedMenuItem
} from '../../../styled';
import { useMenu } from '../../../machines';

 
 
const EngineMenu = ({ handler, children, ...props }) => {
  const menu = useMenu(value => !!value && 
      handler.send({ 
        type: 'CHANGE',
        key: 'responseType',
        value
      }));

      const { typeProps } = handler;

  
 return (
   <>
    <Box onClick={menu.handleClick}>{children}</Box>

    <FlexMenu 
        anchorEl={menu.anchorEl}
        open={Boolean(menu.anchorEl)}
        onClose={menu.handleClose()}
      >
        
        {typeProps.map(item =>  <StackedMenuItem {...item} 
          onClick={menu.handleClose(item.value)} 
          bold={handler.responseType === item.value} 
        >{item.label}


      </StackedMenuItem>)}
     
     
      </FlexMenu>

   </>
 );
}
EngineMenu.defaultProps = {};
export default EngineMenu;
