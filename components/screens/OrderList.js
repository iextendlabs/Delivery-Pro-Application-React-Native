import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
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
import Icon from "react-native-vector-icons/Ionicons";
import { OrderStatusUpdateUrl } from "../config/Api";
import LocationElement from "../modules/LocationElement";
import WhatsAppElement from "../modules/WhatsappElement";
import axios from "axios";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

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

  const orderStatusActions = {
    "Accepted": "Inprogress",
    "Pending": ["Accepted", "Rejected"],
    "Inprogress": "Complete",
  };

  const handleOrderStatusAction = async (order, actions) => {
    console.log('current' + order.status);
    console.log(actions);
    if (Array.isArray(actions)) {
      const buttons = actions.map((action, index) => ({
        text: action,
        onPress: () => updateOrderStatus(order, action),
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
            onPress: () => updateOrderStatus(order, actions)
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
      fetchOrders();
    }, [])
  );
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
      navigation.navigate("Login");
    }
  };

  const renderOrder = ({ item }) => {
    return (
      <TouchableOpacity style={styles.orderContainer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.orderId}>
            #{item.id} {"  "}<Icon name="ios-calendar" size={20} color="black" />{item.time_slot_value}
          </Text>
          <Text style={styles.orderDate}>{item.driver_name}
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
          {item.driver_id && (
            <Icon
              name="chatbubble"
              size={25}
              color="blue" // Change this to your desired color for 'Pending' status.
              style={styles.icons}
              onPress={() => handleOrderChatStatus(item)}
            />
          )}
          {(item.status === "Accepted" || item.status === "Complete") &&
            item.driver_status === "Pending" && (
              <Icon
                name="ios-car"
                size={25}
                color="blue" // Change this to your desired color for 'Pending' status.
                style={styles.icons}
                onPress={() => handleDriverOrderStatus(item)}
              />
            )}
          {item.status !== "Complete" && (
            <Icon
              name="chatbubble-ellipses-outline"
              size={25}
              color="black"
              style={styles.icons}
              onPress={() => handleOrderCommentPress(item)}
            />
          )}

          <WhatsAppElement showNumber={false} phoneNumber={item.whatsapp} />
          {item.status === "Pending" && (
            <Icon
              name="ios-calendar"
              size={25}
              color="blue" // Change this to your desired color for 'Pending' status.
              style={styles.icons}
              onPress={() => handleOrderActionPress(item)}
            />
          )}
          {item.status == "Complete" && (
            <Icon
              name="cash-outline"
              size={25}
              color={item.cashCollection_status ? "green" : "orange"}
              style={styles.icons}
              onPress={() => handleOrderCashCollection(item)}
            />
          )}
          {item.status !== "Complete" && (
            <Icon
              name="settings-outline"
              size={25}
              color={item.cashCollection_status ? "green" : "orange"}
              style={styles.icons}
              onPress={() => handleOrderStatusAction(item, orderStatusActions[item.status])}
            />
          )}

        </View>

        <View style={styles.OrderLinks}>
          <Text style={styles.orderId}>
            {item.status}
          </Text>
        </View>


        {/* Other order fields */}
      </TouchableOpacity>
    );
  };

  const updateOrderStatus = async (order, action) => {
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
      formData.append("status", action);
      console.log(action);

      const response = await axios.post(OrderStatusUpdateUrl, formData);

      if (response.status === 200) {
        setSuccess("Order Updated to " + action);
        fetchOrders();
      } else {
        throw new Error("Failed to update order.");
      }
    } catch (error) {
      setError("Failed to Update. Please try again.");
      console.log(error);
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
    if (order.cashCollection_status) {
      setCashCollectionModalVisible(false);
    } else {
      setSelectedOrder(order);
      setCashCollectionModalVisible(true);
    };
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
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#0000ff" />
        </View>
      ) : displayOrder.length === 0 ? (
        <Text style={styles.noItemsText}>No Order Yet / Updating...</Text>
      ) : (
        <FlatList
          data={displayOrder}
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
