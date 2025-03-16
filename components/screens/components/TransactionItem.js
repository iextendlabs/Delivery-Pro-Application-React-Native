import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { format } from "date-fns";
import TransactionStyle from "../../styles/TransactionStyle";

const TransactionItem = ({ item }) => {
  return (
    <View style={styles.item}>
      <Text style={styles.itemType}>{item.type ?? "NA"}</Text>
      <Text style={styles.itemAmount}>${item.amount}</Text>
      {item.description && (
        <Text style={styles.itemAmount}>{item.description}</Text>
      )}
      <Text style={styles.itemStatus}>{item.status}</Text>
      <Text style={styles.itemDate}>
        {format(new Date(item.created_at), "yyyy-MM-dd HH:mm")}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create(TransactionStyle);

export default TransactionItem;
