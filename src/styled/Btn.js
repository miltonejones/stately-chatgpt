

import { styled, Button } from '@mui/material';

export const Btn = styled(Button)(({ hover, theme }) => ({
  textTransform: hover  ? 'none' : 'capitalize',
  textDecoration: hover ? 'underline' : 'none',
  borderRadius: 20,
  padding: theme.spacing(0.5, 3)
}));

export default Btn;
