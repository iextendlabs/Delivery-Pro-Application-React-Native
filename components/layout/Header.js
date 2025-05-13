import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { ImageBackground } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Header({ title, notification }) {
  const [countNotification, setCountNotification] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notifications = await AsyncStorage.getItem("@notifications");
        if (notifications) {
          const parsedNotifications = JSON.parse(notifications);
          if (Array.isArray(parsedNotifications)) {
            const newNotificationCount = parsedNotifications.filter(
              (notification) => notification.type === "New"
            ).length;
            setCountNotification(newNotificationCount);
          }
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    // Initial fetch
    fetchNotifications();

    // Update notifications every 3 seconds
    const intervalId = setInterval(fetchNotifications, 3000);

    // Add a focus listener to refresh notifications
    const unsubscribe = navigation.addListener("focus", fetchNotifications);

    return () => {
      clearInterval(intervalId);
      unsubscribe();
    };
  }, [navigation]);

  return (
    <View
      style={{
        height: 80,
        backgroundColor: "#e4fbfb",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <ImageBackground
        source={require("../images/rotated_logo.png")}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 100,
          height: 100,
          zIndex: 1,
        }}
      />
      <View style={{ flex: 3 }}>
        <Text
          style={{
            fontWeight: "600",
            fontSize: 20,
            color: "#000",
            textAlign: "center",
          }}
        >
          {title}
        </Text>
      </View>
      {notification ? (
        <TouchableOpacity
          style={{
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            flex: 0.5,
          }}
          onPress={() => {
            navigation.navigate("Home");
          }}
        >
          <Image
            source={require("../images/home.png")}
            style={{
              width: 24,
              height: 24,
              tintColor: "#000",
            }}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={{
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            flex: 0.5,
          }}
          onPress={() => {
            navigation.navigate("Notification");
          }}
        >
          <Image
            source={require("../images/bell.png")}
            style={{
              width: 24,
              height: 24,
              tintColor: "#000",
            }}
          />
          <View
            style={{
              width: 20,
              height: 20,
              backgroundColor: "red",
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              top: -5, // Adjust this value to position the badge correctly
              right: 0,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              {countNotification}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({});
