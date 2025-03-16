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
import { BaseUrl, GetWithdrawsUrl } from "../config/Api";
import CommonButton from "../common/CommonButton";
import WithdrawItem from "./components/WithdrawItem";
import FilterModal from "./components/FilterModal";
import DatePickerModal from "./components/DatePickerModal";
import TransactionStyle from "../styles/TransactionStyle";

const Withdraws = ({ navigation }) => {
  const [withdraws, setWithdraws] = useState([]);
  const [filteredWithdraws, setFilteredWithdraws] = useState([]);
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
        const response = await axios.get(`${GetWithdrawsUrl}user_id=${userId}`);
        setWithdraws(response.data.withdraws);
        setFilteredWithdraws(response.data.withdraws);
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

  const filterWithdraws = () => {
    setLoading(true);

    const resetFromDate = new Date(fromDate);
    resetFromDate.setHours(0, 0, 0, 0);

    const resetToDate = new Date(toDate);
    resetToDate.setHours(23, 59, 59, 999);

    const filtered = withdraws.filter((withdraw) => {
      const withdrawDate = new Date(withdraw.created_at);
      return withdrawDate >= resetFromDate && withdrawDate <= resetToDate;
    });

    setFilteredWithdraws(filtered);
    setLoading(false);
    setFilterModalVisible(false);
  };

  const resetFilter = () => {
    setFromDate(new Date());
    setToDate(new Date());
    setFilteredWithdraws(withdraws);
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
      <Header title={"Withdraws"} />
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

      <CommonButton
        title={"Withdraw Amount"}
        bgColor={"#fd245f"}
        textColor={"#fff"}
        onPress={() => navigation.navigate("WithdrawModal")}
      />

      {/* No Withdraws Message */}
      {filteredWithdraws.length === 0 ? (
        <Text style={styles.noItems}>There are no withdraws</Text>
      ) : (
        <>
          {filteredWithdraws.length !== withdraws.length ? (
            <Text style={styles.filteredNote}>Showing filtered withdraws</Text>
          ) : (
            <Text style={styles.filteredNote}></Text>
          )}
          <FlatList
            style={{ marginBottom: 60 }}
            data={filteredWithdraws}
            renderItem={({ item }) => <WithdrawItem item={item} />}
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
        filterTransactions={filterWithdraws}
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

export default Withdraws;
