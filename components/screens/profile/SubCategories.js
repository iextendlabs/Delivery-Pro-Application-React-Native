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
import AsyncStorage from "@react-native-async-storage/async-storage";

const SubCategories = ({
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
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  useEffect(() => {
    return () => setMounted(false);
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
      setCategories(categories.data);

      const hasChild = categories.data.some((cat) =>
        formData.categories.includes(cat.parent_id)
      );
      if (!hasChild) {
        AsyncStorage.setItem("@subCategory", "0");
        handleNextPress(formData.categories);
      }
    } catch (error) {
      Alert.alert(
        "Something went wrong",
        "Please uninstall the app\nand install the latest version to continue.",
        [{ text: "OK" }]
      );
    }
    setIsDataLoading(false);
  };

  const handleNextPress = async (finalCategories = selectedCategories) => {
    if (!finalCategories || finalCategories.length < 1) {
      Alert.alert("Validation Error", "Please select at least one category.");
      return;
    }
    setIsLoading(true);

    const db = await getDatabase();

    const uniqueCategories = Array.from(new Set(finalCategories));
    try {
      await db.execAsync("BEGIN TRANSACTION");

      for (const id of uniqueCategories) {
        await db.runAsync(
          "INSERT OR IGNORE INTO staff_categories (category_id) VALUES (?)",
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

  const getGroupedSubCategories = () => {
    return selectedCategories
      .map((parentId) => {
        const parent = categories.find((cat) => cat.id === parentId);
        const children = categories.filter((cat) => cat.parent_id === parentId);
        return children.length > 0 ? { parent, children } : null;
      })
      .filter(Boolean);
  };

  const toggleCategory = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  if (isLoading || isDataLoading) {
    return <Splash />;
  }

  const grouped = getGroupedSubCategories();

  if (!grouped.length) return null;

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {/* Top Header remains the same */}
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Select Subcategories</Text>
          <Text style={styles.infoText}>
            Please select subcategories for each of your chosen categories
            below.
          </Text>
          {error && <Text style={styles.error}>{error}</Text>}
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {grouped.map(({ parent, children }) => (
            <View key={parent.id} style={styles.categoryGroup}>
              <Text style={styles.parentTitle}>
                Subcategories of{" "}
                <Text style={styles.parentName}>{parent.title}</Text>
              </Text>
              <View style={styles.itemsContainer}>
                {children.map((child) => (
                  <TouchableOpacity
                    key={child.id}
                    style={[
                      styles.itemButton,
                      selectedCategories.includes(child.id) &&
                        styles.selectedButton,
                    ]}
                    onPress={() => toggleCategory(child.id)}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        selectedCategories.includes(child.id) &&
                          styles.selectedText,
                      ]}
                      numberOfLines={2}
                      adjustsFontSizeToFit={true}
                      minimumFontScale={0.8}
                    >
                      {child.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>

        <StepNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          onBack={onBack}
          onPrevious={onPrevious}
          onNext={() => handleNextPress()}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  categoryGroup: {
    marginBottom: 20,
  },
  parentTitle: {
    fontWeight: "bold",
    fontSize: 16,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  itemsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  itemButton: {
    width: "48%",
    minHeight: 60,
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedButton: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  itemText: {
    color: "#333",
    textAlign: "center",
    fontSize: 14,
  },
  selectedText: {
    color: "#fff",
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  parentName: {
    color: "#007AFF",
    fontWeight: "bold",
  },
});

export default SubCategories;
