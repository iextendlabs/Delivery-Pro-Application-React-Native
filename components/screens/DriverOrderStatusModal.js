import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, TextInput, Alert } from "react-native";
import OrderListStyle from "../styles/OrderListStyle";
import { ScrollView } from "react-native-gesture-handler";
import { DriverOrderStatusUpdateUrl } from "../config/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Location from 'expo-location';

const DriverOrderStatusModal = ({ visible, order, onClose }) => {

  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
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

  const handleSubmitStatus = async (type) => {
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
    const userId = await AsyncStorage.getItem("@user_id");
    try {

      const requestData = {
        order_id: order.id,
        user_id: userId,
        driver_status: "Pick me",
      };

      if (type === "Location") {
        requestData.text = latitude+","+longitude;
        requestData.type = type;
      } else{
        requestData.text = text;
        requestData.type = "";
      }

      const response = await axios.post(DriverOrderStatusUpdateUrl, requestData);

      if (response.status === 200) {
        setSuccessMessage("Status Update successfully.");
        handleModalClose();
      } else {
        throw new Error("Failed to update status.");
      }
    } catch (error) {
      setErrorMessage("Failed to update status. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Driver Order Status</Text>
          <View style={styles.commentContainer}>
            <Text style={styles.label}>Message:</Text>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Enter your comment"
              multiline
            />
            <Text style={styles.label}>Are you sure to change driver order status to Pick me?</Text>
            <View style={{ flexDirection: "column", alignContent:"center",alignItems:"center" }}>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => handleSubmitStatus("Comment")}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  Submit with Comment
                </Text>
              </TouchableOpacity>
              <Text>Or</Text>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => handleSubmitStatus("Location")}
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

export default DriverOrderStatusModal;
