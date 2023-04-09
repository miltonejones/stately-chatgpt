import React from 'react';
import { CircularProgress } from '@mui/material';
import { useTimer } from '../machines';

const TimerProgress = ({ 
    component: Component = CircularProgress, 
    auto = true, 
    limit = 15, 
    ...props 
  }) => {

  const timer = useTimer({
    auto,
    limit,
  });

  const variant = timer.state.matches('running')
    ? 'determinate'
    : 'indeterminate';

  if (timer.state.matches('done')) return <i />;
  return (
    <Component variant={variant} value={timer.progress} {...props} />
  );
};

export default TimerProgress;
