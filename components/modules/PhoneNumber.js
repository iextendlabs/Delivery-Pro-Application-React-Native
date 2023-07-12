import React, { useState } from 'react';
import { Text, Linking } from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";

const PhoneNumber = ({ phoneNumber, showNumber }) => {
  const handleCall = () => {
    Linking.openURL(`tel:${phoneNumber}`);
  };


  return (
    <Text onPress={handleCall}>
      <Icon name="call-outline" size={25} color="black"/>
      {showNumber && phoneNumber}
    </Text>
  );
};

export default PhoneNumber;
