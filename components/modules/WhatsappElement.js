import React from 'react';
import { TouchableOpacity, View, Text, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const WhatsAppElement = ({ phoneNumber, showNumber }) => {

  const openWhatsAppMessage = async () => {
    try {
      Linking.openURL(`https://wa.me/${phoneNumber}`);
    } catch (error) {
      console.error("Error opening WhatsApp:", error);
    }
  };

  return (
    <TouchableOpacity onPress={openWhatsAppMessage} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
      <Icon name="logo-whatsapp" size={25} color="green" />
      { showNumber && <Text>{phoneNumber}</Text> }
    </TouchableOpacity>
  );
};

export default WhatsAppElement;
