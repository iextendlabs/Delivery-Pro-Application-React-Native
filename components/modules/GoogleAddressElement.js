import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";

const GoogleAddressElement = ({ address }) => {

  const openGoogleMaps = () => {
    const formattedAddress = address.replace(/\s/g, "+");
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${formattedAddress}`;
    Linking.openURL(mapUrl);
  };

  return (
    <TouchableOpacity onPress={openGoogleMaps}>
      <View style={styles.addressContainer}>
      <Text style={styles.addressLine}>{address}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  addressContainer: {
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderColor: 'lightgray',
  },
  addressLine: {
    fontSize: 16,
    color: 'blue',
  },
});

export default GoogleAddressElement;
