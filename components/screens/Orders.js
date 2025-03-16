import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  RefreshControl,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import Splash from "./Splash";
import { GetStaffOrdersUrl } from "../config/Api";
import { format } from "date-fns";
import CommonButton from "../common/CommonButton";
import OrderStyle from "../styles/OrderStyle";
import FilterModal from "./components/FilterModal";
import DatePickerModal from "./components/DatePickerModal";

const Orders = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
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
          `${GetStaffOrdersUrl}user_id=${userId}`
        );
        setOrders(response.data.orders);
        setFilteredOrders(response.data.orders);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    } else {
      navigation.navigate("Login");
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filterOrders = () => {
    setLoading(true);

    const resetFromDate = new Date(fromDate);
    resetFromDate.setHours(0, 0, 0, 0);

    const resetToDate = new Date(toDate);
    resetToDate.setHours(23, 59, 59, 999);

    const filtered = orders.filter((order) => {
      const orderDate = new Date(order.created_at);
      return orderDate >= resetFromDate && orderDate <= resetToDate;
    });

    setFilteredOrders(filtered);
    setLoading(false);
    setFilterModalVisible(false);
  };

  const resetFilter = () => {
    setFromDate(new Date());
    setToDate(new Date());
    setFilteredOrders(orders);
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

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <Text style={styles.orderType}>#{item.id ?? "NA"}</Text>
      <Text style={styles.orderAmount}>AED{item.total_amount}</Text>
      <Text style={styles.orderStatus}>{item.status}</Text>
      <Text>{item.time_slot_value}</Text>
      <Text>{item.date}</Text>
      <Text style={styles.orderDate}>
        {format(new Date(item.created_at), "yyyy-MM-dd HH:mm")}
      </Text>
    </View>
  );

  if (loading) {
    return <Splash />;
  }

  return (
    <View style={styles.container}>
      <Header title={"Orders"} />
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
        title={"Today's Orders"}
        bgColor={"#fd245f"}
        textColor={"#fff"}
        onPress={() => navigation.navigate("OrderList")}
      />

      {/* No Orders Message */}
      {filteredOrders.length === 0 ? (
        <Text style={styles.noOrders}>There are no orders</Text>
      ) : (
        <>
          {filteredOrders.length !== orders.length ? (
            <Text style={styles.filteredNote}>Showing filtered orders</Text>
          ) : (
            <Text style={styles.filteredNote}></Text>
          )}
          <FlatList
            style={{ marginBottom: 60 }}
            data={filteredOrders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.orderList}
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
        filterTransactions={filterOrders}
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

const styles = StyleSheet.create(OrderStyle);

export default Orders;
