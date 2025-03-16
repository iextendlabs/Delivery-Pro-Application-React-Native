import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Linking,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function Footer() {
  const navigation = useNavigation();
  const route = useRoute();
  const [showSubMenu, setShowSubMenu] = useState(false);

  const toggleSubMenu = () => {
    setShowSubMenu(!showSubMenu);
  };

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
          onPress={toggleSubMenu}
        >
          <Image
            source={require("../images/payment.png")}
            style={{
              width: 24,
              height: 24,
              tintColor: route.name == "Payment" ? "#000" : "#8e8e8e",
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
            source={require("../images/quote.png")}
            style={{
              width: 24,
              height: 24,
              tintColor: route.name == "Holidays" ? "#000" : "#8e8e8e",
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

      {showSubMenu && (
        <View
          style={{
            position: "absolute",
            bottom: 60,
            left: "20%",
            width: "60%",
            backgroundColor: "#fff",
            borderRadius: 5,
            elevation: 3,
            padding: 10,
          }}
        >
          <TouchableOpacity
            style={styles.subMenuItem}
            onPress={() => {
              navigation.navigate("Transactions");
              setShowSubMenu(false);
            }}
          >
            <Text>Transactions List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.subMenuItem}
            onPress={() => {
              navigation.navigate("Withdraws");
              setShowSubMenu(false);
            }}
          >
            <Text>Withdraw List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.subMenuItem}
            onPress={() => {
              navigation.navigate("DepositModal");
              setShowSubMenu(false);
            }}
          >
            <Text>Deposit</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  subMenuItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
