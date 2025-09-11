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
import { Ionicons } from "@expo/vector-icons";
import SearchBox from "../../common/SearchBox";

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
  const [expandedCountries, setExpandedCountries] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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

  useEffect(() => {
    if (zones && zones.length > 0) {
      const allCountries = [
        ...new Set(zones.filter((z) => z.country != null).map((z) => z.country)),
      ];
      setExpandedCountries(allCountries);
    }
  }, [zones]);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchText]);

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
              navigation.navigate("Home");
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

  const toggleCountry = (country) => {
    setExpandedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country]
    );
  };

  const filteredZones = debouncedSearch
    ? zones.filter(
        (zone) =>
          zone.zone_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          (zone.country && zone.country.toLowerCase().includes(debouncedSearch.toLowerCase()))
      )
    : zones;

  const groupedZones = filteredZones.reduce(
    (acc, zone) => {
      if (zone.country == null) {
        acc.nullCountry.push(zone);
      } else {
        if (!acc.byCountry[zone.country]) acc.byCountry[zone.country] = [];
        acc.byCountry[zone.country].push(zone);
      }
      return acc;
    },
    { byCountry: {}, nullCountry: [] }
  );

  const sortedCountryNames = Object.keys(groupedZones.byCountry).sort((a, b) =>
    a.localeCompare(b)
  );

  sortedCountryNames.forEach((country) => {
    groupedZones.byCountry[country].sort((a, b) =>
      a.zone_name.localeCompare(b.zone_name)
    );
  });

  groupedZones.nullCountry.sort((a, b) => a.zone_name.localeCompare(b.zone_name));

  const selectedZoneItems = zones.filter((zone) =>
    selectedZones.includes(zone.zone_id)
  );

  const handleRemoveSelectedZone = (zoneId) => {
    setSelectedZones((prev) => prev.filter((id) => id !== zoneId));
  };

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

      <SearchBox
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search zone or country..."
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {selectedZoneItems.length > 0 && (
          <View style={styles.selectedZoneTagsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.selectedZoneTagsRow}
            >
              {selectedZoneItems.map((item) => (
                <View key={item.zone_id} style={styles.selectedZoneTag}>
                  <Text
                    style={styles.selectedZoneTagText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.zone_name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveSelectedZone(item.zone_id)}
                    style={styles.selectedZoneTagIcon}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={18} color="#d32f2f" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <View style={styles.hr} />
          </View>
        )}

        {sortedCountryNames.length === 0 && groupedZones.nullCountry.length === 0 ? (
          <Text style={styles.noItem}>No zones available.</Text>
        ) : (
          <>
            {sortedCountryNames.map((country) => {
              const countryZones = groupedZones.byCountry[country];
              const selected = countryZones.filter((z) =>
                selectedZones.includes(z.zone_id)
              );
              const available = countryZones.filter(
                (z) => !selectedZones.includes(z.zone_id)
              );
              const isExpanded = expandedCountries.includes(country);
              return (
                <View key={country} style={styles.sectionContainer}>
                  <TouchableOpacity
                    style={styles.countryHeaderWrapper}
                    onPress={() => toggleCountry(country)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.countryHeader}>{country}</Text>
                    <Text style={styles.arrowIcon}>
                      {isExpanded ? "\u25BC" : "\u25B6"}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.hr} />
                  {isExpanded && (
                    <>
                      {selected.length > 0 && (
                        <>
                          <Text style={styles.sectionHeader}>Selected Zones</Text>
                          <FlatList
                            data={selected}
                            renderItem={renderZoneItem}
                            keyExtractor={(item) => item.zone_id.toString()}
                            numColumns={2}
                            scrollEnabled={false}
                          />
                        </>
                      )}
                      <Text style={styles.sectionHeader}>
                        {selected.length > 0 ? "Available Zones" : "All Zones"}
                      </Text>
                      <FlatList
                        data={available}
                        renderItem={renderZoneItem}
                        keyExtractor={(item) => item.zone_id.toString()}
                        numColumns={2}
                        scrollEnabled={false}
                      />
                      <View style={styles.hr} />
                    </>
                  )}
                </View>
              );
            })}
            {groupedZones.nullCountry.length > 0 && (
              <View style={styles.sectionContainer}>
                <FlatList
                  data={groupedZones.nullCountry}
                  renderItem={renderZoneItem}
                  keyExtractor={(item) => item.zone_id.toString()}
                  numColumns={2}
                  scrollEnabled={false}
                />
                <View style={styles.hr} />
              </View>
            )}
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

const styles = StyleSheet.create({
  ...Profile,
  selectedZoneTagsContainer: {
    paddingVertical: 8,
    paddingLeft: 8,
    minHeight: 40,
  },
  selectedZoneTagsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedZoneTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e4fbfb",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#b2dfdb",
    maxWidth: 180,
  },
  selectedZoneTagText: {
    fontSize: 15,
    color: "#1a3d6d",
    marginRight: 6,
    fontWeight: "500",
    flexShrink: 1,
  },
  selectedZoneTagIcon: {
    padding: 2,
  },
  countryHeaderWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
    marginTop: 16,
    justifyContent: "flex-start",
    paddingRight: 8,
  },
  countryHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a3d6d",
    letterSpacing: 0.5,
    paddingVertical: 2,
    paddingLeft: 2,
    flex: 1,
  },
  arrowIcon: {
    fontSize: 22,
    color: "#1a3d6d",
    marginLeft: 12,
    marginRight: 4,
  },
  hr: {
    width: "100%",
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 8,
  },
});

export default Zones;
