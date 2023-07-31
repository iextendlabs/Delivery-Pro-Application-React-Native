import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";
import { OrderUrl } from "../config/Api";
import PhoneNumber from "../modules/PhoneNumber";
import { useRoute } from "@react-navigation/native";
import OrderLinks from "../modules/OrderLinks";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OrderListStyle from "../styles/OrderListStyle";
import OrderDetailsModal from "./OrderDetailsModal";
import OrderCommentModal from "./OrderCommentModal";
import OrderActionModal from "./OrderActionModal";
import OrderCashCollectionModal from "./OrderCashCollectionModal";
import Icon from "react-native-vector-icons/Ionicons";
import { OrderStatusUpdateUrl } from "../config/Api";
import LocationElement from "../modules/LocationElement";
import { formattedDateToday } from "../helpers/CommonHelper";

const OrderList = ({ initialParams }) => {
  const [orders, setOrders] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [cashCollectionModalVisible, setCashCollectionModalVisible] =
    useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const setSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage("");
    }, 2000);
  };

  const setError = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage("");
    }, 2000);
  };
  const route = useRoute();
  var status = "Pending";

  if (
    route &&
    route.constructor === Object &&
    "params" in route &&
    route.params &&
    "status" in route.params
  ) {
    status = route.params.status;
  }

  useEffect(() => {
    fetchOrders(status);
  }, [route.params?.status, initialParams]);

  const fetchOrders = async (orderStatus) => {
    const userId = await AsyncStorage.getItem("@user_id");
    if (userId) {
      setLoading(true);
      try {
        const response = await fetch(
          OrderUrl + "status=" + orderStatus + "&user_id=" + userId
        );
        const data = await response.json();

        // Get today's date in 'yyyy-mm-dd' format
        const todayDate = formattedDateToday;

        // Update the 'private' attribute based on the 'date' attribute
        const updatedData = data.map((order) => {
          return {
            ...order,
            private: (order.status !== 'Complete' && formattedDateToday === order.date),
            todays_order: formattedDateToday === order.date
          };
        });
        console.log(updatedData);
        setOrders(updatedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    } else {
      setLoading(false);
      navigation.navigate("Login");
    }
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity style={styles.orderContainer}>
      <View style={{ flex: 1.5 }}>
        <Text style={styles.orderId}>
          ID: {item.id} <Icon name="ios-calendar" size={15} color="black" />{" "}
          {item.date}{" "}
        </Text>
        <Text style={styles.orderDate}>{item.time_slot_value}</Text>
      </View>

      <View style={styles.OrderLinks}>
      {item.status !== 'Complete' && 
        
        <LocationElement
          latitude={item.latitude}
          longitude={item.longitude}
          address={
            item.buildingName +
            " " +
            item.street +
            "," +
            item.area +
            " " +
            item.city
          }
          />
        }
        {item.private && (
          <Icon
            name="eye"
            size={25}
            color="orange"
            style={styles.icons}
            onPress={() => handleOrderDetailPress(item)}
          />
        )}
        {status !== "Complete" && (
          <Icon
            name="chatbubble-ellipses-outline"
            size={25}
            color="brown"
            style={styles.icons}
            onPress={() => handleOrderCommentPress(item)}
          />
        )}
        {item.private && <PhoneNumber phoneNumber={item.number} />}
        {status === "Accepted"   && item.todays_order && (
          <Icon
            name="md-hourglass"
            size={25}
            color="orange" // Change this to your desired color for 'Accepted' status.
            style={styles.icons}
            onPress={() => handleInprogressOrder(item)}
          />
        )}
        {status === "Inprogress" && (
          <Icon
            name="md-checkmark-circle"
            size={25}
            color="green" // Change this to your desired color for 'Inprogress' status.
            style={styles.icons}
            onPress={() => handleCompleteOrder(item)}
          />
        )}
        {status === "Pending" && (
          <Icon
            name="ellipsis-vertical"
            size={25}
            color="blue" // Change this to your desired color for 'Pending' status.
            style={styles.icons}
            onPress={() => handleOrderActionPress(item)}
          />
        )}
        {status == "Complete" && (
          <Icon
            name="cash-outline"
            size={25}
            color={item.cash_status ? "green" : "orange"}
            style={styles.icons}
            onPress={() => handleOrderCashCollection(item)}
          />
        )}
      </View>

      {/* Other order fields */}
    </TouchableOpacity>
  );

  const handleInprogressOrder = async (order) => {
    setLoading(true);

    try {
      const response = await fetch(
        OrderStatusUpdateUrl + order.id + "?status=Inprogress"
      );

      if (!response.ok) {
        throw new Error("Failed to Inprogress order.");
      }

      setSuccess("Order Inprogress successfully.");
    } catch (error) {
      setError("Failed to Inprogress order. Please try again.");
    }

    setLoading(false);
  };

  const handleCompleteOrder = async (order) => {
    setLoading(true);

    try {
      const response = await fetch(
        OrderStatusUpdateUrl + order.id + "?status=Complete"
      );

      if (!response.ok) {
        throw new Error("Failed to Complete order.");
      }

      setSuccess("Order Complete successfully.");
    } catch (error) {
      setError("Failed to Complete order. Please try again.");
    }

    setLoading(false);
  };

  const handleOrderDetailPress = (order) => {
    setSelectedOrder(order);
    setDetailsModalVisible(true);
  };

  const handleOrderCommentPress = (order) => {
    setSelectedOrder(order);
    setCommentModalVisible(true);
  };

  const handleOrderActionPress = (order) => {
    setSelectedOrder(order);
    setActionModalVisible(true);
  };

  const handleOrderCashCollection = (order) => {
    setSelectedOrder(order);
    setCashCollectionModalVisible(true);
  };

  const closeModal = () => {
    setDetailsModalVisible(false);
    setCommentModalVisible(false);
    setActionModalVisible(false);
    setCashCollectionModalVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <OrderLinks />
      <Text style={styles.orderText}>Order Status: {status}</Text>
      <Text style={styles.orderText}>Total Orders: {orders.length}</Text>
      {successMessage !== "" && (
        <Text style={styles.successMessage}>{successMessage}</Text>
      )}
      {errorMessage !== "" && (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      )}
      {orders.length === 0 ? (
        <Text style={styles.noItemsText}>No Order</Text>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id.toString()}
        />
      )}

      <OrderDetailsModal
        visible={detailsModalVisible}
        order={selectedOrder}
        onClose={closeModal}
      />

      <OrderCommentModal
        visible={commentModalVisible}
        order={selectedOrder}
        onClose={closeModal}
      />

      <OrderActionModal
        visible={actionModalVisible}
        order={selectedOrder}
        onClose={closeModal}
      />

      <OrderCashCollectionModal
        visible={cashCollectionModalVisible}
        order={selectedOrder}
        onClose={closeModal}
      />
    </View>
  );
};

const styles = StyleSheet.create(OrderListStyle);

export default OrderList;
