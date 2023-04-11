import React from 'react'; 

import { TextPopover, Photo, Flex } from '../../../styled';
import { AuthContext } from '../../../machines';

 
function ProfilePhotoForm() {
  const { authenticator } = React.useContext(AuthContext);
  if (!authenticator.user) {
    return <i />
  }

  return (
    <TextPopover
      label="Set profile photo"
      name="photo"
      value={authenticator.user?.attributes.picture}
      description={
        <Flex spacing={1}>
          {!!authenticator.user?.attributes.picture && (
            <img
              src={authenticator.user.attributes.picture}
              alt={authenticator.user.username}
              style={{ width: 40, borderRadius: '50%' }}
            />
          )}
          Enter or paste the URL for your new photo
        </Flex>
      }
      onChange={(file) => !!file && authenticator.setPhoto(file.target.value)}
    >
      <Photo sx={{
        width: 48,
        height: 48
      }} src={authenticator.user?.attributes?.picture}
              alt={authenticator.user?.username}>
        {authenticator.user?.username?.substr(0,2).toUpperCase()}
      </Photo>
      {/* <Nowrap small hover>
        Set profile photo
      </Nowrap> */}
    </TextPopover>
  );
}

export default ProfilePhotoForm;
