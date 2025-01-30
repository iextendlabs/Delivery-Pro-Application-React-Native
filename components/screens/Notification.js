import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { NotificationUrl } from "../config/Api";
import Header from "../layout/Header";
import Splash from "./Splash";

const Notification = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchNotifications();
    }, [])
  );

  useEffect(() => {
    setLoading(true);
    const intervalId = setInterval(() => {
      navigation.isFocused() && fetchNotifications();
    }, 3000); 
    return () => clearInterval(intervalId);
  }, []);

  const fetchNotifications = async () => {
    const userId = await AsyncStorage.getItem("@user_id");
    if (!userId) {
      navigation.navigate("Login");
      return;
    }

    try {
      const response = await axios.get(`${NotificationUrl}user_id=${userId}&update=true`);
      await AsyncStorage.setItem("@notifications", JSON.stringify(response.data.notifications));
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderNotification = ({ item }) => {
    return (
      <TouchableOpacity style={item.type === "New" ? styles.newNotification : styles.oldNotification}>
        <View style={{ flex: 1 }}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage}>{item.body}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <Splash />;
  }

  return (
    <View style={styles.container}>
      <Header title="Notifications" notification={true} />

      <Text style={styles.totalNotifications}>Total Notifications: {notifications.length}</Text>

      {successMessage !== "" && <Text style={styles.successText}>{successMessage}</Text>}
      {errorMessage !== "" && <Text style={styles.errorText}>{errorMessage}</Text>}

      {notifications.length === 0 ? (
        <Text style={styles.noNotificationsText}>No Notifications</Text>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingVertical: 10,
  },
  totalNotifications: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
    fontWeight: "bold",
    marginVertical: 8,
  },
  successText: {
    color: "#28a745",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 10,
  },
  errorText: {
    color: "#dc3545",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 10,
  },
  noNotificationsText: {
    color: "#6c757d",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
  },
  newNotification: {
    backgroundColor: "#d1ecf1",
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 6,
    elevation: 3,
  },
  oldNotification: {
    backgroundColor: "#f8d7da",
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 6,
    elevation: 3,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#555",
  },
});

export default Notification;
