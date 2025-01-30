import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
  Linking
} from "react-native";
import OrderListStyle from "../styles/OrderListStyle";
import { OrderChatUrl } from "../config/Api";
import { AddOrderChatUrl } from "../config/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Icon from 'react-native-vector-icons/Ionicons';
import * as Location from 'expo-location';

const OrderChatModal = ({ visible, order, onClose }) => {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chats, setChat] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMessage("Permission to access location was denied");
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setLatitude(location.coords.latitude);
        setLongitude(location.coords.longitude);
      } catch (error) {
        console.log("Error fetching location");
      }
    };

    fetchLocation();
  }, []);

  const handleModalClose = () => {
    setErrorMessage("");
    setSuccessMessage("");
    setText("");
    onClose();
  };

  useEffect(() => {
    visible && setChat('') && fetchChat();
  }, [visible]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (visible) {
        fetchChat();
      }
    }, 3000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [visible]);

  const fetchChat = async (visible) => {

    setUserId(await AsyncStorage.getItem("@user_id"));
    try {
      const response = await axios.get(
        `${OrderChatUrl}order_id=${order.id}`
      );
      setChat(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleSubmitChat = async (type) => {
    if(type === "Location"){
      if (latitude === "" && longitude === "") {
        setErrorMessage("Error fetching location.");
        return;
      }
    }else if (text.trim() === "") {
      setErrorMessage("Please enter a text.");
      return;
    }
    setIsLoading(true);
    try {

      const requestData = {
        order_id: order.id,
        user_id: userId,
      };

      if (type === "Location") {
        requestData.text = latitude+","+longitude;
        requestData.type = type;
      } else{
        requestData.text = text;
        requestData.type = "";
      }

      const response = await axios.post(AddOrderChatUrl, requestData);

      if (response.status === 200) {
        setSuccessMessage("Chat Update successfully.");
        setChat(response.data);
        setText("");
      } else {
        throw new Error("Failed to Update Chat.");
      }
    } catch (error) {
      setErrorMessage("Failed to Update Chat. Please try again.");
    }

    setIsLoading(false);
  };

  const handleLocation = async (location) => {
    const [latitude, longitude] = location.split(',');
    try {
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

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

  const renderChat = ({ item }) => {
    const chatStyle =
      userId === item.user_id
        ? styles.otherMessageContainer
        : styles.userMessageContainer;
    const body =
      item.type === "Location"
        ? <TouchableOpacity
          style={[styles.submitButton, { width: 40 }]}
          onPress={() => handleLocation(item.text)}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            <Icon name="location-sharp" size={20} color="#fff" />
          </Text>
        </TouchableOpacity>
        : <Text style={styles.messageText}>{item.text}</Text>;
    return (
      <View style={chatStyle}>
        <View style={styles.messageBubble}>
          {body}
          <Text style={styles.messageRole}>{item.role} {item.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.chatModalContent}>
          <Text style={styles.modalTitle}>Chat</Text>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : (
            <FlatList
              data={chats}
              renderItem={renderChat}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={
                <Text style={styles.noItemsText}>No Chat</Text>
              }
            />
          )}

          <View style={styles.commentContainer}>
            <Text style={styles.label}>Text:</Text>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Enter your Text"
              multiline
            />
            <View style={{ flexDirection: "column", alignContent: "center", alignItems: "center" }}>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => handleSubmitChat("Comment")}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  Send Message
                </Text>
              </TouchableOpacity>
              <Text>Or</Text>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => handleSubmitChat("Location")}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  Current Location
                </Text>
              </TouchableOpacity>
            </View>
            {successMessage !== "" && (
              <Text style={styles.successMessage}>{successMessage}</Text>
            )}
            {errorMessage !== "" && (
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleModalClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create(OrderListStyle);

export default OrderChatModal;
