import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { OrderUrl, OrderStatusUpdateUrl } from "../config/Api";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import OrderListItem from "./components/OrderListItem";
import OrderDetailsModal from "./OrderDetailsModal";
import OrderCommentModal from "./OrderCommentModal";
import OrderActionModal from "./OrderActionModal";
import DriverOrderStatusModal from "./DriverOrderStatusModal";
import OrderChatModal from "./OrderChatModal";
import OrderCashCollectionModal from "./OrderCashCollectionModal";

const OrdersList = () => {
  const navigation = useNavigation();
  const [status, setStatus] = useState("All");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalType, setModalType] = useState(null); // Handles different modals dynamically
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [driverModalVisible, setDriverModalVisible] = useState(false);
  const [orderChatModalVisible, setOrderChatModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [cashCollectionModalVisible, setCashCollectionModalVisible] =
    useState(false);

  const fetchOrders = async () => {
    if (!navigation.isFocused()) return;
    setLoading(true);
    const userId = await AsyncStorage.getItem("@user_id");
    if (!userId) return navigation.navigate("Login");

    try {
      const { data } = await axios.get(`${OrderUrl}user_id=${userId}`);
      setOrders(data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  useEffect(() => {
    const intervalId = setInterval(fetchOrders, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleOrderStatusAction = (id, actions) => {
    if (Array.isArray(actions)) {
      const buttons = actions.map((action, index) => ({
        text: action,
        onPress: () => updateOrderStatus(id, action),
      }));
      Alert.alert(
        `Select Action`,
        `Please choose an action to update the status:`,
        [
          ...buttons,
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    } else {
      Alert.alert(
        "Confirm",
        "Are you sure to change order status to " + actions + "?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: actions,
            onPress: () => updateOrderStatus(id, actions),
          },
        ]
      );
    }
  };

  const updateOrderStatus = async (id, action) => {
    setLoading(true);
    try {
      const response = await axios.post(OrderStatusUpdateUrl, {
        order_id: id,
        status: action,
      });
      if (response.status === 200) {
        Alert.alert("Success", `Order updated to ${action}`);
        fetchOrders();
      } else {
        Alert.alert("Error", "Failed to update status.");
      }
    } catch (error) {
      setError(
        "Failed to Update status. Please try again." + error + id + action
      );
    }
    setLoading(false);
  };

  const handleIconPress = (action, item, additionalData = null) => {
    setSelectedOrder(item);
    switch (action) {
      case "detail":
        setDetailsModalVisible(true);
        break;
      case "chat":
        setOrderChatModalVisible(true);
        break;
      case "driver":
        setDriverModalVisible(true);
        break;
      case "comment":
        setCommentModalVisible(true);
        break;
      case "cash":
        setCashCollectionModalVisible(true);
        break;
      case "schedule":
        setActionModalVisible(true);
        break;
      case "status":
        handleOrderStatusAction(item.id, additionalData);
        break;
      default:
    }
  };

  const closeModal = () => {
    setDetailsModalVisible(false);
    setDriverModalVisible(false);
    setOrderChatModalVisible(false);
    setCommentModalVisible(false);
    setActionModalVisible(false);
    setCashCollectionModalVisible(false);
    fetchOrders();
  };

  const filteredOrders =
    status === "All"
      ? orders
      : status === "Cash Collection"
      ? orders.filter(
          (o) => o.cashCollection_status === false && o.status === "Complete"
        )
      : orders.filter((o) => o.status === status);

  const statusTabs = [
    "All",
    "Confirm",
    "Accepted",
    "Inprogress",
    "Complete",
    "Cash Collection",
  ];
  const orderCounts = statusTabs.reduce((acc, s) => {
    acc[s] =
      s === "All"
        ? orders.length // Total count for "All"
        : s === "Cash Collection"
        ? orders.filter(
            (o) => o.cashCollection_status === false && o.status === "Complete"
          ).length
        : orders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <Header title="Orders" />
      <Text style={styles.heading}>Today's Orders</Text>
      <View style={styles.statusContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {statusTabs.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.statusTab, status === s && styles.activeTab]}
              onPress={() => setStatus(s)}
            >
              <Text
                style={[styles.statusText, status === s && styles.activeText]}
              >
                {s} ({orderCounts[s] || 0})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      <View style={{ height: 25 }}>
        {loading && <ActivityIndicator size="small" color="#3498db" />}
      </View>
      <FlatList
        style={{ marginBottom: 60 }}
        data={filteredOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <OrderListItem item={item} handleIconPress={handleIconPress} />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No orders found</Text>
        }
      />

      <Footer />

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e4fbfb" },
  statusContainer: {
    flexDirection: "row",
    paddingVertical: 10,
    backgroundColor: "#fff",
    elevation: 3,
    borderRadius: 10,
    margin: 10,
    overflow: "hidden", // Keeps styling neat
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10, // Space between heading and tabs
    color: "#333",
    textAlign: "center",
  },
  statusTab: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "#ecf0f1",
    marginHorizontal: 5, // Adds spacing between tabs
  },
  activeTab: {
    backgroundColor: "#3498db",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#34495e",
  },
  activeText: {
    color: "#fff",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#7f8c8d",
  },
});

export default OrdersList;
