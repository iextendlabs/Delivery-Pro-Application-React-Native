import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { OrderUrl } from "../config/Api";
import { useRoute } from "@react-navigation/native";
import OrderLinks from "../modules/OrderLinks";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OrderListStyle from "../styles/OrderListStyle";
import OrderDetailsModal from "./OrderDetailsModal";
import OrderCommentModal from "./OrderCommentModal";
import OrderActionModal from "./OrderActionModal";
import DriverOrderStatusModal from "./DriverOrderStatusModal";
import OrderChatModal from "./OrderChatModal";
import OrderCashCollectionModal from "./OrderCashCollectionModal";
import Icon from "react-native-vector-icons/Ionicons";
import { OrderStatusUpdateUrl } from "../config/Api";
import LocationElement from "../modules/LocationElement";
import WhatsAppElement from "../modules/WhatsappElement";
import axios from "axios";
import { useNavigation } from '@react-navigation/native';

const OrderList = ({ initialParams }) => {
  const [orders, setOrders] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [driverModalVisible, setDriverModalVisible] = useState(false);
  const [orderChatModalVisible, setOrderChatModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [cashCollectionModalVisible, setCashCollectionModalVisible] =
    useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notification, setNotification] = useState('');
  const navigation = useNavigation();

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
    setLoading(true);
    fetchOrders(status);
    setLoading(false);

    const reloadApp = () => {
      fetchOrders(status);
    };

    const intervalId = setInterval(reloadApp, 60000); // Reload every 2 seconds

    return () => clearInterval(intervalId);
  }, [route.params?.status, initialParams]);

  const fetchOrders = async (orderStatus) => {
    const userId = await AsyncStorage.getItem("@user_id");
    if (userId) {
      try {
        const response = await axios.get(
          `${OrderUrl}status=${orderStatus}&user_id=${userId}`
        );
        const data = await response.json();
        setOrders(data.orders);
        setNotification(data.notification)
        console.log(orders);
        console.log(notification);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    } else {
      navigation.navigate("Login");
    }
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity style={styles.orderContainer}>
      <View style={{ flex: 1 }}>
        <Text style={styles.orderId}>
          ID: {item.id} <Icon name="ios-calendar" size={15} color="black" />{" "}
          {item.date}{" "}
        </Text>
        <Text style={styles.orderDate}>{item.time_slot_value}</Text>
        <Text style={styles.orderDate}>
          <Icon name="ios-car" size={15} color="black" />
          {item.driver_status}
        </Text>
      </View>

      <View style={styles.OrderLinks}>
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
        <Icon
          name="eye"
          size={25}
          color="orange"
          style={styles.icons}
          onPress={() => handleOrderDetailPress(item)}
        />
        <Icon
          name="chatbubble"
          size={25}
          color="blue" // Change this to your desired color for 'Pending' status.
          style={styles.icons}
          onPress={() => handleOrderChatStatus(item)}
        />
        {status === "Accepted" && item.driver_status === "Pending" && (
          <Icon
            name="ios-car"
            size={25}
            color="blue" // Change this to your desired color for 'Pending' status.
            style={styles.icons}
            onPress={() => handleDriverOrderStatus(item)}
          />
        )}
        {status !== "Complete" && (
          <Icon
            name="chatbubble-ellipses-outline"
            size={25}
            color="black"
            style={styles.icons}
            onPress={() => handleOrderCommentPress(item)}
          />
        )}
        <WhatsAppElement showNumber={false} phoneNumber={item.whatsapp} />
        {status === "Accepted" && (
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
        {status === "Complete" && item.driver_status === "Dropped" && (
          <Icon
            name="ios-car"
            size={25}
            color="blue" // Change this to your desired color for 'Pending' status.
            style={styles.icons}
            onPress={() => handleDriverOrderStatus(item)}
          />
        )}
      </View>

      {/* Other order fields */}
    </TouchableOpacity>
  );

  const handleInprogressOrder = async (order) => {
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("order_id", order.id);
      formData.append("status", "Inprogress");

      const response = await axios.post(OrderStatusUpdateUrl, formData);

      if (response.status === 200) {
        setSuccess("Order Inprogress successfully.");
        fetchOrders("Accepted");
      } else {
        throw new Error("Failed to Inprogress order.");
      }
    } catch (error) {
      setError("Failed to Inprogress order. Please try again.");
    }

    setLoading(false);
  };

  const handleCompleteOrder = async (order) => {
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("order_id", order.id);
      formData.append("status", "Complete");

      const response = await axios.post(OrderStatusUpdateUrl, formData);

      if (response.status === 200) {
        setSuccess("Order Complete successfully.");
        fetchOrders("Inprogress");
      } else {
        throw new Error("Failed to Complete order.");
      }
    } catch (error) {
      setError("Failed to Complete order. Please try again.");
    }

    setLoading(false);
  };

  const handleOrderDetailPress = (order) => {
    setSelectedOrder(order);
    setDetailsModalVisible(true);
  };

  const handleOrderChatStatus = (order) => {
    setSelectedOrder(order.id);
    setOrderChatModalVisible(true);
  };
  const handleDriverOrderStatus = (order) => {
    setSelectedOrder(order.id);
    setDriverModalVisible(true);
  };
  const handleOrderCommentPress = (order) => {
    setSelectedOrder(order.id);
    setCommentModalVisible(true);
  };

  const handleOrderActionPress = (order) => {
    setSelectedOrder(order);
    setActionModalVisible(true);
  };

  const handleOrderCashCollection = (order) => {
    if (order.cash_status) {
      setCashCollectionModalVisible(false);
    } else {
      setSelectedOrder(order);
      setCashCollectionModalVisible(true);
    }
  };

  const closeModal = () => {
    setDetailsModalVisible(false);
    setDriverModalVisible(false);
    setOrderChatModalVisible(false);
    setCommentModalVisible(false);
    setActionModalVisible(false);
    setCashCollectionModalVisible(false);
    fetchOrders(status);
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

      <OrderChatModal
        visible={orderChatModalVisible}
        order={selectedOrder}
        onClose={closeModal}
      />

      <DriverOrderStatusModal
        visible={driverModalVisible}
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
