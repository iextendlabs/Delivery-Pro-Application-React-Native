import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, Image, ScrollView } from "react-native";
import PhoneNumber from "../modules/PhoneNumber";
import OrderListStyle from "../styles/OrderListStyle";
import { ScrollView as GestureScrollView } from "react-native-gesture-handler";
import WhatsAppElement from "../modules/WhatsappElement";
import GoogleAddressElement from "../modules/GoogleAddressElement";
import { BaseUrl } from "../config/Api";

const OrderDetailsModal = ({ visible, order, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleModalClose = () => {
    onClose();
  };

  const openImageGallery = (image) => {
    setSelectedImage(image);
  };

  const closeImageGallery = () => {
    setSelectedImage(null);
  };

  // Check if attachments exist and return the images
  const renderAttachments = () => {
    if (!order || !order.attachments || order.attachments.length === 0) {
      return null;
    }

    return (
      <View style={[styles.attachmentsContainer,styles.commentBox]}>
        <Text style={styles.detailBoxTitle}>Attachments</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {order.attachments.map((attachment, index) => (
            <TouchableOpacity key={index} onPress={() => openImageGallery(attachment)}>
              <Image
                source={{ uri: `${BaseUrl}/order-attachment/${attachment}` }} // Assuming the image URL is accessible
                style={styles.attachmentImage}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <ScrollView>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {order && (
              <View style={styles.orderDetails}>
                {/* Box for Order ID */}
                <View style={styles.detailBox}>
                  <Text style={styles.detailBoxTitle}>Order#</Text>
                  <Text style={styles.detailBoxText}>{order.id}</Text>
                </View>

                {/* Box for Total Price */}
                <View style={styles.detailBox}>
                  <Text style={styles.detailBoxTitle}>Total Price</Text>
                  <Text style={styles.detailBoxText}>
                    {order.total_amount}
                  </Text>
                </View>

                {/* Box for Payment to be Collected */}
                <View style={styles.detailBox}>
                  <Text style={styles.detailBoxTitle}>
                    Payment to be Collected
                  </Text>
                  <Text style={styles.detailBoxText}>
                    {order.total_amount}
                  </Text>
                </View>

                {/* Box for Phone */}
                <View style={styles.detailBox}>
                  <Text style={styles.detailBoxTitle}>Phone</Text>
                  <View style={styles.phoneNumberContainer}>
                    <PhoneNumber
                      phoneNumber={order.number}
                      showNumber={true}
                    />
                  </View>
                </View>

                <View style={styles.detailBox}>
                  <Text style={styles.detailBoxTitle}>Whatsapp</Text>
                  <View style={styles.phoneNumberContainer}>
                    <WhatsAppElement showNumber={true}
                      phoneNumber={order.whatsapp}
                    />
                  </View>
                </View>
                
                {order.driver_number && (
                <View style={styles.detailBox}>
                  <Text style={styles.detailBoxTitle}>Driver Phone</Text>
                  <View style={styles.phoneNumberContainer}>
                    <PhoneNumber
                      phoneNumber={order.driver_number}
                      showNumber={true}
                    />
                  </View>
                </View>
                )}
                {order.driver_whatsapp && (
                <View style={styles.detailBox}>
                  <Text style={styles.detailBoxTitle}>Driver Whatsapp</Text>
                  <View style={styles.phoneNumberContainer}>
                    <WhatsAppElement showNumber={true}
                      phoneNumber={order.driver_whatsapp}
                    />
                  </View>
                </View>
                )}
            
                <View style={styles.commentBox}>
                  <Text style={styles.detailBoxTitle}>Services</Text>
                    {'services' in order && order.services.map((service, index) => (
                      <Text key={index} style={styles.commentText}>
                        {service}
                      </Text>
                    ))}
                    
                </View>

                {/* Render Attachments if they exist */}
                {renderAttachments()}

                {/* Box for Comment */}
                <View style={styles.commentBox}>
                  <Text style={styles.detailBoxTitle}>Comments</Text>
                  {order.comments_text.map((comment, index) => (
                    <Text key={index} style={styles.commentText}>
                      {comment}
                    </Text>
                  ))}
                </View>

                {/* Box for Shipping Address */}
                <View style={styles.shippingAddressBox}>
                  <Text style={styles.detailBoxTitle}>Shipping Address</Text>
                  <View style={styles.addressLineContainer}>
                    <Text style={styles.addressLine}>{order.name}</Text>
                  </View>
                  <GoogleAddressElement address={order.buildingName + ' ' + order.street + ',' + order.area + ' ' + order.city} />
                </View>
              </View>
            )}

            {/* Image Gallery Modal */}
            {selectedImage && (
              <Modal visible={selectedImage !== null} animationType="fade" transparent={false}>
                <View style={styles.imageGalleryContainer}>
                  <Image
                    source={{ uri: `${BaseUrl}/order-attachment/${selectedImage}` }}
                    style={styles.fullscreenImage}
                    resizeMode="contain"
                  />
                  <TouchableOpacity style={styles.closeImageGalleryButton} onPress={closeImageGallery}>
                    <Text style={styles.closeImageGalleryButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </Modal>
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
