import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
  AppState,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OrderListStyle from "../styles/OrderListStyle";
import Icon from "react-native-vector-icons/Ionicons";
import { NotificationUrl } from "../config/Api";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import axios from "axios";

const Notification = () => {
  const [notification, setNotification] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const setSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage("");
    }, 2000);
  };

  const setError = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage("");
    }, 2000);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchNotification();
    }, [])
  );
  useEffect(() => {
    setLoading(true);
    const reloadApp = () => {
      navigation.isFocused() && fetchNotification();
    };
    const intervalId = setInterval(reloadApp, 10000); // Reload every 2 seconds
    return () => clearInterval(intervalId);
  }, []);

  const fetchNotification = async () => {
    const userId = await AsyncStorage.getItem("@user_id");
    if (userId) {
      try {
        const response = await axios.get(`${NotificationUrl}user_id=${userId}`);
        setNotification(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching notification:", error);
      }
    } else {
      navigation.navigate("Login");
    }
  };

  const renderNotification = ({ item }) => {
    const notificationContainer =
      item.type === "New"
        ? styles.newNotificationContainer
        : styles.oldNotificationContainer;

    return (
      <TouchableOpacity style={notificationContainer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heading}>{item.title}</Text>
          <Text style={styles.text}>{item.body}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.orderText}>
        Total Notification: {notification.length}
      </Text>
      {successMessage !== "" && (
        <Text style={styles.successMessage}>{successMessage}</Text>
      )}
      {errorMessage !== "" && (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      )}
      {notification.length === 0 ? (
        <Text style={styles.noItemsText}>No Notification</Text>
      ) : (
        <FlatList
          data={notification}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create(OrderListStyle);

export default Notification;
