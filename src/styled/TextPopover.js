
import React from 'react';
import { Popover, MenuItem, Stack, Box, Collapse, TextField } from '@mui/material'; 
import { useMenu } from '../machines';
import Flex from './Flex';
import Spacer from './Spacer';
import Nowrap from './Nowrap';
import TinyButton from './TinyButton';
import FlexMenu from './FlexMenu';
import Btn from './Btn';

/**
 * A component that renders a text input inside a pop-up menu.
 *
 * @param {Object} props - The props object for the component.
 * @param {ReactNode} props.children - The children to render inside the component.
 * @param {string} props.value - The current value of the text input.
 * @param {Array<Object>} props.options - An array of objects representing the options for the text input.
 * @param {string} props.description - A description of the text input.
 * @param {function} props.onChange - A function to be called when the value of the text input changes.
 * @param {string} props.okayText - The text to display in the "okay" button.
 * @param {string} props.icon - The name of the icon to display next to the text input.
 * @returns {ReactNode} The component UI.
 */
const TextPopover = ({ 
  children,
  value,
  options = [],
  description,
  onChange,
  okayText = 'Okay',
  icon="BorderColor",
  ...props
}) => {
  const menu = useMenu((val) => {
    !!val && onChange({ name: props.name, target: { value: val } });
  });

  const handleChange = (event) => {
    menu.send({
      type: 'change',
      key: event.target.name,
      value: event.target.value,
    });
  };
  const error = menu.state.matches('opened.confirm');
  return (
    <>
      <Box onClick={(e) => menu.handleClick(e, { [props.name]: value })}>
        {children}
      </Box>
      
      <FlexMenu component={Popover}
        anchorEl={menu.anchorEl}
        onClose={error ? () => menu.send('ok') : menu.handleClose()}
        open={Boolean(menu.anchorEl)}
      >
        <Stack sx={{ backgroundColor: 'white' }}>
          <Stack sx={{ p: 2, minWidth: 400 }} spacing={2}>
            <Flex sx={{ mb: 1 }} spacing={1}>
              <TinyButton icon={icon} />
              <Nowrap bold small muted>
                {props.label}{menu.dirty && <>*</>}
              </Nowrap>
              <Spacer />
              {!!menu.data && (
                <TinyButton
                  disabled={!menu.dirty || error}
                  color="primary"
                  icon="Save"
                  onClick={menu.handleClose(menu.data[props.name])}
                />
              )}
              <TinyButton icon={menu.dirty ? "Circle" : "Close"} onClick={menu.handleClose()} />
            </Flex>

            <Nowrap variant="body1">{description}</Nowrap>
 
            {!!menu.data && (
              <TextField
                autoFocus
                onKeyUp={(e) =>
                  e.keyCode === 13 && menu.handleClose(menu.data[props.name])(e)
                }
                error={error}
                disabled={error}
                helperText={
                  error
                    ? 'If you close now you will lose your unsaved changes!'
                    : ''
                }
                size="small"
                autoComplete="off"
                value={menu.data[props.name]}
                onChange={handleChange}
                select={!!options.length}
                {...props}
              >
                {options.map(option => <MenuItem value={option.value}>{option.label}</MenuItem> )}

              </TextField>
            )}
          </Stack>
          <Flex
            sx={{
              p: 2,
              backgroundColor: (t) => t.palette.grey[200],
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            <Spacer />
            <Collapse orientation="horizontal" in={error}>
              <Flex spacing={1}>
                <Btn onClick={() => menu.send('cancel')}>
                  cancel
                </Btn>
                <Btn
                  onClick={() => menu.send('ok')}
                  variant="contained"
                  color="error"
                >
                  close anyway
                </Btn>
              </Flex>
            </Collapse>

            <Collapse orientation="horizontal" in={!error}>
              <Flex spacing={1}>
                <Btn onClick={menu.handleClose()}>cancel</Btn>
                {!!menu.data && (
                  <Btn
                    disabled={!menu.dirty}
                    onClick={menu.handleClose(menu.data[props.name])}
                    variant="contained"
                  >
                    {okayText}
                  </Btn>
                )}
              </Flex>
            </Collapse>
          </Flex>
        </Stack>
      </FlexMenu>
    </>
  );
};


export default TextPopover;
