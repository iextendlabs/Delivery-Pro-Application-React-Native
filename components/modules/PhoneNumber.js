import React, { useState } from 'react';
import { Text, Linking, StyleSheet } from 'react-native';
import OrderListStyle from "../styles/OrderListStyle";
import Icon from "react-native-vector-icons/Ionicons";

const PhoneNumber = ({ phoneNumber, showNumber }) => {
  const handleCall = () => {
    Linking.openURL(`tel:${phoneNumber}`);
  };


  return (
    <Text onPress={handleCall}>
      <Icon name="call-outline" size={25} color="black"/>
      <Text style={styles.phoneNumber}>
        {showNumber && phoneNumber}
      </Text>
    </Text>
  );
};
const styles = StyleSheet.create(OrderListStyle);
export default PhoneNumber;
