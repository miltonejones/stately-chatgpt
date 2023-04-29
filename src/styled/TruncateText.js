/**
 * A component that displays the first 100 characters of a string 
 * and allows user to display whole string on click
 *
 * @param {string} text - The string to display
 *
 * @example
 * <TruncateText text="Lorem ipsum dolor sit amet, consectetur adipiscing elit." />
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types'; 
import TinyButton from './TinyButton';



const TruncateText = ({ children }) => {
  const [showMore, setShowMore] = useState(false);

  const handleClick = () => {
    setShowMore(!showMore);
  };

  if (children.length < 100) {
    return <>{children}</>
  }

  return (
    <> 
        {showMore ? children : `${children.substring(0, 100)}...`}
          <TinyButton deg={showMore ? 180 : 0} icon="ExpandMore" onClick={handleClick} />
    </>
  );
};

TruncateText.propTypes = {
  children: PropTypes.string,
};

export default TruncateText;

// This component uses Material-UI's Typography and IconButton components 
// to display the string and show an expand icon. 
// The state is managed using useState hook to toggle between showing the truncated string 
// and the full length string when clicked. 
// The handleClick function toggles the state using setShowMore function which accepts the current state value. 
// The JSDoc comment at the top of the component is used to document the props passed to the component.