import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import StepNavigation from "./StepNavigation";
import { loadAndRefreshTimeSlotData } from "../../Database/dataTimeSlot";
import Splash from "../Splash";
import { getDatabase } from "../../Database/database";
import Profile from "../../styles/Profile";

const TimeSlots = ({
  currentStep,
  totalSteps,
  onBack,
  onPrevious,
  formData,
  onNext,
  setFormData,
}) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [mounted, setMounted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  useEffect(() => {
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!mounted || !formData) return;
    setIsDataLoading(true);
    try {
      const timeSlotsData = await loadAndRefreshTimeSlotData();
      if (!timeSlotsData?.data || !Array.isArray(timeSlotsData.data)) {
        throw new Error("No valid timeSlot data found");
      }

      setTimeSlots(timeSlotsData.data);

      const filteredTimeSlotIds = timeSlotsData.data.map((item) => item.id);
      const selectedTimeSlots =
        formData.timeSlots?.filter((id) => filteredTimeSlotIds.includes(id)) ||
        [];

      setSelectedTimeSlots(selectedTimeSlots);
    } catch (error) {
      Alert.alert(
        "Something went wrong",
        "Please wait a moment and try again later.\n\nWe're currently experiencing some technical issues.\nThank you for your patience.",
        [{ text: "OK" }]
      );
    }
    setIsDataLoading(false);
  };

  const handleNextPress = async () => {
    setIsLoading(true);

    const db = await getDatabase();

    try {
      await db.execAsync("BEGIN TRANSACTION");

      await db.runAsync("DELETE FROM staff_timeSlots");

      for (const id of selectedTimeSlots) {
        await db.runAsync(
          "INSERT INTO staff_timeSlots (timeSlot_id) VALUES (?)",
          [id]
        );
      }

      await db.execAsync("COMMIT");
      setFormData((prev) => ({
        ...prev,
        timeSlots: selectedTimeSlots,
      }));
      setIsLoading(false);
      onNext();
    } catch (error) {
      await db.execAsync("ROLLBACK");
      console.error("[TimeSlots ERROR] Failed to save:", error);
      Alert.alert("Error", "Failed to save selected TimeSlots.");
    }
    setIsLoading(false);
  };

  // Sort time slots - selected first, then unselected
  const sortedTimeSlots = [...timeSlots].sort((a, b) => {
    const aSelected = selectedTimeSlots.includes(a.id);
    const bSelected = selectedTimeSlots.includes(b.id);

    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });

  if (isLoading || isDataLoading) {
    return <Splash />;
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Select Your Time Slots</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {timeSlots.length === 0 ? (
          <Text style={styles.noItem}>No time slots available.</Text>
        ) : (
          <>
            {/* Selected Slots Section */}
            {selectedTimeSlots.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeader}>Selected Time Slots</Text>
                {sortedTimeSlots
                  .filter((slot) => selectedTimeSlots.includes(slot.id))
                  .map((slot) => renderTimeSlot(slot, true))}
              </View>
            )}

            {/* Available Slots Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>
                {selectedTimeSlots.length > 0
                  ? "Available Time Slots"
                  : "All Time Slots"}
              </Text>
              {sortedTimeSlots
                .filter((slot) => !selectedTimeSlots.includes(slot.id))
                .map((slot) => renderTimeSlot(slot, false))}
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

  // Helper function to render a time slot
  function renderTimeSlot(slot, isSelected) {
    const isSpecial = Boolean(slot.date);
    const startTime = formatTime(slot.time_start);
    const endTime = formatTime(slot.time_end);

    const handleToggle = () => {
      setSelectedTimeSlots((prev) =>
        prev.includes(slot.id)
          ? prev.filter((id) => id !== slot.id)
          : [...prev, slot.id]
      );
    };

    return (
      <TouchableOpacity
        key={slot.id}
        onPress={handleToggle}
        style={[
          styles.slotBox,
          isSelected && styles.selectedSlotBox,
          isSpecial && styles.specialSlotBox,
        ]}
        activeOpacity={0.8}
      >
        <View style={styles.slotHeader}>
          {isSpecial && (
            <Text style={styles.specialNote}>Only for {slot.date}</Text>
          )}
        </View>
        <Text style={styles.slotTime}>
          {startTime} — {endTime}
        </Text>
        <Text
          style={[
            styles.statusText,
            isSelected ? styles.selectedSlotText : styles.unselectedSlotText,
          ]}
        >
          {isSelected ? "✅ Selected" : "✋ Tap to select"}
        </Text>
      </TouchableOpacity>
    );
  }
};

// Helper to format time to AM/PM
function formatTime(timeStr) {
  if (!timeStr) return "";
  const [hour, minute] = timeStr.split(":");
  let h = parseInt(hour, 10);
  const m = minute;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

const styles = StyleSheet.create(Profile);

export default TimeSlots;
