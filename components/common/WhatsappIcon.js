import React, { useEffect, useState } from "react";
import { TouchableOpacity, StyleSheet, Linking, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WhatsAppButton = () => {
  const openWhatsApp = async () => {
    const number = (await AsyncStorage.getItem("@whatsapp")) ?? "+971562871241";
    const url = `https://wa.me/${number}`;
    Linking.openURL(url);
  };

  return (
    <TouchableOpacity style={styles.button} onPress={openWhatsApp}>
      <Image source={require("../images/whatsapp.png")} style={styles.icon} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 80,
    right: 20,
    zIndex: 999,
    backgroundColor: "#25D366",
    borderRadius: 30,
    padding: 10,
    elevation: 5,
  },
  icon: {
    width: 40,
    height: 40,
  },
});

export default WhatsAppButton;
