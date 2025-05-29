import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import StepNavigation from "./StepNavigation";
import { loadAndRefreshGroupZoneData } from "../../Database/groupData";
import Splash from "../Splash";
import { getDatabase } from "../../Database/database";

const GroupZones = ({
  currentStep,
  totalSteps,
  onBack,
  onPrevious,
  formData,
  onNext,
  setFormData,
}) => {
  const [groupZones, setGroupZones] = useState([]);
  const [selectedGroupZones, setSelectedGroupZones] = useState([]);
  const [mounted, setMounted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData?.staffGroups) {
      setSelectedGroupZones(formData.staffGroups);
    }
  }, [formData]);

  const fetchData = async () => {
    if (!mounted || !formData) return;
    setIsLoading(true);
    try {
      const groups = await loadAndRefreshGroupZoneData();
      if (!groups?.data || !Array.isArray(groups.data)) {
        throw new Error("No valid groupZone data found");
      }
      setGroupZones(groups.data);
    } catch (error) {
      console.error("[GroupZone ERROR]", error);
      Alert.alert("Error", "Failed to load groupZone data");
    }
    setIsLoading(false);
  };

  const handleNextPress = async () => {
    if (selectedGroupZones.length < 1) {
      Alert.alert("Validation Error", "Please select at least one Group Zone.");
      return;
    }
    setIsLoading(true);

    const db = await getDatabase();

    try {
      await db.execAsync("BEGIN TRANSACTION");

      await db.runAsync("DELETE FROM staff_groups");

      for (const id of selectedGroupZones) {
        await db.runAsync("INSERT INTO staff_groups (group_id) VALUES (?)", [
          id,
        ]);
      }

      await db.execAsync("COMMIT");
      setFormData((prev) => ({
        ...prev,
        staffGroups: selectedGroupZones,
      }));
      setIsLoading(false);
      onNext();
    } catch (error) {
      await db.execAsync("ROLLBACK");
      console.error("[GroupZones ERROR] Failed to save:", error);
      Alert.alert("Error", "Failed to save selected GroupZones.");
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <Splash />;
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Groups & Zones</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" style={{ marginTop: 30 }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {groupZones.map((group) => {
            const isSelected = selectedGroupZones.includes(group.group_id);

            const toggleSelection = () => {
              const updatedSelection = isSelected
                ? selectedGroupZones.filter((id) => id !== group.group_id)
                : [...selectedGroupZones, group.group_id];

              setSelectedGroupZones(updatedSelection);
            };

            return (
              <TouchableOpacity
                key={group.group_id}
                onPress={toggleSelection}
                style={[styles.groupCard, isSelected && styles.selectedCard]}
                activeOpacity={0.8}
              >
                <View>
                  <Text style={styles.label}>Group Name</Text>
                  <Text style={styles.groupTitle}>{group.group_name}</Text>

                  <Text style={[styles.label, { marginTop: 10 }]}>Zones</Text>
                  <View style={styles.zoneContainer}>
                    {group.zone_name.split(",").map((zone, index) => (
                      <View key={index} style={styles.zoneBadge}>
                        <Text style={styles.zoneText}>{zone.trim()}</Text>
                      </View>
                    ))}
                  </View>

                  <Text
                    style={[
                      styles.statusText,
                      isSelected ? styles.selectedText : styles.unselectedText,
                    ]}
                  >
                    {isSelected ? "✅ Selected" : "✋ Tap to select"}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <StepNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={onBack}
        onPrevious={onPrevious}
        onNext={handleNextPress}
        onSubmit={() => alert("Submit")}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  groupCard: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  selectedCard: {
    borderColor: "#007bff",
    backgroundColor: "#e6f0ff",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 5,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  zoneContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  zoneBadge: {
    backgroundColor: "#d1ecf1",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    marginRight: 6,
    marginBottom: 6,
  },
  zoneText: {
    color: "#0c5460",
    fontSize: 12,
  },
  statusText: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "600",
  },
  selectedText: {
    color: "#007bff",
  },
  unselectedText: {
    color: "#888",
  },
});

export default GroupZones;
