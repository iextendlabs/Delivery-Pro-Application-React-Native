import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import StepNavigation from "./StepNavigation";
import { getDatabase } from "../../Database/database";
import { loadAndRefreshData } from "../../Database/dataService";
import Splash from "../Splash";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Profile from "../../styles/Profile";

const ITEMS_PER_PAGE = 20;

const Services = ({
  currentStep,
  totalSteps,
  onBack,
  onPrevious,
  formData,
  onNext,
  setFormData,
}) => {
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [mounted, setMounted] = useState(true);
  const [visibleServicesCount, setVisibleServicesCount] =
    useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  useEffect(() => {
    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    if (formData?.services) {
      setSelectedServices(formData.services);
    }
    setIsLoading(false);
  }, [formData]);

  const fetchData = async () => {
    if (!mounted || !formData) return;
    setIsDataLoading(true);
    try {
      const services = await loadAndRefreshData();
      if (!services?.data || !Array.isArray(services.data)) {
        throw new Error("No valid Services data found");
      }
      // Filter services by selected categories
      const selectedCategoryIds = formData.categories || [];
      const filteredServices = services.data.filter((service) =>
        service.category_ids.some((catId) =>
          selectedCategoryIds.includes(catId)
        )
      );
      setServices(filteredServices);
    } catch (error) {
      Alert.alert(
        "Something went wrong",
        "Please wait a moment and try again later.\n\nWe're currently experiencing some technical issues.\nThank you for your patience.",
        [{ text: "OK" }]
      );
    }
    setIsDataLoading(false);
  };

  const handleNextPress = async () => {
    if (selectedServices.length < 1) {
      Alert.alert("Validation Error", "Please select at least one service.");
      return;
    }
    setIsLoading(true);
    const db = await getDatabase();

    try {
      await db.execAsync("BEGIN TRANSACTION");
      await db.runAsync("DELETE FROM staff_services");

      for (const id of selectedServices) {
        await db.runAsync(
          "INSERT INTO staff_services (service_id) VALUES (?)",
          [id]
        );
      }

      await db.execAsync("COMMIT");
      setFormData((prev) => ({
        ...prev,
        services: selectedServices,
      }));
      setIsLoading(false);
      onNext();
    } catch (error) {
      await db.execAsync("ROLLBACK");
      console.error("[SERVICES ERROR] Failed to save:", error);
      Alert.alert("Error", "Failed to save selected services.");
    }
    setIsLoading(false);
  };

  const handlePreviousPress = async () => {
    try {
      const subCategory = await AsyncStorage.getItem("@subCategory");
      if (subCategory === "0") {
        AsyncStorage.setItem("@subCategory", "1");
        onPrevious(2);
      }
      onPrevious();
    } catch (error) {}
  };

  const toggleService = (id) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const loadMore = () => {
    setVisibleServicesCount((prev) => prev + ITEMS_PER_PAGE);
  };

  // Separate selected and available services
  const selectedItems = services
    .filter((item) => selectedServices.includes(item.id))
    .slice(0, visibleServicesCount);

  const availableItems = services
    .filter((item) => !selectedServices.includes(item.id))
    .slice(0, visibleServicesCount);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.itemButton,
        selectedServices.includes(item.id) && styles.selectedButton,
      ]}
      onPress={() => toggleService(item.id)}
    >
      <Text
        style={[
          styles.itemText,
          selectedServices.includes(item.id) && styles.selectedText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderLoadMoreButton = () => (
    <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
      <Text style={styles.loadMoreText}>Load More</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return <Splash />;
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Services Selection</Text>
        </View>

        {/* Scrollable Content */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Selected Services Section */}
          {selectedItems.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>Selected Services</Text>
              <FlatList
                data={selectedItems}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                renderItem={renderItem}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* Available Services Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>
              {selectedItems.length > 0 ? "Available Services" : "All Services"}
            </Text>
            <FlatList
              data={availableItems}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              renderItem={renderItem}
              scrollEnabled={false}
            />
          </View>

          {/* Load More Button */}
          {visibleServicesCount < services.length && renderLoadMoreButton()}
        </ScrollView>

        {/* Fixed Bottom Step Navigation */}
        <StepNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          onBack={onBack}
          onPrevious={handlePreviousPress}
          onNext={handleNextPress}
          onSubmit={() => alert("Submit")}
          showScrollPrompt={true}
        />
      </View>
      <Modal
        transparent={true}
        visible={isDataLoading}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.overlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>
              Please wait, data is being loaded.
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// All styles remain exactly the same as original
const styles = StyleSheet.create(Profile);

export default Services;
