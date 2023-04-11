import React from 'react';
import { CircularProgress } from '@mui/material';
import { useTimer } from '../machines';


/**
 * A circular progress bar that indicates the progress of a timer.
 * @param {Object} props - The component props.
 * @param {Component} [props.component=CircularProgress] - The component to use for the progress bar.
 * @param {boolean} [props.auto=true] - Whether the timer should start automatically.
 * @param {number} [props.limit=15] - The time limit for the timer, in seconds.
 * @returns {JSX.Element} A circular progress bar.
 */
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
