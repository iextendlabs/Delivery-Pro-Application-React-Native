import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import StepNavigation from "./StepNavigation";
import { loadAndRefreshZoneData } from "../../Database/zoneData";
import Splash from "../Splash";
import { getDatabase } from "../../Database/database";
import Profile from "../../styles/Profile";
import { deleteSyncMetadataKey } from "../../Database/servicesRepository";
import { useNavigation } from "@react-navigation/native";

const Zones = ({
  currentStep,
  totalSteps,
  onBack,
  onPrevious,
  formData,
  onNext,
  setFormData,
}) => {
  const navigation = useNavigation();
  const [zones, setZones] = useState([]);
  const [selectedZones, setSelectedZones] = useState([]);
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
    if (formData?.staffZones) {
      setSelectedZones(formData.staffZones);
    }
  }, [formData]);

  const fetchData = async () => {
    if (!mounted || !formData) return;
    setIsDataLoading(true);
    try {
      const zonesData = await loadAndRefreshZoneData();
      if (!zonesData?.data || !Array.isArray(zonesData.data)) {
        throw new Error("No valid Zone data found");
      }
      setZones(zonesData.data);
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
                await db.execAsync(`DELETE FROM zone_data;`);
                await deleteSyncMetadataKey("zones");
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

  const handleNextPress = async () => {
    if (selectedZones.length < 1) {
      Alert.alert("Validation Error", "Please select at least one Zone.");
      return;
    }
    setIsLoading(true);

    const db = await getDatabase();

    try {
      await db.execAsync("BEGIN TRANSACTION");

      await db.runAsync("DELETE FROM staff_zones");

      for (const id of selectedZones) {
        await db.runAsync("INSERT INTO staff_zones (zone_id) VALUES (?)", [id]);
      }

      await db.execAsync("COMMIT");
      setFormData((prev) => ({
        ...prev,
        staffZones: selectedZones,
      }));
      setIsLoading(false);
      onNext();
    } catch (error) {
      await db.execAsync("ROLLBACK");
      console.error("[Zones ERROR] Failed to save:", error);
      Alert.alert("Error", "Failed to save selected Zones.");
    }
    setIsLoading(false);
  };

  const toggleZone = (id) => {
    setSelectedZones((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedZoneItems = zones.filter((zone) =>
    selectedZones.includes(zone.zone_id)
  );
  const availableZoneItems = zones.filter(
    (zone) => !selectedZones.includes(zone.zone_id)
  );

  const renderZoneItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.zoneBox,
        selectedZones.includes(item.zone_id) && styles.selectedZoneBox,
      ]}
      onPress={() => toggleZone(item.zone_id)}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.itemText,
          selectedZones.includes(item.zone_id) && styles.selectedText,
        ]}
      >
        {item.zone_name}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading || isDataLoading) {
    return <Splash />;
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Select Your Zones</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {zones.length === 0 ? (
          <Text style={styles.noItem}>No zones available.</Text>
        ) : (
          <>
            {selectedZoneItems.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeader}>Selected Zones</Text>
                <FlatList
                  data={selectedZoneItems}
                  renderItem={renderZoneItem}
                  keyExtractor={(item) => item.zone_id.toString()}
                  numColumns={2}
                  scrollEnabled={false}
                />
              </View>
            )}

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>
                {selectedZoneItems.length > 0 ? "Available Zones" : "All Zones"}
              </Text>
              <FlatList
                data={availableZoneItems}
                renderItem={renderZoneItem}
                keyExtractor={(item) => item.zone_id.toString()}
                numColumns={2}
                scrollEnabled={false}
              />
            </View>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create(Profile);

export default Zones;
