import React, { useState, useEffect } from "react";
import { useFocusEffect } from '@react-navigation/native';
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

const OrderList = ({initialParams}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState({
    order_id: 1000,
    cart_id: "1000",
    order_number: "1000",
    total_price: "AED130.00",
    payment_to_be_collected: "0",
    shipping_address: {
      firstname: "Cos",
      lastname: "Dubai",
      company: "",
      address_1: "Mudon - Dubai - United Arab Emirates",
      address_2: "",
      mobile_no: "+971 55 410 8465",
      city: "Dubai",
      state: "Dubai",
      country: "United Arab Emirates",
      postcode: "000",
      alias: "",
      longitude: "",
      latitude: "",
    },
  });

  const [modalVisible, setModalVisible] = useState(false);

  const route = useRoute();
  var status = "ASSIGNED";

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
  }, [route.params?.status,initialParams]);

  const fetchOrders = async (orderStatus) => {
    setLoading(true);
    try {
      const response = await fetch(OrderUrl+'&status='+orderStatus);
      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      style={styles.orderContainer}
      onPress={() => handleOrderPress(item)}
    >
      <Text style={styles.orderId}>ID: {item.order_id}</Text>
      <Text style={styles.orderDate}>{item.total_price}</Text>
      {/* Other order fields */}
    </TouchableOpacity>
  );

  const handleOrderPress = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const OrderDetailsModal = () => (
    <Modal visible={modalVisible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Order Details</Text>
          {selectedOrder && (
            <View style={styles.orderDetails}>
              <Text style={styles.orderText}>
                Order ID: {selectedOrder.order_id}
              </Text>
              <Text style={styles.orderText}>
                Total Price: {selectedOrder.total_price}
              </Text>
              <Text style={styles.orderText}>
                Payment to be Collected: {selectedOrder.payment_to_be_collected}
              </Text>
              <Text style={styles.orderText}>Phone:</Text>
              <PhoneNumber
                phoneNumber={selectedOrder.shipping_address.mobile_no}
              />
              <Text style={styles.orderText}>Shipping Address:</Text>
              <Text style={styles.orderText}>
                {selectedOrder.shipping_address.firstname}{" "}
                {selectedOrder.shipping_address.lastname}
              </Text>
              <Text style={styles.orderText}>
                Company:{selectedOrder.shipping_address.company}
              </Text>
              <Text style={styles.orderText}>
                {selectedOrder.shipping_address.address_1}
              </Text>
              <Text style={styles.orderText}>
                {selectedOrder.shipping_address.address_2}
              </Text>
              <Text style={styles.orderText}>
                {selectedOrder.shipping_address.city},{" "}
                {selectedOrder.shipping_address.state}
              </Text>
              <Text style={styles.orderText}>
                {selectedOrder.shipping_address.country},{" "}
                {selectedOrder.shipping_address.postcode}
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{flex:1}}>
        <OrderLinks />
      </View>
      <Text style={styles.orderText}>Order Status: {status}</Text>
      <Text style={styles.orderText}>Total Orders: {orders.length}</Text>

      <ScrollView style={{ flex: 4, paddingBottom: 65 }}>
  {orders.length === 0 ? (
    <Text style={styles.noItemsText}>No Order</Text>
  ) : (
    <FlatList
      data={orders}
      renderItem={renderOrder}
      keyExtractor={(item) => item.order_id.toString()}
    />
  )}
</ScrollView>

      <OrderDetailsModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  orderContainer: {
    padding: 10,
    backgroundColor: "#f8f8f8",
    marginBottom: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 14,
    color: "#888",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  orderDetails: {
    marginBottom: 15,
  },
  orderText: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: "center"
  },
  closeButton: {
    alignSelf: "flex-end",
    backgroundColor: "#9ac4f8",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#fff",
  },
  noItemsText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
  },
});

export default OrderList;
