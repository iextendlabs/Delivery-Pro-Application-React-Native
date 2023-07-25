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
                  <Text style={styles.detailBoxText}>{selectedOrder.id}</Text>
                </View>

                {/* Box for Total Price */}
                <View style={styles.detailBox}>
                  <Text style={styles.detailBoxTitle}>Total Price</Text>
                  <Text style={styles.detailBoxText}>
                    {selectedOrder.total_amount}
                  </Text>
                </View>

                {/* Box for Payment to be Collected */}
                <View style={styles.detailBox}>
                  <Text style={styles.detailBoxTitle}>
                    Payment to be Collected
                  </Text>
                  <Text style={styles.detailBoxText}>
                    {selectedOrder.total_amount}
                  </Text>
                </View>

                {/* Box for Phone */}
                <View style={styles.detailBox}>
                  <Text style={styles.detailBoxTitle}>Phone</Text>
                  <View style={styles.phoneNumberContainer}>
                    {/* <Image source={require('../path/to/phone-icon.png')} style={styles.phoneIcon} /> */}
                    <PhoneNumber
                      phoneNumber={selectedOrder.number}
                      showNumber={true}
                    />
                  </View>
                </View>

                {/* Box for Shipping Address */}
                <View style={styles.shippingAddressBox}>
                  <Text style={styles.detailBoxTitle}>Shipping Address</Text>
                  <View style={styles.addressLineContainer}>
                    <Text style={styles.addressLine}>{selectedOrder.name}</Text>
                  </View>
                  <View style={styles.addressLineContainer}>
                    <Text style={styles.addressLine}>
                      {selectedOrder.buildingName},{selectedOrder.flatVilla},
                      {selectedOrder.street},{selectedOrder.area},
                      {selectedOrder.city}{" "}
                    </Text>
                  </View>
                </View>

                {/* Box for Comment */}
                <View style={styles.commentBox}>
                  <Text style={styles.detailBoxTitle}>Comments</Text>
                    {selectedOrder.comments_text.map((comment, index) => (
                      <Text key={index} style={styles.commentText}>
                        {comment}
                      </Text>
                    ))}
                    
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
