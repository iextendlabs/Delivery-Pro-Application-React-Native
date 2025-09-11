import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
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
import SearchBox from "../../common/SearchBox";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [groupedDesignations, setGroupedDesignations] = useState([]);
  const [expandedParents, setExpandedParents] = useState([]);
  const [visibleParentCount, setVisibleParentCount] = useState(ITEMS_PER_PAGE);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const toggleParent = (parentId) => {
    setExpandedParents((prev) =>
      prev.includes(parentId)
        ? prev.filter((id) => id !== parentId)
        : [...prev, parentId]
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    if (formData?.designations) {
      setSelectedDesignations(formData.designations);
      setGroupedDesignations((prevGroups) => {
        if (!Array.isArray(prevGroups)) return prevGroups;
        const selectedParentIds = formData.designations.filter((id) => {
          const item = designations.find((d) => d.id === id);
          return item && item.parent_id === null;
        });
        const unselectedGroups = prevGroups.filter(
          (g) => !selectedParentIds.includes(g.parent.id)
        );
        const selectedGroups = prevGroups.filter((g) =>
          selectedParentIds.includes(g.parent.id)
        );
        const reorderChildren = (group) => {
          const selectedChildIds = formData.designations.filter((id) => {
            const item = designations.find((d) => d.id === id);
            return item && item.parent_id === group.parent.id;
          });
          const unselectedChildren = group.children.filter(
            (c) => !selectedChildIds.includes(c.id)
          );
          const selectedChildren = group.children.filter((c) =>
            selectedChildIds.includes(c.id)
          );
          return {
            ...group,
            children: [...selectedChildren, ...unselectedChildren],
          };
        };
        const reorderedSelectedGroups = selectedGroups.map(reorderChildren);
        const reorderedUnselectedGroups = unselectedGroups.map(reorderChildren);
        return [...reorderedSelectedGroups, ...reorderedUnselectedGroups];
      });
    }
    setIsLoading(false);
  }, [formData, designations]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchText]);

  const filteredGroups = debouncedSearch
    ? groupedDesignations
        .map(({ parent, children }) => {
          const parentMatch = parent.name
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase());
          const filteredChildren = children.filter((child) =>
            child.name.toLowerCase().includes(debouncedSearch.toLowerCase())
          );
          if (parentMatch || filteredChildren.length > 0) {
            return {
              parent,
              children: filteredChildren,
            };
          }
          return null;
        })
        .filter(Boolean)
    : groupedDesignations.slice(0, visibleParentCount);

  const fetchData = async () => {
    setIsDataLoading(true);
    try {
      const subtitleData = await loadAndRefreshSubTitleData();
      if (!subtitleData?.data || !Array.isArray(subtitleData.data)) {
        throw new Error("No valid subtitle data found");
      }
      const sortedData = [...subtitleData.data].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      );
      setDesignations(sortedData);
      const parents = sortedData.filter((item) => item.parent_id === null);
      const children = sortedData.filter((item) => item.parent_id !== null);
      const grouped = parents.map((parent) => ({
        parent,
        children: children.filter((child) => child.parent_id === parent.id),
      }));
      setGroupedDesignations(grouped);
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
    setSelectedDesignations((prevSelected) => {
      const parent = designations.find(
        (item) => item.id === id && item.parent_id === null
      );
      const child = designations.find(
        (item) => item.id === id && item.parent_id !== null
      );
      let updated = [...prevSelected];

      if (prevSelected.includes(id)) {
        updated = updated.filter((item) => item !== id);
        if (child) {
          const siblings = designations.filter(
            (item) => item.parent_id === child.parent_id && item.id !== id
          );
          const anySiblingSelected = siblings.some((sib) =>
            updated.includes(sib.id)
          );
          if (!anySiblingSelected) {
            updated = updated.filter((item) => item !== child.parent_id);
          }
        }
      } else {
        updated.push(id);
        if (child) {
          if (!updated.includes(child.parent_id)) {
            updated.push(child.parent_id);
          }
        }
      }
      return updated;
    });
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
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Select Your Designation(s)</Text>
          <Text style={styles.subtitle}>You can select multiple options</Text>
        </View>

        <SearchBox
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search designation/subtitle..."
        />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {filteredGroups.map(({ parent, children }) => (
            <View key={parent.id}>
              <TouchableOpacity
                style={[
                  styles.itemButton,
                  selectedDesignations.includes(parent.id) &&
                    styles.selectedButton,
                  children.length > 0 && styles.parentWithChildren,
                ]}
                onPress={() => {
                  if (children.length > 0) {
                    toggleParent(parent.id);
                  } else {
                    toggleDesignation(parent.id);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.itemText,
                    selectedDesignations.includes(parent.id) &&
                      styles.selectedText,
                  ]}
                >
                  {parent.name}
                </Text>
                {children.length > 0 && (
                  <Text style={styles.arrowIcon}>
                    {expandedParents.includes(parent.id) ? "\u25BC" : "\u25B6"}
                  </Text>
                )}
              </TouchableOpacity>
              {children.length > 0 && expandedParents.includes(parent.id) && (
                <>
                  <FlatList
                    data={children}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    renderItem={renderItem}
                    scrollEnabled={false}
                  />
                  <View style={styles.hr} />
                </>
              )}
            </View>
          ))}
          {!debouncedSearch &&
            visibleParentCount < groupedDesignations.length && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={() =>
                  setVisibleParentCount((prev) => prev + ITEMS_PER_PAGE)
                }
              >
                <Text style={styles.loadMoreText}>Load More</Text>
              </TouchableOpacity>
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
    </SafeAreaView>
  );
};

const styles = {
  ...Profile,
  arrowIcon: {
    marginLeft: 8,
    fontSize: 18,
    color: "#555",
    alignSelf: "center",
  },
  parentWithChildren: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hr: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 8,
    marginHorizontal: 10,
  },
};

export default Designation;
