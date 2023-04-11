

import { styled, Button } from '@mui/material';

/**
A styled Material-UI button with custom styles for text transformation, text decoration, border radius, and padding.
@param {Object} props - The props of the component.
@param {boolean} [props.hover=false] - Indicates whether the button is in hover state or not.
@param {Object} props.theme - The Material-UI theme object.
@returns {JSX.Element} - The rendered button.
*/
export const Btn = styled(Button)(({ hover, theme }) => ({
  textTransform: hover  ? 'none' : 'capitalize',
  textDecoration: hover ? 'underline' : 'none',
  borderRadius: 20,
  padding: theme.spacing(0.5, 3)
}));

export default Btn;
