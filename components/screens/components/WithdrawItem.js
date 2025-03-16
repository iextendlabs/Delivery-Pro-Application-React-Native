import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { format } from "date-fns";
import TransactionStyle from "../../styles/TransactionStyle";

const WithdrawItem = ({ item }) => {
  return (
    <View style={styles.item}>
      <Text style={styles.itemAmount}>${item.amount}</Text>
      <Text style={styles.itemType}>Transfer to {item.payment_method}</Text>
      <Text
        style={[
          styles.itemStatus,
          { color: item.status === "Approved" ? "#4caf50" : "#f19fa7" },
        ]}
      >
        {item.status}
      </Text>
      <Text style={styles.itemDate}>
        {format(new Date(item.created_at), "yyyy-MM-dd HH:mm")}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create(TransactionStyle);

export default WithdrawItem;
