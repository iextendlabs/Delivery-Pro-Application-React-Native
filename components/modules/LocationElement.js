import React from 'react';
import { TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const openGoogleMap = (latitude, longitude) => {
  const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  Linking.openURL(url);
};

const LocationElement = ({ latitude, longitude }) => {
  return (
    <TouchableOpacity onPress={() => openGoogleMap(latitude, longitude)}>
      <Icon name="location-sharp" size={30} color="red" />
    </TouchableOpacity>
  );
};

export default LocationElement;
