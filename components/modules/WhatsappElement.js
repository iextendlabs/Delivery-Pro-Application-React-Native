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
    <TouchableOpacity onPress={openWhatsAppMessage} style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Icon name="logo-whatsapp" size={25} color="green" />
      { showNumber && <Text style={{ marginLeft: 8 }}>{phoneNumber}</Text> }
    </TouchableOpacity>
  );
};

export default WhatsAppElement;
