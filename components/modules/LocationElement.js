import React from "react";
import { TouchableOpacity, Linking, Alert, Text } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const openGoogleMap = async (latitude, longitude, address) => {
  try {
    const url =
      latitude != "null" &&
      longitude != "null" &&
      latitude != "undefined" &&
      longitude != "undefined" &&
      latitude != null &&
      longitude != null &&
      latitude.toString().length &&
      longitude.toString().length
        ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            address
          )}`;

    await Linking.openURL(url);
  } catch (error) {
    console.error("Error opening Google Maps:", error);
    Alert.alert("Error", "Unable to open the provided location.");
  }
};

const LocationElement = ({ latitude, longitude, address, showAddress }) => {
  return (
    <TouchableOpacity
      onPress={() => openGoogleMap(latitude, longitude, address)}
      style={styles.locationContainer}
    >
      <Icon name="location-sharp" size={30} color="red" />
      {showAddress && <Text style={styles.locationText}>{address}</Text>}
    </TouchableOpacity>
  );
};

const styles = {
  locationContainer: {
    flexDirection: "row", // Makes icon and text inline
    alignItems: "center", // Aligns items vertically
    paddingVertical: 5,
  },
  locationText: {
    marginLeft: 5, // Space between icon and text
    fontSize: 14,
    color: "#333",
  },
};

export default LocationElement;
