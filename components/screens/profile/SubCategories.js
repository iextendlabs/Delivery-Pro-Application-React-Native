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
import Profile from "../../styles/Profile";

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
        "Please wait a moment and try again later.\n\nWe're currently experiencing some technical issues.\nThank you for your patience.",
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
          <Text style={styles.subtitle}>
            Please select subcategories for each of your chosen categories
            below.
          </Text>
        </View>

        {/* Scrollable Content */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
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
                      styles.subItemButton,
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

const styles = StyleSheet.create(Profile);

export default SubCategories;
