import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { loadAndRefreshSubTitleData } from "../../Database/dataSubTitles";
import StepNavigation from "./StepNavigation";
import { getDatabase } from "../../Database/database";
import Splash from "../Splash";
import Profile from "../../styles/Profile";
import { deleteSyncMetadataKey } from "../../Database/servicesRepository";
import { useNavigation } from "@react-navigation/native";

const ITEMS_PER_PAGE = 20;

const Designation = ({
  currentStep,
  totalSteps,
  onBack,
  onPrevious,
  formData,
  onNext,
  setFormData,
}) => {
  const navigation = useNavigation();
  const [designations, setDesignations] = useState([]);
  const [selectedDesignations, setSelectedDesignations] = useState([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    if (formData?.designations) {
      setSelectedDesignations(formData.designations);
    }
    setIsLoading(false);
  }, [formData]);

  const fetchData = async () => {
    setIsDataLoading(true);
    try {
      const subtitleData = await loadAndRefreshSubTitleData();
      if (!subtitleData?.data || !Array.isArray(subtitleData.data)) {
        throw new Error("No valid subtitle data found");
      }
      setDesignations(subtitleData.data);
    } catch (error) {
      Alert.alert(
        "Something went wrong",
        "Please wait a moment and try again later.\n\nWe're currently experiencing some technical issues.\nThank you for your patience.",
        [
          {
            text: "OK",
            onPress: async () => {
              try {
                const db = await getDatabase();
                await db.execAsync(`DELETE FROM sub_titles;`);
                await deleteSyncMetadataKey("subtitles");
              } catch (e) {
                // Optionally handle DB error
              }
              navigation.navigate("Home"); // Change "Home" to your actual home route name
            },
          },
        ]
      );
    }
    setIsDataLoading(false);
  };

  const toggleDesignation = (id) => {
    setSelectedDesignations((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id]
    );
  };

  const handleNextPress = async () => {
    if (selectedDesignations.length < 1) {
      Alert.alert(
        "Validation Error",
        "Please select at least one designation."
      );
      return;
    }

    setIsLoading(true);
    const db = await getDatabase();

    try {
      await db.execAsync("BEGIN TRANSACTION");
      await db.runAsync("DELETE FROM designations");

      for (const id of selectedDesignations) {
        await db.runAsync(
          "INSERT INTO designations (designation_id) VALUES (?)",
          [id]
        );
      }

      await db.execAsync("COMMIT");

      setFormData((prev) => ({
        ...prev,
        designations: selectedDesignations,
      }));
      setIsLoading(false);
      onNext();
    } catch (error) {
      await db.execAsync("ROLLBACK");
      console.error("[DESIGNATIONS ERROR] Failed to save:", error);
      Alert.alert("Error", "Failed to save selected designations.");
    }
    setIsLoading(false);
  };

  const loadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  // Separate selected and available designations
  const selectedItems = designations
    .filter((item) => selectedDesignations.includes(item.id))
    .slice(0, visibleCount);

  const availableItems = designations
    .filter((item) => !selectedDesignations.includes(item.id))
    .slice(0, visibleCount);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.itemButton,
        selectedDesignations.includes(item.id) && styles.selectedButton,
      ]}
      onPress={() => toggleDesignation(item.id)}
    >
      <Text
        style={[
          styles.itemText,
          selectedDesignations.includes(item.id) && styles.selectedText,
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

  if (isLoading || isDataLoading) {
    return <Splash />;
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Select Your Designation(s)</Text>
          <Text style={styles.subtitle}>You can select multiple options</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Selected Designations Section */}
          {selectedItems.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>Selected Designations</Text>
              <FlatList
                data={selectedItems}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                renderItem={renderItem}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* Available Designations Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>
              {selectedItems.length > 0
                ? "Available Designations"
                : "All Designations"}
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
          {visibleCount < designations.length && renderLoadMoreButton()}
        </ScrollView>
        <StepNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          onBack={onBack}
          onPrevious={onPrevious}
          onNext={handleNextPress}
          onSubmit={() => alert("Submit")}
          showScrollPrompt={true}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create(Profile);

export default Designation;
