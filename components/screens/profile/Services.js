import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from "react-native";
import StepNavigation from "./StepNavigation";
import { getDatabase } from "../../Database/database";
import { loadAndRefreshData } from "../../Database/dataService";
import Splash from "../Splash";

const ITEMS_PER_PAGE = 10;
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
  const [error, setError] = useState(null);
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
      setServices(services.data);
    } catch (error) {
      Alert.alert(
        "Something went wrong",
        "Please uninstall the app\nand install the latest version to continue.", // Message with line break
        [{ text: "OK" }]
      );
    }
    setIsDataLoading(false);
  };

  const handleNextPress = async () => {
    if (selectedServices.length < 1) {
      Alert.alert("Validation Error", "Please select at least one services.");
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

  const toggleService = (id) => {
    const newServices = selectedServices.includes(id)
      ? selectedServices.filter((item) => item !== id)
      : [...selectedServices, id];

    setSelectedServices(newServices);
  };

  const loadMore = () => {
    setVisibleServicesCount((prev) => prev + ITEMS_PER_PAGE);
  };

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

  if (isLoading || isDataLoading) {
    return <Splash />;
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Services Selection</Text>
          {error && <Text style={styles.error}>{error}</Text>}
        </View>

        {/* Scrollable FlatList */}
        <View style={styles.listWrapper}>
          <FlatList
            data={services.slice(0, visibleServicesCount)}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />

          {visibleServicesCount < services.length && (
            <TouchableOpacity onPress={loadMore}>
              <Text style={styles.loadMoreText}>Load More</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Fixed Bottom Step Navigation */}
        <StepNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          onBack={onBack}
          onPrevious={onPrevious}
          onNext={handleNextPress}
          onSubmit={() => alert("Submit")}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  listWrapper: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
    paddingTop: 20,
  },
  itemButton: {
    flex: 1,
    margin: 5,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "45%",
  },
  selectedButton: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  itemText: {
    color: "#333",
  },
  selectedText: {
    color: "#fff",
  },
  loadMoreText: {
    color: "#007bff",
    textAlign: "center",
    marginTop: 15,
    fontSize: 16,
  },
});

export default Services;
