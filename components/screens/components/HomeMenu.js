import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import HomeStyle from "../../styles/HomeStyle";

const HomeMenu = ({ navigation }) => {
  const [showPaymentSubmenu, setShowPaymentSubmenu] = useState(false);

  return (
    <View style={styles.menuContainer}>
      <View style={styles.menuItem}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("OrderList");
          }}
        >
          <View style={styles.menu}>
            <Image
              source={require("../../images/order.png")}
              style={styles.iconImage}
            />
          </View>
        </TouchableOpacity>
        <Text style={styles.iconLabel}>Today's Orders</Text>
      </View>

      <View style={styles.menuItem}>
        <TouchableOpacity
          onPress={() => setShowPaymentSubmenu(!showPaymentSubmenu)}
        >
          <View style={[styles.menu, { backgroundColor: "#a0c7ff" }]}>
            <Image
              source={require("../../images/payment.png")}
              style={styles.iconImage}
            />
          </View>
        </TouchableOpacity>
        <Text style={styles.iconLabel}>Payments</Text>

        {showPaymentSubmenu && (
          <View style={styles.submenu}>
            <TouchableOpacity
              onPress={() => {
                setShowPaymentSubmenu(false);
                navigation.navigate("Transactions");
              }}
              style={styles.submenuItem}
            >
              <Text style={styles.submenuText}>Transaction List</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowPaymentSubmenu(false);
                navigation.navigate("Withdraws");
              }}
              style={styles.submenuItem}
            >
              <Text style={styles.submenuText}>Withdraw List</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowPaymentSubmenu(false);
                navigation.navigate("DepositModal");
              }}
              style={styles.submenuItem}
            >
              <Text style={styles.submenuText}>Deposit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.menuItem}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Holidays");
          }}
        >
          <View style={[styles.menu]}>
            <Image
              source={require("../../images/holidays.png")}
              style={styles.iconImage}
            />
          </View>
        </TouchableOpacity>
        <Text style={styles.iconLabel}>Holidays</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create(HomeStyle);

export default HomeMenu;
