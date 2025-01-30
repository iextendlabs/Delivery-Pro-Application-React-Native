import React, { useState } from "react";
import {
View,
Text,
TouchableOpacity,
StyleSheet,
TextInput,
Image,
} from "react-native";
import CommonButton from "../common/CommonButton";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ShortHolidayURL } from "../config/Api";
import { format } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function HolidayModal() {
  const navigation = useNavigation();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [hours, setHours] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const setSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
  };

  const setError = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage("");
    }, 5000);
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (event, time) => {
    setShowTimePicker(false);
    if (time) {
      setSelectedTime(time);
    }
  };

  const handleModalClose = () => {
    setSuccessMessage("");
    setErrorMessage("");
    setSelectedDate(new Date());
    setSelectedTime(new Date());
    setHours("");
    navigation.navigate("Holidays");
  };

  const handleSubmit = async () => {
    if (hours.trim() === "") {
      setError("Please enter hours.");
      return;
    }

    if (selectedDate === "") {
      setError("Please select a date.");
      return;
    }

    if (selectedTime === "") {
      setError("Please select a start time.");
      return;
    }

    setLoading(true);
    let userId = await AsyncStorage.getItem("@user_id");

    try {
      const response = await axios.post(ShortHolidayURL, {
        hours: hours,
        staff_id: userId,
        date: format(selectedDate, "yyyy-MM-dd"),
        time_start: format(selectedTime, "HH:mm"),
        status: 0,
      });

      if (response.status === 200) {
        setSuccess("Your Short Holiday Request has been sent to Admin.");
        setHours("");
        setLoading(false);
      } else {
        setLoading(false);
        throw new Error("Failed to request Short Holiday.");
      }
    } catch (error) {
      setLoading(false);
      setError("Failed to request Short Holiday. Please try again.");
    }
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Apply Short Holiday</Text>

        {/* Conditional Rendering for Success and Error Messages */}
        {successMessage !== "" && (
          <Text style={styles.successMessage}>{successMessage}</Text>
        )}
        {errorMessage !== "" && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}

        {/* Select Date */}
        <View style={styles.dateTimeContainer}>
          <Text style={styles.label}>Select Date:</Text>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateTimeText}>
              {format(selectedDate, "yyyy-MM-dd")}
            </Text>
            <Image
              style={styles.icon}
              source={require("../images/calendar.png")} // Replace with your calendar icon path
            />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {/* Select Time */}
        <View style={styles.dateTimeContainer}>
          <Text style={styles.label}>Select Start Time:</Text>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.dateTimeText}>
              {format(selectedTime, "HH:mm")}
            </Text>
            <Image
              style={styles.icon}
              source={require("../images/clock.png")} // Replace with your clock icon path
            />
          </TouchableOpacity>
        </View>

        {showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}

        {/* Text Input for Hours */}
        <Text style={styles.label}>Hours:</Text>
        <TextInput
          style={styles.amountInput}
          value={hours}
          onChangeText={setHours}
          placeholder="Enter your hours"
          keyboardType="numeric"
        />

        {/* Apply Button */}
        <CommonButton
          disabled={loading}
          title={loading ? "Applying..." : "Apply"}
          bgColor="#24a0ed"
          textColor="#fff"
          onPress={handleSubmit}
        />

        <CommonButton
          disabled={loading}
          title="Close"
          bgColor="#fd245f"
          textColor="#fff"
          onPress={handleModalClose}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    width: "90%",
    alignSelf: "center",
    flexDirection: "column",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    margin: 20,
  },
  dateTimeContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    justifyContent: "space-between",
    elevation: 2, // Adding slight shadow for a lifted look
  },
  dateTimeText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  icon: {
    width: 22,
    height: 22,
    tintColor: "#24a0ed", // Icon color (blueish)
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#555",
  },
  amountInput: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
  },
  successMessage: {
    color: "green",
    marginTop: 10,
    fontSize: 16,
  },
  errorMessage: {
    color: "red",
    marginTop: 10,
    fontSize: 16,
  },
});
