import React from 'react';
import { Box } from '@mui/material';
import {
  FlexMenu, StackedMenuItem, Nowrap
} from '../../../styled';
import { useMenu } from '../../../machines';

 
 /**
  * Allows users to select a response mode and precision setting for an engine. It uses the useMenu hook to create a menu that 
  * opens when the user clicks on the menu and displays options that can be selected. It also has a handler that sends a change 
  * event with the key and value of the selected item. The user can choose from multiple options for response mode and precision 
  * settings. Once the user has selected their desired option, the EngineMenu will close. 
  */
const EngineMenu = ({ handler, children, engine, full, ...props }) => {
  const menu = useMenu(value => {
    if (value === undefined) return;

    const key = isNaN(value) ? "responseType" : "temperatureIndex";    
    handler.send({ 
      type: 'CHANGE',
      key,
      value
    });

  });

      const { typeProps, tempProps } = handler;

  
 return (
   <>
    <Box onClick={menu.handleClick}>{children}</Box>

    <FlexMenu 
        anchorEl={menu.anchorEl}
        open={Boolean(menu.anchorEl)}
        onClose={menu.handleClose()}
      >
        
      {!engine && <Nowrap muted bold sx={{ p: 2 }}>
        Response mode
      </Nowrap>}
     
        {!engine && typeProps.map(item =>  <StackedMenuItem {...item} 
          onClick={menu.handleClose(item.value)} 
          bold={handler.responseType === item.value} 
        >{item.label} 
      </StackedMenuItem>)}


      {((!!full && handler.responseType === 'text') || !!engine) && <Nowrap muted bold sx={{ p: 2 }}>
        Precision settings
      </Nowrap>}
     
      {((!!full && handler.responseType === 'text') || !!engine) && tempProps.map((item, i) =>  <StackedMenuItem {...item} 
          onClick={menu.handleClose(i)} 
          bold={handler.temperatureIndex === i} 
        >{item.label} 
      </StackedMenuItem>)}
     
     
      </FlexMenu>

   </>
 );
}
EngineMenu.defaultProps = {};
export default EngineMenu;
