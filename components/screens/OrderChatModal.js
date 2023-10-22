import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  Alert,
  FlatList,
} from "react-native";
import OrderListStyle from "../styles/OrderListStyle";
import { ScrollView } from "react-native-gesture-handler";
import { OrderChatUrl } from "../config/Api";
import { AddOrderChatUrl } from "../config/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const OrderChatModal = ({ visible, order, onClose }) => {
  const [selectedOrder, setSelectedOrder] = useState(order);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chats, setChat] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const handleModalClose = () => {
    onClose();
  };

  useEffect(() => {
    fetchChat();
  }, []);

  const fetchChat = async () => {

    setLoading(true);
    try {
      const response = await axios.get(`${OrderChatUrl}order_id=${selectedOrder.id}`);
      setChat(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  const handleSubmitChat = async () => {
    const userId = await AsyncStorage.getItem("@user_id");
    
    if (text.trim() === "") {
      setErrorMessage("Please enter a Text.");
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();

      formData.append("order_id", selectedOrder.id);
      formData.append("text", text);
      formData.append("user_id", userId);

      const response = await axios.post(AddOrderChatUrl, formData);

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

  const renderChat = async ({ item }) => {
    const userId = await AsyncStorage.getItem("@user_id");
    console.log(userId)
    let chatStyle = {};

    if (userId === item.user_id) {
      chatStyle = styles.userMessageContainer;
    } else {
      chatStyle = styles.otherMessageContainer;
    }
    return (
      <View style={chatStyle}>
      <View style={styles.messageBubble}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Chat</Text>
          {chats.length === 0 ? (
            <Text style={styles.noItemsText}>No Chat</Text>
          ) : (
            <FlatList
              data={chats}
              renderItem={renderChat}
              keyExtractor={(item) => item.id.toString()}
            />
          )}
          <ScrollView>
            {selectedOrder && (
              <View style={styles.orderDetails}>
                {/* Existing order details */}
              </View>
            )}
            <View style={styles.commentContainer}>
              <Text style={styles.label}>Comment:</Text>
              <TextInput
                style={styles.input}
                value={text}
                onChangeText={setText}
                placeholder="Enter your comment"
                multiline
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitChat}
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

export default OrderChatModal;
