import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import PhoneNumber from "../modules/PhoneNumber";
import OrderListStyle from "../styles/OrderListStyle";
import { ScrollView } from "react-native-gesture-handler";

const OrderDetailsModal = ({ visible, order, onClose }) => {
  if (!visible || !order) {
    return null;
  }
  const [selectedOrder, setSelectedOrder] = useState(order);
  const handleModalClose = () => {
    onClose();
  };
  return (
    <Modal visible={visible} animationType="slide" transparent>
          <ScrollView>

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
                  Payment to be Collected:{" "}
                  {selectedOrder.payment_to_be_collected}
                </Text>
                <Text style={styles.orderText}>Phone:</Text>
                <PhoneNumber
                  phoneNumber={selectedOrder.shipping_address.mobile_no}
                  showNumber={true}
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
                <Text style={styles.orderText}>Comment</Text>
                <Text style={styles.orderText}>{selectedOrder.comment}</Text>
              </View>
            )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleModalClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>

    </Modal>
  );
};

const styles = StyleSheet.create(OrderListStyle);

export default OrderDetailsModal;
