import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Linking,
} from "react-native";
import React from "react";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function Footer() {
  const navigation = useNavigation();
  const route = useRoute();

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          width: "100%",
          height: 60,
          backgroundColor: "#e4fbfb",
          position: "absolute",
          bottom: 0,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          style={{
            width: "20%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
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
              tintColor: route.name == "Home" ? "#000" : "#8e8e8e",
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: "20%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => {
            navigation.navigate("Transactions");
          }}
        >
          <Image
            source={require("../images/transaction.png")}
            style={{
              width: 24,
              height: 24,
              tintColor: route.name == "Transactions" ? "#000" : "#8e8e8e",
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: "20%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => {
            navigation.navigate("Withdraws");
          }}
        >
          <Image
            source={require("../images/withdraw.png")}
            style={{
              width: 24,
              height: 24,
              tintColor: route.name == "Withdraws" ? "#000" : "#8e8e8e",
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: "20%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => {
            navigation.navigate("Orders");
          }}
        >
          <Image
            source={require("../images/order.png")}
            style={{
              width: 24,
              height: 24,
              tintColor: route.name == "Orders" ? "#000" : "#8e8e8e",
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: "20%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => {
            navigation.navigate("Holidays");
          }}
        >
          <Image
            source={require("../images/holidays.png")}
            style={{
              width: 24,
              height: 24,
              tintColor: route.name == "Holidays" ? "#000" : "#8e8e8e",
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});
