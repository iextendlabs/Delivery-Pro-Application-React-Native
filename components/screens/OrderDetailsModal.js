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
            {/* <Text style={styles.modalTitle}>Order Details</Text> */}

            {selectedOrder && (
              <View style={styles.orderDetails}>
                {/* Box for Order ID */}
                <View style={styles.detailBox}>
                  <Text style={styles.detailBoxTitle}>Order#</Text>
                  <Text style={styles.detailBoxText}>
                    {selectedOrder.order_id}
                  </Text>
                </View>

                {/* Box for Total Price */}
                <View style={styles.detailBox}>
                  <Text style={styles.detailBoxTitle}>Total Price</Text>
                  <Text style={styles.detailBoxText}>
                    {selectedOrder.total_price}
                  </Text>
                </View>

                {/* Box for Payment to be Collected */}
                <View style={styles.detailBox}>
                  <Text style={styles.detailBoxTitle}>
                    Payment to be Collected
                  </Text>
                  <Text style={styles.detailBoxText}>
                    {selectedOrder.payment_to_be_collected}
                  </Text>
                </View>

                {/* Box for Phone */}
                <View style={styles.detailBox}>
                  <Text style={styles.detailBoxTitle}>Phone</Text>
                  <View style={styles.phoneNumberContainer}>
                    {/* <Image source={require('../path/to/phone-icon.png')} style={styles.phoneIcon} /> */}
                    <PhoneNumber
                      phoneNumber={selectedOrder.shipping_address.mobile_no}
                      showNumber={true}
                    />
                  </View>
                </View>

                {/* Box for Shipping Address */}
                <View style={styles.shippingAddressBox}>
                  <Text style={styles.detailBoxTitle}>Shipping Address</Text>
                  <View style={styles.addressLineContainer}>
                    <Text style={styles.addressLine}>{selectedOrder.shipping_address.firstname} {selectedOrder.shipping_address.lastname}</Text>
                  </View>
                  <View style={styles.addressLineContainer}>
                    <Text style={styles.addressLine}>Company: {selectedOrder.shipping_address.company}</Text>
                  </View>
                  <View style={styles.addressLineContainer}>
                    <Text style={styles.addressLine}>{selectedOrder.shipping_address.address_1}</Text>
                  </View>
                  <View style={styles.addressLineContainer}>
                    <Text style={styles.addressLine}>{selectedOrder.shipping_address.address_2}</Text>
                  </View>
                  <View style={styles.addressLineContainer}>
                    <Text style={styles.addressLine}>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postcode}</Text>
                  </View>
                </View>

                {/* Box for Comment */}
                <View style={styles.commentBox}>
                  <Text style={styles.detailBoxTitle}>Comment</Text>
                  <View style={styles.commentTextContainer}>
                    <Text style={styles.commentText}>{selectedOrder.comment}</Text>
                  </View>
                </View>
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
