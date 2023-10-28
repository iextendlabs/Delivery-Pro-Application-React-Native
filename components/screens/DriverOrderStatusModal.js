import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, TextInput, Alert } from "react-native";
import OrderListStyle from "../styles/OrderListStyle";
import { ScrollView } from "react-native-gesture-handler";
import { DriverOrderStatusUpdateUrl } from "../config/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const DriverOrderStatusModal = ({ visible, order , onClose }) => {

  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleModalClose = () => {
    onClose();
  };

  const handleSubmitStatus = async () => {
    if (text.trim() === "") {
      setErrorMessage("Please enter a text.");
      return;
    }

    setIsLoading(true);
    const userId = await AsyncStorage.getItem("@user_id");
    try {
      const formData = new FormData();
  
      formData.append("order_id", order.id);
      formData.append("text", text);
      formData.append("user_id", userId);
      formData.append("driver_status", "Pick me");
      
      const response = await axios.post(DriverOrderStatusUpdateUrl,formData);

      if (response.status === 200) {
        setSuccessMessage("Status Update successfully.");
        onClose();
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
      <ScrollView>

      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Driver Order Status</Text>
          <ScrollView>
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
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitStatus}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? "Submitting..." : "Submit"}
                </Text>
              </TouchableOpacity>
              {successMessage !== "" && (
                <Text style={styles.successMessage}>{successMessage}</Text>
              )}
              {errorMessage !== "" && (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              )}
            </View>
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleModalClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create(OrderListStyle);

export default DriverOrderStatusModal;
