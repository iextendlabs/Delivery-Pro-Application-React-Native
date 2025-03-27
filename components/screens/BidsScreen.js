import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  Pressable,
  Linking,
  FlatList,
  ActivityIndicator, // Import Linking
} from "react-native";
import axios from "axios";
import { BaseUrl } from "../config/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Splash from "./Splash";
import BidStyle from "../styles/BidStyle";
import CustomTextInput from "../common/CustomTextInput";
import CommonButton from "../common/CommonButton";
import LocationElement from "../modules/LocationElement";
import * as Location from "expo-location";

const BidsScreen = () => {
  const route = useRoute();
  const { quoteId } = route.params;

  const [bid, setBid] = useState(null);
  const [bidId, setBidId] = useState("");
  const [newBidAmount, setNewBidAmount] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [userId, setUserId] = useState("");
  const [bidImages, setBidImages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isSubmit, setIsSubmit] = useState(false);
  const [showBidContainer, setShowBidContainer] = useState(false);
  const [isUpdatingBid, setIsUpdatingBid] = useState(false);
  const [updatedBidAmount, setUpdatedBidAmount] = useState("");

  const scrollViewRef = useRef();

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const fetchQuoteAndBid = async () => {
    setLoading(true);
    try {
      const user = await AsyncStorage.getItem("@user_id");
      setUserId(user);

      const response = await axios.get(
        `${BaseUrl}api/quote/${quoteId}/bid/${user}`
      );

      if (response.data.quote) {
        setBid(response.data.bid || null);
        setBidImages(response.data.images || []);
        if (response.data.bid?.id) {
          fetchChat(response.data.bid.id);
          setBidId(response.data.bid.id);
        }
      }
    } catch (error) {
      console.log("Error", "Failed to fetch quote and bid details.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bid?.id) {
      fetchChat(bid.id);
      const interval = setInterval(() => fetchChat(bid.id), 3000);
      return () => clearInterval(interval);
    }
  }, [bid?.id]);

  const fetchChat = async (bidId = null) => {
    bidId = bidId ?? bid?.id ?? null;
    if (bidId) {
      try {
        const messagesResponse = await axios.get(
          `${BaseUrl}api/bid-chat/${bidId}/messages`
        );
        setMessages(messagesResponse.data);
      } catch (error) {
        console.log("Error", "Failed to fetch data.");
      }
    }
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    fetchQuoteAndBid();
  }, []);

  const handleSubmitBid = async () => {
    if (!newBidAmount || isNaN(newBidAmount)) {
      Alert.alert("Error", "Please enter a valid bid amount.");
      return;
    }
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("quote_id", quoteId);
      formData.append("staff_id", userId);
      formData.append("bid_amount", newBidAmount);
      formData.append("comment", comment);

      images.forEach((image, index) => {
        formData.append("images[]", {
          uri: image.uri,
          name: `image_${index}.jpg`,
          type: "image/jpeg",
        });
      });

      const response = await axios.post(
        `${BaseUrl}api/bid/${quoteId}/bid/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200) {
        Alert.alert("Success", "Bid submitted successfully.");
        fetchQuoteAndBid();
      }
    } catch (error) {
      console.log("Error", "Failed to submit bid.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Please allow access to your photos.");
      return;
    }
    setLoading(true);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImages = result.assets.map((asset) => ({
        uri: asset.uri,
      }));
      setImages([...images, ...selectedImages]);
    }
    setLoading(false);
  };

  const handleImagePress = (index) => {
    setSelectedImageIndex(index);
    setModalVisible(true);
  };

  const handleNextImage = () => {
    if (selectedImageIndex < bidImages.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const handlePreviousImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const handleRemoveImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
    });

    if (!result.cancelled) {
      sendMessage(result.assets[0].uri, null);
    }
  };

  const handleLocation = async () => {
    setIsSubmit(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const locationString = `${latitude},${longitude}`;

      sendMessage(null, locationString);
    } catch (error) {
      setIsSubmit(false);
      console.error("Error getting location:", error);
    }
  };

  const sendMessage = async (imageUri = null, location = null) => {
    if (!message.trim() && !imageUri && !location) return;
    setIsSubmit(true);
    const formData = new FormData();
    formData.append("sender_id", userId);
    if (imageUri) {
      const fileType = imageUri.split(".").pop();
      formData.append("file", {
        uri: imageUri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      });
    } else if (location) {
      formData.append("message", location);
      formData.append("location", true);
    } else {
      formData.append("message", message);
    }

    try {
      await axios.post(`${BaseUrl}api/bid-chat/${bidId}/send`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage(""); // Clear input
      fetchChat(bidId);
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setIsSubmit(false);
  };

  const handleSaveBid = async () => {
    if (!updatedBidAmount) return;
    setLoading(true);
    try {
      const response = await axios.post(`${BaseUrl}api/bid/${bidId}/update`, {
        user_id: userId,
        bid_amount: updatedBidAmount,
      });
      if (response.status === 200) {
        setUpdatedBidAmount("");
        fetchQuoteAndBid();
      } else {
        throw new Error("Failed to Accepted order.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setIsUpdatingBid(false);
    setLoading(false);
  };
  if (loading) return <Splash />;

  return (
    <View style={styles.container}>
      {bid ? (
        <>
          <View style={styles.header}>
            <Text style={styles.headerText}>Bid Chat</Text>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setShowBidContainer(!showBidContainer)}
            >
              <Ionicons
                name={showBidContainer ? "eye-off" : "eye"}
                size={20}
                color="#fff"
              />
              <Text style={styles.toggleButtonText}>
                {showBidContainer ? " Hide Bid Details" : " Show Bid Details"}
              </Text>
            </TouchableOpacity>
          </View>
          {/* Your Current Bid Section */}
          {showBidContainer && bid && (
            <View style={styles.bidContainer}>
              <Text style={styles.bidTitle}>Your Current Bid</Text>
              <Text style={styles.bidDetail}>
                <Text style={styles.bidLabel}>Amount:</Text> AED{bid.bid_amount}
              </Text>
              <Text style={styles.bidDetail}>
                <Text style={styles.bidLabel}>Comment:</Text>{" "}
                {bid.comment || "No comment"}
              </Text>

              {/* Input Field for Updating Bid Amount */}
              {isUpdatingBid ? (
                <View>
                  <CustomTextInput
                    placeholder={"Enter new bid amount"}
                    value={updatedBidAmount}
                    keyboardType="numeric"
                    onChangeText={(txt) => {
                      setUpdatedBidAmount(txt);
                    }}
                  />

                  <CommonButton
                    disabled={loading}
                    title="Save"
                    bgColor="#fd245f"
                    textColor="#fff"
                    onPress={handleSaveBid}
                  />

                  <CommonButton
                    disabled={loading}
                    title="Close"
                    bgColor="#000"
                    textColor="#fff"
                    onPress={() => {
                      setIsUpdatingBid(false);
                      setUpdatedBidAmount("");
                    }}
                  />
                </View>
              ) : (
                <CommonButton
                  disabled={loading}
                  title="Update Bid"
                  bgColor="#fd245f"
                  textColor="#fff"
                  onPress={() => setIsUpdatingBid(true)}
                />
              )}

              {/* Bid Images */}
              {bid.images && bid.images.length > 0 && (
                <FlatList
                  data={bid.images}
                  horizontal
                  keyExtractor={(item) => item.id.toString()}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleImagePress(index)}
                    >
                      <Image
                        source={{
                          uri: `${BaseUrl}quote-images/bid-images/${item.image}`,
                        }}
                        style={styles.bidImage}
                      />
                    </TouchableOpacity>
                  )}
                  contentContainerStyle={styles.bidImagesContainer}
                />
              )}
            </View>
          )}

          <ScrollView
            style={styles.chatBox}
            showsVerticalScrollIndicator={false}
            ref={scrollViewRef}
            onContentSizeChange={() =>
              scrollViewRef.current.scrollToEnd({ animated: true })
            }
          >
            {messages.map((msg, index) => (
              <View
                key={index}
                style={[
                  styles.messageContainer,
                  msg.sender_id == userId
                    ? styles.senderMessage
                    : styles.receiverMessage,
                ]}
              >
                <Text style={styles.messageText}>
                  <Text style={styles.senderName}>{msg.sender.name}: </Text>
                  {msg.file == 1 ? (
                    <Text>
                      📎{" "}
                      <Text
                        style={styles.linkText}
                        onPress={() =>
                          Linking.openURL(
                            `${BaseUrl}quote-images/bid-chat-files/${msg.message}`
                          )
                        }
                      >
                        View File
                      </Text>
                    </Text>
                  ) : msg.location == 1 ? ( // <-- Fixed nested ternary here
                    (() => {
                      // Split the message into latitude and longitude
                      const [latitude, longitude] = msg.message.split(",");
                      return (
                        <LocationElement
                          latitude={latitude.trim()} // Trim to remove spaces
                          longitude={longitude.trim()}
                          address={""}
                          showAddress={false}
                        />
                      );
                    })()
                  ) : (
                    <Text>{msg.message}</Text> // <-- Wrapped text in <Text> to avoid errors
                  )}
                </Text>
              </View>
            ))}
          </ScrollView>
          {/* Chat Input */}
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.attachmentButton}
              onPress={pickImage}
              disabled={isSubmit}
            >
              <Ionicons name="attach" size={20} color={isSubmit ? "#ccc" : "#28a745"} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.attachmentButton}
              onPress={handleLocation}
              disabled={isSubmit}
            >
              <Ionicons name="location" size={20} color={isSubmit ? "#ccc" : "#28a745"} />
            </TouchableOpacity>

            <TextInput
              style={styles.chatInput}
              placeholder="Type a message..."
              value={message}
              onChangeText={setMessage}
            />
            <TouchableOpacity
              style={[styles.sendButton, isSubmit && styles.disabledButton]}
              onPress={() => sendMessage()}
              disabled={isSubmit}
            >
              {isSubmit ? (
                <ActivityIndicator size="small" color="#fff" /> // Show loader when submitting
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.bidForm}>
          <TextInput
            style={styles.input}
            placeholder="Enter bid amount"
            value={newBidAmount}
            onChangeText={setNewBidAmount}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Leave a comment (optional)"
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleImageUpload}
          >
            <Text style={styles.uploadButtonText}>📎 Upload Images</Text>
          </TouchableOpacity>
          <View style={styles.imagePreviewContainer}>
            {images.map((image, index) => (
              <View key={index} style={styles.previewImageWrapper}>
                <Image
                  source={{ uri: image.uri }}
                  style={styles.previewImage}
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitBid}
          >
            <Text style={styles.submitButtonText}>Submit Bid</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable
            style={styles.modalBackground}
            onPress={() => setModalVisible(false)}
          >
            <Image
              source={{
                uri: `${BaseUrl}quote-images/bid-images/${bidImages[selectedImageIndex]?.image}`,
              }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </Pressable>
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              onPress={handlePreviousImage}
              style={styles.navButton}
            >
              <Ionicons name="chevron-back" size={32} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNextImage}
              style={styles.navButton}
            >
              <Ionicons name="chevron-forward" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create(BidStyle);

export default BidsScreen;
