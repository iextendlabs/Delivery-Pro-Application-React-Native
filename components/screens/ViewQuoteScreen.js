import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Linking,
} from "react-native";
import axios from "axios";
import { BaseUrl } from "../config/Api";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation, useRoute } from "@react-navigation/native";
import Splash from "./Splash";
import PhoneNumber from "../modules/PhoneNumber";
import WhatsAppElement from "../modules/WhatsappElement";
import LocationElement from "../modules/LocationElement";
import QuoteListStyle from "../styles/QuoteListStyle";

const ViewQuoteScreen = () => {
  const route = useRoute();
  const [quote, setQuote] = useState(null); // State to store quote details
  const [loading, setLoading] = useState(false); // State to handle loading
  const [modalVisible, setModalVisible] = useState(false); // State for image modal
  const [selectedImage, setSelectedImage] = useState(""); // State for selected image
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // State for current image index

  // Set the quote data when the screen loads
  useEffect(() => {
    if (route.params && route.params.quote) {
      setQuote(route.params.quote); // Set the quote data from navigation params
    }
  }, [route.params?.quote]);

  // Open image modal
  const openImageModal = (image, index) => {
    setSelectedImage(`${BaseUrl}/quote-images/${image}`); // Set the full image URL
    setCurrentImageIndex(index);
    setModalVisible(true);
  };

  // Navigate to previous image
  const prevImage = () => {
    if (currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1;
      setCurrentImageIndex(newIndex);
      setSelectedImage(
        `${BaseUrl}/quote-images/${quote.images[newIndex].image}`
      );
    }
  };

  // Navigate to next image
  const nextImage = () => {
    if (currentImageIndex < quote.images.length - 1) {
      const newIndex = currentImageIndex + 1;
      setCurrentImageIndex(newIndex);
      setSelectedImage(
        `${BaseUrl}/quote-images/${quote.images[newIndex].image}`
      );
    }
  };

  // Show loading indicator while fetching data
  if (loading) {
    return Splash();
  }

  // Show error message if there's no quote data
  if (!quote) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No quote data found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.quoteContainer}>
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Quote Details</Text>

        {/* User Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Send by {quote.user?.name || "N/A"}
          </Text>
          {quote.show_quote_detail == "1" &&
            quote.staffs[0].pivot.status == "Accepted" && (
              <>
                <PhoneNumber phoneNumber={quote.phone} showNumber={true} />
                <WhatsAppElement
                  showNumber={true}
                  phoneNumber={quote.whatsapp}
                />

                {quote.location && (
                  <LocationElement
                    latitude={null}
                    longitude={null}
                    address={quote.location}
                    showAddress={true}
                  />
                )}
              </>
            )}
        </View>

        <View style={styles.divider} />

        {/* Service Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Detail:</Text>
          <View style={styles.serviceContainer}>
            {quote.service.image && (
              <Image
                source={{
                  uri: `${BaseUrl}/service-images/${quote.service.image}`,
                }}
                style={styles.serviceImage}
              />
            )}
            <View style={styles.serviceDetails}>
              <Text style={styles.serviceName}>{quote.service_name}</Text>
              {quote.sourcing_quantity && (
                <Text style={styles.quantityText}>
                  {quote.sourcing_quantity} Quantity
                </Text>
              )}
            </View>
          </View>

          <ScrollView>
            <View style={styles.optionsContainer}>
              {quote.service_option.map((option, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.optionText}>
                    {option.option_name} - ${option.option_price}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.divider} />

        {/* Status & Message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status:</Text>
          <Text style={styles.statusText}>{quote.staffs[0].pivot.status}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Message:</Text>
          <Text style={styles.detailText}>{quote.detail}</Text>
        </View>

        {/* Images */}
        {quote.images && quote.images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Images:</Text>
            <View style={styles.imageGallery}>
              {quote.images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => openImageModal(image.image, index)}
                >
                  <Image
                    source={{ uri: `${BaseUrl}/quote-images/${image.image}` }}
                    style={styles.thumbnail}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Image Modal */}
      <Modal visible={modalVisible} transparent={true}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Icon name="times" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButtonLeft}
            onPress={prevImage}
            disabled={currentImageIndex === 0}
          >
            <Icon name="chevron-left" size={30} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButtonRight}
            onPress={nextImage}
            disabled={currentImageIndex === quote.images.length - 1}
          >
            <Icon name="chevron-right" size={30} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: selectedImage }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create(QuoteListStyle);

export default ViewQuoteScreen;
