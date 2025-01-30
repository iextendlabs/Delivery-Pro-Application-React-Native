import React from 'react';
import { TouchableOpacity, Linking, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const openGoogleMap = async (latitude, longitude, address) => {
  try {
    const url = latitude != "null" && longitude != "null"&&  latitude != "undefined" && longitude != "undefined" && latitude != null && longitude != null && latitude.toString().length && longitude.toString().length
      ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

    await Linking.openURL(url);
  } catch (error) {
    console.error('Error opening Google Maps:', error);
    Alert.alert('Error', 'Unable to open the provided location.');
  }
};

const LocationElement = ({ latitude, longitude, address }) => {
  return (
    <TouchableOpacity onPress={() => openGoogleMap(latitude, longitude, address)}>
      <Icon name="location-sharp" size={30} color="red" />
    </TouchableOpacity>
  );
};

export default LocationElement;
