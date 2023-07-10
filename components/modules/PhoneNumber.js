import React from 'react';
import { Text, Linking } from 'react-native';

const PhoneNumber = ({ phoneNumber }) => {
  const handleCall = () => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <Text onPress={handleCall}>
      {phoneNumber}
    </Text>
  );
};

export default PhoneNumber;
