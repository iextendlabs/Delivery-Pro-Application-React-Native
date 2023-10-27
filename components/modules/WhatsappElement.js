import React from 'react';
import { TouchableOpacity, View, Text, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const WhatsAppElement = ({ phoneNumber, showNumber }) => {

  const openWhatsAppMessage = () => {
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}`;

    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (!supported) {
          console.log("WhatsApp is not installed on the device");
        } else {
          return Linking.openURL(whatsappUrl);
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  return (
    <TouchableOpacity onPress={openWhatsAppMessage} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
      <Icon name="logo-whatsapp" size={25} color="green" />
      { showNumber && <Text>{phoneNumber}</Text> }
    </TouchableOpacity>
  );
};

export default WhatsAppElement;
