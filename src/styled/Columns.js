
import { styled, Box } from '@mui/material';


/**
A styled component that creates a grid container with multiple columns.
@component
@param {Object} props - The props of the Columns component.
@param {Object} props.theme - The MUI theme object.
@param {number} [props.spacing=1] - The spacing between the grid items in theme.spacing units.
@param {string} [props.columns='1fr 1fr'] - The column template for the grid. It should follow the grid-template-columns CSS property format.
@returns {JSX.Element} - A grid container with multiple columns.
*/
const Columns = styled(Box)(({theme, spacing=1, columns = '1fr 1fr'}) => ({
  display: 'grid',
  gridTemplateColumns: `${columns}`,
  gap: theme.spacing(spacing),
  alignItems: 'center',
  transition: "all 0.2s linear"
}))

export default Columns;
