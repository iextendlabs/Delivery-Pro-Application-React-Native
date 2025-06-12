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
import { loadAndRefreshCategoryData } from "../../Database/dataCategories";
import { getDatabase } from "../../Database/database";
import Splash from "../Splash";

const ITEMS_PER_PAGE = 10;
const Categories = ({
  currentStep,
  totalSteps,
  onBack,
  onPrevious,
  formData,
  onNext,
  setFormData,
}) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(true);
  const [visibleCategoriesCount, setVisibleCategoriesCount] =
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
    if (formData?.categories) {
      setSelectedCategories(formData.categories);
    }
    setIsLoading(false);
  }, [formData]);

  const fetchData = async () => {
    if (!mounted || !formData) return;
    setIsDataLoading(true);
    try {
      const categories = await loadAndRefreshCategoryData();
      if (!categories?.data || !Array.isArray(categories.data)) {
        throw new Error("No valid Categories data found");
      }
      const mainCats = categories.data.filter(
        (cat) => !cat.parent_id || cat.parent_id === 0
      );
      setCategories(mainCats);
    } catch (error) {
      Alert.alert(
        "Something went wrong", // Title (optional)
        "Please uninstall the app\nand install the latest version to continue.", // Message with line break
        [{ text: "OK" }] // Button
      );
    }
    setIsDataLoading(false);
  };

  const handleNextPress = async () => {
    if (selectedCategories.length < 1) {
      Alert.alert("Validation Error", "Please select at least one category.");
      return;
    }
    setIsLoading(true);

    const db = await getDatabase();

    const uniqueCategories = Array.from(new Set(selectedCategories));

    try {
      await db.execAsync("BEGIN TRANSACTION");

      await db.runAsync("DELETE FROM staff_categories");

      for (const id of uniqueCategories) {
        await db.runAsync(
          "INSERT INTO staff_categories (category_id) VALUES (?)",
          [id]
        );
      }

      await db.execAsync("COMMIT");
      setFormData((prev) => ({
        ...prev,
        categories: uniqueCategories,
      }));
      setIsLoading(false);
      onNext();
    } catch (error) {
      await db.execAsync("ROLLBACK");
      console.error("[CATEGORIES ERROR] Failed to save:", error);
      Alert.alert("Error", "Failed to save selected categories.");
    }
    setIsLoading(false);
  };

  const toggleCategory = (id) => {
    const newCategories = selectedCategories.includes(id)
      ? selectedCategories.filter((item) => item !== id)
      : [...selectedCategories, id];

    setSelectedCategories(newCategories);
  };

  const loadMore = () => {
    setVisibleCategoriesCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.itemButton,
        selectedCategories.includes(item.id) && styles.selectedButton,
      ]}
      onPress={() => toggleCategory(item.id)}
    >
      <Text
        style={[
          styles.itemText,
          selectedCategories.includes(item.id) && styles.selectedText,
        ]}
      >
        {item.title}
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
          <Text style={styles.sectionTitle}>Categories Selection</Text>
          {error && <Text style={styles.error}>{error}</Text>}
        </View>

        {/* Scrollable FlatList */}
        <View style={styles.listWrapper}>
          <FlatList
            data={categories.slice(0, visibleCategoriesCount)}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />

          {visibleCategoriesCount < categories.length && (
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

export default Categories;
