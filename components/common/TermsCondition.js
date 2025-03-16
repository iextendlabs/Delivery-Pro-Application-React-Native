import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { WebView } from "react-native-webview";
import { BaseUrl } from "../config/Api";

export default function TermsCondition() {
  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: BaseUrl+"termsCondition?staff=1&app=true" }}
        style={{ flex: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
