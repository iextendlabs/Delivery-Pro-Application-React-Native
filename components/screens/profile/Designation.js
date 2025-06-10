import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";
import { loadAndRefreshSubTitleData } from "../../Database/dataSubTitles";
import StepNavigation from "./StepNavigation";
import { getDatabase } from "../../Database/database";
import Splash from "../Splash";
const ITEMS_PER_PAGE = 10;
const Designation = ({
  currentStep,
  totalSteps,
  onBack,
  onPrevious,
  formData,
  onNext,
  setFormData,
}) => {
  const [designations, setDesignations] = useState([]);
  const [selectedDesignations, setSelectedDesignations] = useState([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [error, setError] = useState(null);
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
        "Something went wrong", // Title (optional)
        "Please uninstall the app\nand install the latest version to continue.", // Message with line break
        [{ text: "OK" }] // Button
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

  if (isLoading || isDataLoading) {
    return <Splash />;
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Select Your Designation(s)</Text>
          <Text style={styles.subtitle}>You can select multiple options</Text>
          {error && <Text style={styles.error}>{error}</Text>}
        </View>

        <View style={styles.listWrapper}>
          <FlatList
            data={designations.slice(0, visibleCount)}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />

          {visibleCount < designations.length && (
            <TouchableOpacity onPress={loadMore}>
              <Text style={styles.loadMoreText}>Load More</Text>
            </TouchableOpacity>
          )}
        </View>

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
    padding: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
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

export default Designation;
