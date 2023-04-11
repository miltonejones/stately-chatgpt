// import React from 'react';
import { styled, Box } from "@mui/material";

/**
A styled component that represents a flexible container for layout purposes.
@param {Object} props - The props object containing the following properties:
@param {boolean} [props.base=false] - Whether to align items to the baseline.
@param {boolean} [props.center=false] - Whether to center the items horizontally and vertically.
@param {string} [props.wrap="nowrap"] - The white-space behavior for children elements.
@param {boolean} [props.between=false] - Whether to justify items with space-between alignment.
@param {boolean} [props.bold=false] - Whether to use a bold font-weight.
@param {number} [props.spacing=0] - The spacing between children elements.
@returns {JSX.Element} - The resulting styled component.
*/
const Flex = styled(Box)(({ theme, base, center, wrap = "nowrap", between, bold = false, spacing = 0 }) => ({
  gap: theme.spacing(spacing),
  cursor: "default",
  display: "flex",
  fontWeight: bold ? 600 : 400,
  alignItems: base ? "baseline" : "center",
  justifyContent: center ? "center" : between ? "space-between" : "flex-start",
  whiteSpace: wrap,
  flexWrap: wrap
}));

export default Flex;
