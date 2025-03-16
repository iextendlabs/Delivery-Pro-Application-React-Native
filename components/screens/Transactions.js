import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import Splash from "./Splash";
import { BaseUrl, GetTransactionsUrl } from "../config/Api";
import TransactionItem from "./components/TransactionItem";
import FilterModal from "./components/FilterModal";
import DatePickerModal from "./components/DatePickerModal";
import TransactionStyle from "../styles/TransactionStyle";

const Transactions = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [showPicker, setShowPicker] = useState({ visible: false, type: "" });
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setFromDate(new Date());
    setToDate(new Date());
    const userId = await AsyncStorage.getItem("@user_id");
    if (userId) {
      try {
        const response = await axios.get(
          `${GetTransactionsUrl}user_id=${userId}`
        );
        setTransactions(response.data.transactions);
        setFilteredTransactions(response.data.transactions);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
      setLoading(false);
    } else {
      navigation.navigate("Login");
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filterTransactions = () => {
    setLoading(true);

    const resetFromDate = new Date(fromDate);
    resetFromDate.setHours(0, 0, 0, 0);

    const resetToDate = new Date(toDate);
    resetToDate.setHours(23, 59, 59, 999);

    const filtered = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.created_at);
      return transactionDate >= resetFromDate && transactionDate <= resetToDate;
    });

    setFilteredTransactions(filtered);
    setLoading(false);
    setFilterModalVisible(false);
  };

  const resetFilter = () => {
    setFromDate(new Date());
    setToDate(new Date());
    setFilteredTransactions(transactions);
    setFilterModalVisible(false);
  };

  const showDatePicker = (type) => {
    setShowPicker({ visible: true, type });
  };

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      if (showPicker.type === "from") {
        setFromDate(selectedDate);
      } else {
        setToDate(selectedDate);
      }
    }
    setShowPicker({ visible: false, type: "" });
  };

  if (loading) {
    return <Splash />;
  }

  return (
    <View style={styles.container}>
      <Header title={"Transactions"} />
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Image
            source={require("../images/filter.png")}
            style={styles.filterIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetButton} onPress={resetFilter}>
          <Image
            source={require("../images/reset.png")}
            style={styles.filterIcon}
          />
        </TouchableOpacity>
      </View>

      {filteredTransactions.length === 0 ? (
        <Text style={styles.noItems}>There are no transactions</Text>
      ) : (
        <>
          {filteredTransactions.length !== transactions.length ? (
            <Text style={styles.filteredNote}>
              Showing filtered transactions
            </Text>
          ) : (
            <Text style={styles.filteredNote}></Text>
          )}
          <FlatList
            style={{ marginBottom: 60 }}
            data={filteredTransactions}
            renderItem={({ item }) => <TransactionItem item={item} />}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.itemList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </>
      )}

      <Footer />

      {/* Filter Modal */}
      <FilterModal
        filterModalVisible={filterModalVisible}
        setFilterModalVisible={setFilterModalVisible}
        fromDate={fromDate}
        toDate={toDate}
        showDatePicker={showDatePicker}
        filterTransactions={filterTransactions}
      />

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showPicker.visible}
        value={showPicker.type === "from" ? fromDate : toDate}
        onChange={handleDateChange}
      />
    </View>
  );
};

const styles = StyleSheet.create(TransactionStyle);

export default Transactions;