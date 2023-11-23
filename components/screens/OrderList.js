import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableHighlight,
  StyleSheet,
  Alert,
} from "react-native";
import { OrderUrl } from "../config/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OrderListStyle from "../styles/OrderListStyle";
import OrderDetailsModal from "./OrderDetailsModal";
import OrderCommentModal from "./OrderCommentModal";
import OrderActionModal from "./OrderActionModal";
import DriverOrderStatusModal from "./DriverOrderStatusModal";
import OrderChatModal from "./OrderChatModal";
import OrderCashCollectionModal from "./OrderCashCollectionModal";
import { OrderStatusUpdateUrl } from "../config/Api";
import axios from "axios";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import OrderListItem from "./components/OrderListItem";

const OrderList = ({ updateNotificationCount }) => {
  const [statusFilter, setStatusFilter] = useState("");
  const [status, setStatus] = useState("All");
  const [orders, setOrders] = useState([]);
  const [displayOrder, setDisplayOrder] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [driverModalVisible, setDriverModalVisible] = useState(false);
  const [orderChatModalVisible, setOrderChatModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [cashCollectionModalVisible, setCashCollectionModalVisible] =
    useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [countAll, setCountAll] = useState(0);
  const [countPending, setCountPending] = useState(null);
  const [countAccepted, setCountAccepted] = useState(null);
  const [countInprogress, setCountInprogress] = useState(null);
  const [countComplete, setCountComplete] = useState(null);
  const navigation = useNavigation();

  const handleOrderStatusAction = (id, actions) => {
    if (Array.isArray(actions)) {
      const buttons = actions.map((action, index) => ({
        text: action,
        onPress: () => updateOrderStatus(id, action)
      }));
      Alert.alert(
        `Select Action`,
        `Please choose an action to update the status:`,
        [...buttons, {
          text: "Cancel",
          style: "cancel",
        }]
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
            onPress: () => updateOrderStatus(id, actions)
          }
        ]
      );
    }
  };
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

  useFocusEffect(
    React.useCallback(() => {
      //console.log('Focus effect triggered');
      fetchOrders();
    }, [])
  );
  useEffect(() => {
    //console.log('use effect might work here');
    const reloadApp = () => {
      navigation.isFocused() && fetchOrders();
    };
    const intervalId = setInterval(reloadApp, 3000); // Reload every 2 seconds
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (statusFilter) {
      const apiFilter = orders.filter((order) => order.status === statusFilter);
      if (JSON.stringify(apiFilter) !== JSON.stringify(displayOrder)) {
        setDisplayOrder(apiFilter);
      }
    } else if (JSON.stringify(orders) !== JSON.stringify(displayOrder)) {
      setDisplayOrder(orders);
    }

    setCountAll(orders.length);
    setCountComplete(
      orders.filter((order) => order.status === "Complete").length
    );
    setCountPending(
      orders.filter((order) => order.status === "Pending").length
    );
    setCountInprogress(
      orders.filter((order) => order.status === "Inprogress").length
    );
    setCountAccepted(
      orders.filter((order) => order.status === "Accepted").length
    );
  }, [orders]);

  useEffect(() => {
    fetchOrders();
    const filteredOrder = displayOrder.filter(
      (order) => order.status === statusFilter
    );
    setDisplayOrder(filteredOrder);
  }, [statusFilter]);

  const fetchOrders = async () => {
    if (!navigation.isFocused()) return;
    const userId = await AsyncStorage.getItem("@user_id");
    if (userId) {
      try {

        const response = await axios.get(`${OrderUrl}user_id=${userId}`);
        const { data } = response;
        setOrders(data.orders);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        // console.error("Error fetching orders:", error);
      }
    } else {
      navigation.navigate("Profile");
    }
  };
  const updateOrderStatus = async (id, action) => {
    setLoading(true);
    try {
      const response = await axios.post(OrderStatusUpdateUrl, {
        order_id : id,
        status: action
      });
      if (response.status === 200) {
        setSuccess("Order Updated to " + action);
        fetchOrders();
      } else {
        throw new Error("Failed to update order.");
      }
    } catch (error) {
      setError("Failed to Update status. Please try again." + error + id + action);
      //console.log(error);
    }
    setLoading(false);
  };

  const closeModal = () => {
    setDetailsModalVisible(false);
    setDriverModalVisible(false);
    setOrderChatModalVisible(false);
    setCommentModalVisible(false);
    setActionModalVisible(false);
    setCashCollectionModalVisible(false);
    setSuccessMessage("");
    setErrorMessage("");
    fetchOrders();
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
      case "schedule" :
        setActionModalVisible(true)
      break;
      case "status":
        handleOrderStatusAction(item.id, additionalData);
        break;
      // Handle other actions or provide a default behavior
      default:
        // Handle default behavior
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>
        <TouchableHighlight
          style={[styles.tab, status == "All" && styles.selectedTab]}
          onPress={() => {
            setStatusFilter("");
            setStatus("All");
          }}
        >
          <View>
            <Text
              style={[
                styles.tabText,
                status == "All" && styles.selectedTabText,
              ]}
            >
              All
            </Text>
            <Text
              style={[
                styles.tabText,
                status == "All" && styles.selectedTabText,
              ]}
            >
              {countAll}
            </Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight
          style={[styles.tab, status == "Pending" && styles.selectedTab]}
          onPress={() => {
            setStatusFilter("Pending");
            setStatus("Pending");
          }}
        >
          <View>
            <Text
              style={[
                styles.tabText,
                status == "Pending" && styles.selectedTabText,
              ]}
            >
              Pending
            </Text>
            <Text
              style={[
                styles.tabText,
                status == "Pending" && styles.selectedTabText,
              ]}
            >
              {countPending}
            </Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight
          style={[styles.tab, status == "Accepted" && styles.selectedTab]}
          onPress={() => {
            setStatusFilter("Accepted");
            setStatus("Accepted");
          }}
        >
          <View>
            <Text
              style={[
                styles.tabText,
                status == "Accepted" && styles.selectedTabText,
              ]}
            >
              Accepted
            </Text>
            <Text
              style={[
                styles.tabText,
                status == "Accepted" && styles.selectedTabText,
              ]}
            >
              {countAccepted}
            </Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight
          style={[styles.tab, status == "Inprogress" && styles.selectedTab]}
          onPress={() => {
            setStatusFilter("Inprogress");
            setStatus("Inprogress");
          }}
        >
          <View>
            <Text
              style={[
                styles.tabText,
                status == "Inprogress" && styles.selectedTabText,
              ]}
            >
              Inprogress
            </Text>
            <Text
              style={[
                styles.tabText,
                status == "Inprogress" && styles.selectedTabText,
              ]}
            >
              {countInprogress}
            </Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight
          style={[styles.tab, status == "Complete" && styles.selectedTab]}
          onPress={() => {
            setStatusFilter("Complete");
            setStatus("Complete");
          }}
        >
          <View>
            <Text
              style={[
                styles.tabText,
                status == "Complete" && styles.selectedTabText,
              ]}
            >
              Complete
            </Text>
            <Text
              style={[
                styles.tabText,
                status == "Complete" && styles.selectedTabText,
              ]}
            >
              {countComplete}
            </Text>
          </View>
        </TouchableHighlight>
      </View>
      {successMessage !== "" && (
        <Text style={styles.successMessage}>{successMessage}</Text>
      )}
      {errorMessage !== "" && (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      )}
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#0000ff" />
        </View>
        )}
      {displayOrder.length === 0 ? (
        <Text style={styles.noItemsText}>No Order Yet / Updating...</Text>
      ) : (
        <FlatList
          data={displayOrder}
          renderItem={({ item }) => (
            <OrderListItem item={item} handleIconPress={handleIconPress} />
          )}
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
