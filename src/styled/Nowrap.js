// import React from 'react';
import { styled, Typography } from '@mui/material';
//  import { blue } from '@mui/material/colors';


/**
 * A typography component with optional text truncation and text wrap.
 * @param {object} props - The component props.
 * @param {boolean} [props.selected] - Whether the component is currently selected.
 * @param {string} [props.color] - The color of the component.
 * @param {boolean} [props.error] - Whether the component represents an error.
 * @param {string} [props.width] - The width of the component.
 * @param {boolean} [props.wrap=true] - Whether to wrap the text if it overflows.
 * @param {boolean} [props.muted] - Whether the component is muted.
 * @param {boolean} [props.cap] - Whether to capitalize the text.
 * @param {boolean} [props.tiny] - Whether to use a tiny font size.
 * @param {boolean} [props.small] - Whether to use a small font size.
 * @param {boolean} [props.thin] - Whether to use a thin line-height.
 * @param {boolean} [props.border] - Whether to display a bottom border.
 * @param {boolean} [props.bold=false] - Whether the text should be bold.
 * @param {boolean} [props.fullWidth] - Whether the component should fill its container width.
 * @param {boolean} [props.hover] - Whether the component should have a hover effect.
 * @returns {JSX.Element} The Nowrap component.
 */  
const Nowrap = styled(Typography)(
  ({
    theme,
    selected,
    color,
    error,
    width,
    wrap,
    muted,
    cap,
    tiny,
    small,
    thin,
    border,
    bold = false,
    fullWidth,
    hover,
  }) => {
    const obj = {
      cursor: hover ? 'pointer' : 'default',
      fontWeight: bold ? 600 : 400,
      // backgroundColor: odd ? blue[50] : theme.palette.common.white,
      padding: selected ? theme.spacing(0.5) : 0, 
      backgroundColor: selected ? theme.palette.primary.light : null,
      width: width || '',
      color: error
        ? theme.palette.error.main
        : selected
        ? theme.palette.primary.dark
        : muted
        ? theme.palette.text.secondary
        : null,
      '&:hover': {
        textDecoration: hover ? 'underline' : 'none',
      },
    };
    if (!wrap) {
      Object.assign(obj, {
        whiteSpace: 'nowrap',
        overflowX: 'hidden',
        textOverflow: 'ellipsis',
      });
    }
    if (fullWidth) {
      Object.assign(obj, {
        width: '100%',
      });
    }
    if (tiny) {
      Object.assign(obj, {
        fontSize: '0.75rem',
      });
    }
    if (small) {
      Object.assign(obj, {
        fontSize: '0.85rem',
      });
    }
    if (border) {
      Object.assign(obj, {
        borderBottom: 'solid 1px ' + theme.palette.divider,
      });
    }
    if (thin) {
      Object.assign(obj, {
        lineHeight: '1em',
      });
    }

    if (cap) {
      Object.assign(obj, {
        textTransform: 'capitalize',
      });
    }

    if (color && theme.palette[color]) {
      Object.assign(obj, {
        color: theme.palette[color].main,
      });
    }
    return obj;
  }
);

export default Nowrap;
