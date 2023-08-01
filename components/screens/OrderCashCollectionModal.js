import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, TextInput, Alert } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";

import OrderListStyle from "../styles/OrderListStyle";
import { OrderCashCollectionUrl } from "../config/Api";

const OrderCashCollectionModal = ({ visible, order, onClose }) => {
  const [selectedOrder, setSelectedOrder] = useState(order);
  const [description, setDescription] = useState("Cash Collected");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleModalClose = () => {
    onClose();
  };

  const handleSubmitCashCollection = async () => {
    if (description.trim() === "" || amount.trim() === "") {
      setErrorMessage("Please enter a description and an amount.");
      return;
    }

    setIsLoading(true);
    const userId = await AsyncStorage.getItem("@user_id");
    // Simulating a POST request
    try {
      const response = await fetch(
        OrderCashCollectionUrl +
          order.id +
          "?description=" +
          description +
          "&amount=" +
          amount +
          "&user_id=" +
          userId
      );

      if (!response.ok) {
        throw new Error("Failed to cash collection.");
      }

      setSuccessMessage("Cash Collected successfully but not approved by admin.");
      setDescription("");
      setAmount("");
    } catch (error) {
      setErrorMessage("Failed to Cash Collection. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Submit Cash</Text>
          <ScrollView>
            {order && (
              <View style={styles.orderDetails}>
                <Text>Total Amount: {order.total_amount}</Text>
              </View>
            )}
            <View style={styles.descriptionContainer}>
              <Text style={styles.label}>Description:</Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter your description"
                multiline
              />
              <Text style={styles.label}>Amount:</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="Enter the amount"
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitCashCollection}
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
    </Modal>
  );
};

const styles = StyleSheet.create(OrderListStyle);

export default OrderCashCollectionModal;
