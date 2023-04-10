import React from 'react';
import { Box } from '@mui/material';
import {
  FlexMenu, StackedMenuItem, Nowrap
} from '../../../styled';
import { useMenu } from '../../../machines';

 
 
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
