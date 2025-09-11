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
import { loadAndRefreshCategoryData } from "../../Database/dataCategories";
import { getDatabase } from "../../Database/database";
import Splash from "../Splash";
import Profile from "../../styles/Profile";
import { deleteSyncMetadataKey } from "../../Database/servicesRepository";
import { useNavigation } from "@react-navigation/native";
import SearchBox from "../../common/SearchBox";

const ITEMS_PER_PAGE = 20;

const Categories = ({
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
  const [visibleCategoriesCount, setVisibleCategoriesCount] =
    useState(ITEMS_PER_PAGE);
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
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const loadMore = () => {
    setVisibleCategoriesCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const filteredCategories = debouncedSearch
    ? categories.filter((cat) =>
        cat.title.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : categories;

  const selectedItems = filteredCategories
    .filter((item) => selectedCategories.includes(item.id))
    .slice(0, visibleCategoriesCount);

  const availableItems = filteredCategories
    .filter((item) => !selectedCategories.includes(item.id))
    .slice(0, visibleCategoriesCount);

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
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Categories Selection</Text>
        </View>

        <SearchBox
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search categories..."
        />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {filteredCategories.length === 0 ? (
            <View style={styles.noItemContainer}>
              <Text style={styles.noItemText}>No categories available</Text>
            </View>
          ) : (
            <>
              {selectedItems.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionHeader}>Selected Categories</Text>
                  <FlatList
                    data={selectedItems}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    renderItem={renderItem}
                    scrollEnabled={false}
                  />
                </View>
              )}

              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeader}>
                  {selectedItems.length > 0
                    ? "Available Categories"
                    : "All Categories"}
                </Text>
                <FlatList
                  data={availableItems}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={2}
                  renderItem={renderItem}
                  scrollEnabled={false}
                />
              </View>

              {visibleCategoriesCount < filteredCategories.length &&
                renderLoadMoreButton()}
            </>
          )}
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

const styles = StyleSheet.create(Profile);

export default Categories;
