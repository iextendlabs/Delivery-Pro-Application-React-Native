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

const Orders = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [showPicker, setShowPicker] = useState({ visible: false, type: "" });

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
  };

  const resetFilter = () => {
    setFromDate(new Date());
    setToDate(new Date());
    setFilteredOrders(orders);
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

      {/* Date Filter Section */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Filter by Date</Text>

        {/* From Date */}
        <View style={styles.dateTimeContainer}>
          <Text style={styles.label}>From Date:</Text>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => showDatePicker("from")}
          >
            <Text style={styles.dateTimeText}>
              {format(fromDate, "yyyy-MM-dd")}
            </Text>
            <Image
              style={styles.icon}
              source={require("../images/calendar.png")}
            />
          </TouchableOpacity>
        </View>

        {/* To Date */}
        <View style={styles.dateTimeContainer}>
          <Text style={styles.label}>To Date:</Text>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => showDatePicker("to")}
          >
            <Text style={styles.dateTimeText}>
              {format(toDate, "yyyy-MM-dd")}
            </Text>
            <Image
              style={styles.icon}
              source={require("../images/calendar.png")}
            />
          </TouchableOpacity>
        </View>

        {/* Filter and Reset Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={filterOrders} style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Apply Filter</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={resetFilter} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
        <CommonButton
        title={"Today's Orders"}
        bgColor={"#fd245f"}
        textColor={"#fff"}
        onPress={() => navigation.navigate("OrderList")}
      />
      </View>
      
      {filteredOrders.length !== orders.length && (
        <Text style={styles.filteredNote}>Showing filtered orders</Text>
      )}

      {/* No Orders Message */}
      {filteredOrders.length === 0 ? (
        <Text style={styles.noOrders}>There are no orders</Text>
      ) : (
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
      )}

      <Footer />

      {/* Date Picker Modal */}
      {showPicker.visible && (
        <DateTimePicker
          value={showPicker.type === "from" ? fromDate : toDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e4fbfb",
    paddingTop: 20,
  },
  filterContainer: {
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 5,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  dateTimeContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    justifyContent: "space-between",
    elevation: 2,
  },
  dateTimeText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  icon: {
    width: 22,
    height: 22,
    tintColor: "#24a0ed",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#555",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterButton: {
    backgroundColor: "#24a0ed",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  filterButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  resetButton: {
    backgroundColor: "#d9534f",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginLeft: 10,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  orderList: {
    paddingHorizontal: 20,
  },
  orderItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginVertical: 8,
    elevation: 3,
  },
  orderType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  orderAmount: {
    fontSize: 14,
    color: "#24a0ed",
    marginVertical: 5,
  },
  orderDescription: {
    fontSize: 14,
    color: "#777",
    marginVertical: 5,
  },
  orderStatus: {
    fontSize: 12,
    color: "#4caf50",
  },
  orderDate: {
    fontSize: 12,
    color: "#777",
  },
  filteredNote: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "blue",
    marginBottom: 10,
  },
  noOrders: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#777",
    marginTop: 20,
  },
});

export default Orders;
