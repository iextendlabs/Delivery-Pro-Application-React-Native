import React from 'react';
import { TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const openGoogleMap = (latitude, longitude, address) => {
  const url = latitude.toString().length && longitude.toString().length ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}` : `https://www.google.com/maps/search/?api=1&query=${address}`;
  Linking.openURL(url);
};

const LocationElement = ({ latitude, longitude, address }) => {
  return (
    <TouchableOpacity onPress={() => openGoogleMap(latitude, longitude, address)}>
      <Icon name="location-sharp" size={30} color="red" />
    </TouchableOpacity>
  );
};

export default LocationElement;
