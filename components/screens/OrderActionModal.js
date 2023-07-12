import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, TextInput, Alert } from "react-native";
import PhoneNumber from "../modules/PhoneNumber";
import OrderListStyle from "../styles/OrderListStyle";
import { ScrollView } from "react-native-gesture-handler";
import { ApprovedUrl } from "../config/Api";
import { DeclineUrl } from "../config/Api";
import { RescheduleUrl } from "../config/Api";

const OrderActionModal = ({ visible, order, onClose }) => {
  const [selectedOrder, setSelectedOrder] = useState(order);
  const [timeText, setTimeText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleModalClose = () => {
    onClose();
  };

  const handleSubmitComment = async () => {
    if (timeText.trim() === "") {
      setErrorMessage("Please enter a time.");
      return;
    }

    setIsLoading(true);

    // Simulating a POST request for posting comment
    try {
      // Replace the API_URL with your actual API endpoint
      const response = await fetch(RescheduleUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: order.order_id,
          time: timeText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to post time.");
      }

      setSuccessMessage("Time posted successfully.");
      setTimeText("");
    } catch (error) {
        setErrorMessage("Failed to post time. Please try again.");
    }

    setIsLoading(false);
  };

  const handleAcceptOrder = async () => {
    setIsLoading(true);

    // Simulating a POST request for accepting order
    try {
      // Replace the API_URL with your actual API endpoint
      const response = await fetch(ApprovedUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: order.order_id,
          status: "accept",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to accept order.");
      }

      setSuccessMessage("Order accepted successfully.");
    } catch (error) {
      setErrorMessage("Failed to accept order. Please try again.");
    }

    setIsLoading(false);
  };

  const handleRejectOrder = async () => {
    setIsLoading(true);

    // Simulating a POST request for cancelling order
    try {
      // Replace the API_URL with your actual API endpoint
      const response = await fetch(DeclineUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: order.order_id,
          status: "reject",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject order.");
      }

      setSuccessMessage("Order rejected successfully.");
    } catch (error) {
      setErrorMessage("Failed to reject order. Please try again.");
        }

    setIsLoading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Order Details</Text>
          <ScrollView>
            {selectedOrder && (
              <View style={styles.orderDetails}>
                {/* Existing order details */}
              </View>
            )}
            <View style={styles.commentContainer}>
              <Text style={styles.commentLabel}>Time:</Text>
              <TextInput
                style={styles.commentInput}
                value={timeText}
                onChangeText={setTimeText}
                placeholder="Enter time"
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitComment}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? "Submitting..." : "Submit"}
                </Text>
              </TouchableOpacity>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={handleAcceptOrder}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? "Accepting..." : "Accept Order"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={handleRejectOrder}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>Reject Order</Text>
                </TouchableOpacity>
              {successMessage !== "" && (
                <Text style={styles.successMessage}>{successMessage}</Text>
              )}
              {errorMessage !== "" && (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              )}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleModalClose}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create(OrderListStyle);

export default OrderActionModal;
