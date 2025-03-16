import { StyleSheet, View } from "react-native";
import React, { useState, useEffect } from "react";
import { WebView } from "react-native-webview";
import { BaseUrl } from "../config/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DepositModal({ route }) {
  const [userId, setUserId] = useState("");
  const { planId, amount } = route.params || {}; // Handle undefined route.params

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem("@user_id");
      if (storedUserId) {
        setUserId(storedUserId);
      }
    };
    fetchUserId();
  }, []);

  // Construct the URL dynamically based on the presence of amount and planId
  const constructUrl = () => {
    let url = `${BaseUrl}stripe-staff-form?app=1&user_id=${userId}`;

    // Add amount if it exists
    if (amount !== undefined && amount !== null) {
      url += `&amount=${amount}`;
    }

    // Add planId if it exists
    if (planId !== undefined && planId !== null) {
      url += `&plan_id=${planId}`;
    }

    return url;
  };

  return (
    <View style={{ flex: 1 }}>
      {userId ? (
        <WebView
          source={{ uri: constructUrl() }}
          style={{ flex: 1 }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({}); 