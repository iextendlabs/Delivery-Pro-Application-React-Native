import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
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
import { deleteSyncMetadataKey } from "../../Database/servicesRepository";
import { useNavigation } from "@react-navigation/native";
import SearchBox from "../../common/SearchBox";

const SubCategories = ({
  currentStep,
  totalSteps,
  onBack,
  onPrevious,
  formData,
  onNext,
  setFormData,
}) => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [mounted, setMounted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchText]);

  useEffect(() => {
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setIsLoading(true);

    if (formData?.categories) {
      const selectedCategories = new Set(formData.categories);

      const hasAllAncestorsSelected = (categoryId) => {
        const category = categories.find((c) => c.id === categoryId);
        if (!category?.parent_id) {
          return true;
        }
        return (
          selectedCategories.has(category.parent_id) &&
          hasAllAncestorsSelected(category.parent_id)
        );
      };

      const validCategories = Array.from(selectedCategories).filter((catId) =>
        hasAllAncestorsSelected(catId)
      );

      setSelectedCategories(validCategories);
    }

    setIsLoading(false);
  }, [formData, categories]);

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
        const parentCategories = formData.categories.filter((catId) => {
          const category = categories.data.find((c) => c.id === catId);
          return category && !category.parent_id;
        });

        AsyncStorage.setItem("@subCategory", "0");
        handleNextPress(parentCategories);
      }
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
                await db.execAsync(`DELETE FROM categories;`);
                await deleteSyncMetadataKey("categories");
              } catch (e) {
                // Optionally handle DB error
              }
              navigation.navigate("Home");
            },
          },
        ]
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
        const children = categories.filter(
          (cat) =>
            cat.parent_id === parentId &&
            (!debouncedSearch ||
              cat.title.toLowerCase().includes(debouncedSearch.toLowerCase()))
        );
        return children.length > 0 ? { parent, children } : null;
      })
      .filter(Boolean);
  };

  const toggleCategory = (id) => {
    setSelectedCategories((prev) => {
      if (prev.includes(id)) {
        const getDescendants = (parentId) => {
          const children = categories.filter(
            (cat) => cat.parent_id === parentId
          );
          const descendants = children.flatMap((child) => [
            child.id,
            ...getDescendants(child.id),
          ]);
          return descendants;
        };

        const descendantsToRemove = getDescendants(id);
        return prev.filter(
          (item) => item !== id && !descendantsToRemove.includes(item)
        );
      } else {
        return [...prev, id];
      }
    });
  };

  if (isLoading || isDataLoading) {
    return <Splash />;
  }

  const grouped = getGroupedSubCategories();

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Select Subcategories</Text>
          <Text style={styles.subtitle}>
            Please select subcategories for each of your chosen categories
            below.
          </Text>
        </View>

        <SearchBox
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search subcategories..."
        />
        {grouped.length === 0 ? (
          <View style={styles.noItemContainer}>
            <Text style={styles.noItemText}>No categories available</Text>
          </View>
        ) : (
          <>
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
          </>
        )}

        <StepNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          onBack={onBack}
          onPrevious={onPrevious}
          onNext={() => handleNextPress()}
          onSubmit={() => alert("Submit")}
          showScrollPrompt={true}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create(Profile);

export default SubCategories;
