import React from 'react';
import { TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const openGoogleMap = async (latitude, longitude, address) => {
  try {
    const url = latitude.toString().length && longitude.toString().length
      ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${address}`;

    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      await Linking.openURL(url);
    } else {
      console.error('Cannot open Google Maps URL');
    }
  } catch (error) {
    console.error('Error opening Google Maps:', error);
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
