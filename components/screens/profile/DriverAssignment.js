import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import StepNavigation from "./StepNavigation";
import { loadAndRefreshTimeSlotData } from "../../Database/dataTimeSlot";
import { loadAndRefreshDriverData } from "../../Database/dataDriver";
import { Picker } from "@react-native-picker/picker";
import Splash from "../Splash";
import { getDatabase } from "../../Database/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Profile from "../../styles/Profile";

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function formatTime(timeStr) {
  if (!timeStr) return "";
  let [hour, minute] = timeStr.split(":");
  hour = parseInt(hour, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

function formatSlot(slot) {
  return `${formatTime(slot.time_start)} --- ${formatTime(slot.time_end)}`;
}

const COLORS = [
  "#FFEBEE",
  "#E3F2FD",
  "#E8F5E9",
  "#FFFDE7",
  "#F3E5F5",
  "#FFF3E0",
  "#E0F2F1",
];

const DriverAssignment = ({
  currentStep,
  totalSteps,
  onBack,
  onPrevious,
  formData,
  onNext,
  setFormData,
}) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(WEEK_DAYS[0]);

  const [assignments, setAssignments] = useState(
    formData?.driverAssignments
      ? { ...formData.driverAssignments }
      : WEEK_DAYS.reduce((acc, day) => {
          acc[day] = [{ driverId: null, timeSlotId: null }];
          return acc;
        }, {})
  );

  useEffect(() => {
    if (formData?.driverAssignments) {
      setAssignments({ ...formData.driverAssignments });
    }
  }, [formData?.driverAssignments]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsDataLoading(true);
    try {
      const driverData = await loadAndRefreshDriverData();
      if (driverData?.data && Array.isArray(driverData.data)) {
        setDrivers(driverData.data);
      }

      const timeSlotsData = await loadAndRefreshTimeSlotData();
      if (!timeSlotsData?.data || !Array.isArray(timeSlotsData.data)) {
        throw new Error("No valid timeSlot data found");
      }

      const filteredTimeSlots = timeSlotsData.data.filter(
        (slot) =>
          formData.timeSlots.includes(slot.id)
      );

      setTimeSlots(filteredTimeSlots);
    } catch (error) {
      alert("Failed to load drivers or time slots.");
    }
    setIsDataLoading(false);
  };

  const updateAssignments = (newAssignments) => {
    setAssignments(newAssignments);
  };

  const handleAddRow = (day) => {
    const newAssignments = {
      ...assignments,
      [day]: [...assignments[day], { driverId: null, timeSlotId: null }],
    };
    updateAssignments(newAssignments);
  };

  const handleRemoveRow = (day, idx) => {
    const newAssignments = {
      ...assignments,
      [day]: assignments[day].filter((_, i) => i !== idx),
    };
    updateAssignments(newAssignments);
  };

  const handleChange = (day, idx, field, value) => {
    const newAssignments = {
      ...assignments,
      [day]: assignments[day].map((row, i) =>
        i === idx ? { ...row, [field]: value } : row
      ),
    };
    updateAssignments(newAssignments);
  };

  const handleNextPress = async () => {
    const userId = await AsyncStorage.getItem("@user_id");

    setIsLoading(true);
    const cleanedAssignments = {};
    Object.entries(assignments).forEach(([day, dayRows]) => {
      const filteredRows = dayRows.map((row) => {
        if (row.timeSlotId === null || row.driverId === null) {
          return {
            ...row,
            driverId: null,
            timeSlotId: null,
            staffId: userId,
          };
        }
        return {
          ...row,
          staffId: userId,
        };
      });

      if (filteredRows.length > 0) {
        cleanedAssignments[day] = filteredRows;
      }
    });

    const db = await getDatabase();
    try {
      await db.execAsync("BEGIN TRANSACTION");

      await db.runAsync("DELETE FROM staff_drivers");

      if (cleanedAssignments && Object.keys(cleanedAssignments).length > 0) {
        for (const [day, assignmentsArr] of Object.entries(
          cleanedAssignments
        )) {
          for (const assignment of assignmentsArr) {
            await db.runAsync(
              "INSERT INTO staff_drivers (staff_id, driver_id, day, time_slot_id) VALUES (?, ?, ?, ?)",
              [
                assignment.staffId,
                assignment.driverId,
                day,
                assignment.timeSlotId,
              ]
            );
          }
        }
      }
      await db.execAsync("COMMIT");
      setFormData((prev) => ({
        ...prev,
        driverAssignments: cleanedAssignments,
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

  const renderTabs = () => (
    <View style={styles.tabBarWrapper}>
      <View style={styles.tabBar}>
        {WEEK_DAYS.map((day) => (
          <TouchableOpacity
            key={day}
            style={[styles.tab, selectedDay === day && styles.activeTab]}
            onPress={() => setSelectedDay(day)}
          >
            <Text
              style={[
                styles.tabText,
                selectedDay === day && styles.activeTabText,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={styles.addBtnTab}
        onPress={() => handleAddRow(selectedDay)}
      >
        <Text style={styles.addBtnText}>＋ Add Assignment</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading || isDataLoading) {
    return <Splash />;
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Driver Assignment</Text>
        <Text style={styles.helperText}>Please note: This is a paid service. If you're not interested, feel free to skip this step and continue to the next one.</Text>
      </View>
      {renderTabs()}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[
            styles.daySection,
            {
              backgroundColor:
                COLORS[WEEK_DAYS.indexOf(selectedDay) % COLORS.length],
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 6,
              elevation: 2,
            },
          ]}
        >
          <Text style={styles.dayTitle}>{selectedDay}</Text>
          {assignments[selectedDay].map((row, idx) => (
            <View key={idx} style={styles.row}>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={
                    row.driverId === null ? "__none__" : String(row.driverId)
                  }
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                  dropdownIconColor="#1976D2"
                  onValueChange={(value) =>
                    handleChange(
                      selectedDay,
                      idx,
                      "driverId",
                      value === "__none__" ? null : Number(value)
                    )
                  }
                >
                  <Picker.Item
                    label="Select Driver"
                    value="__none__"
                    color="#888"
                  />
                  {drivers.map((d) => (
                    <Picker.Item
                      key={d.id}
                      label={d.name}
                      value={String(d.id)}
                      color={row.driverId === d.id ? "#1976D2" : "#222"}
                      style={
                        row.driverId === d.id
                          ? styles.selectedPickerItem
                          : styles.pickerItem
                      }
                    />
                  ))}
                </Picker>
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={
                    row.timeSlotId === null
                      ? "__none__"
                      : String(row.timeSlotId)
                  }
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                  dropdownIconColor="#388E3C"
                  onValueChange={(value) =>
                    handleChange(
                      selectedDay,
                      idx,
                      "timeSlotId",
                      value === "__none__" ? null : Number(value)
                    )
                  }
                >
                  <Picker.Item
                    label="Select Time Slot"
                    value="__none__"
                    color="#888"
                  />
                  {timeSlots.map((t) => (
                    <Picker.Item
                      key={t.id}
                      label={formatSlot(t)}
                      value={String(t.id)}
                      color={row.timeSlotId === t.id ? "#388E3C" : "#222"}
                      style={
                        row.timeSlotId === t.id
                          ? styles.selectedPickerItem
                          : styles.pickerItem
                      }
                    />
                  ))}
                </Picker>
              </View>
              {idx !== 0 && (
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemoveRow(selectedDay, idx)}
                >
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
      <StepNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={onBack}
        onPrevious={onPrevious}
        onNext={handleNextPress}
        onSubmit={() => alert("Submit")}
        showSkip = "true"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create(Profile);


export default DriverAssignment;
