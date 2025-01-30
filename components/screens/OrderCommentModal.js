import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, TextInput, Alert } from "react-native";
import PhoneNumber from "../modules/PhoneNumber";
import OrderListStyle from "../styles/OrderListStyle";
import { ScrollView } from "react-native-gesture-handler";
import { OrderCommentUrl } from "../config/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const OrderCommentModal = ({ visible, order, onClose }) => {

  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleModalClose = () => {
    setErrorMessage("");
    setSuccessMessage("");
    setCommentText("");
    onClose();
  };

  const handleSubmitComment = async () => {

    if (commentText.trim() === "") {
      setErrorMessage("Please enter a comment.");
      return;
    }

    setIsLoading(true);
    const userId = await AsyncStorage.getItem("@user_id");
    try {
      
      const response = await axios.post(OrderCommentUrl,{
        order_id: order.id,
        comment: commentText,
        user_id: userId,
      });

      if (response.status === 200) {
        setSuccessMessage("Comment posted successfully.");
        setCommentText("");
      } else {
        throw new Error("Failed to post comment.");
      }
    } catch (error) {
      setErrorMessage("Failed to post comment. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Order Comment</Text>
          <ScrollView>
            <View style={styles.commentContainer}>
              <Text style={styles.label}>Comment:</Text>
              <TextInput
                style={styles.input}
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Enter your comment"
                multiline
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitComment}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? "Submitting..." : "Save"}
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

export default OrderCommentModal;
