import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import {Picker} from '@react-native-picker/picker';
import { ScrollView } from "react-native-gesture-handler";
import { Calendar } from "react-native-calendars";
import OrderListStyle from "../styles/OrderListStyle";
import { OrderStatusUpdateUrl } from "../config/Api";
import { RescheduleUrl } from "../config/Api";
import { TimeSlotsUrl } from "../config/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const OrderActionModal = ({ visible, order, onClose }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [selectedTimeSlotsId, setSelectedTimeSlotsId] = useState();

  useEffect(() => {
    if (visible) {
      setSelectedDate(order.date);
    }
  }, [visible]);

  useEffect(() => {
    if (selectedDate !== "") {
      fetchTimeSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchTimeSlots = async (date) => {
    const userId = await AsyncStorage.getItem("@user_id");
    try {
      const response = await fetch(
        TimeSlotsUrl +
          "area=" +
          order.area +
          "&date=" +
          date +
          "&order_id=" +
          order.id +
          "&staff_id=" +
          userId
      );
      if (!response.ok) {
        throw new Error("Failed to fetch timeslots.");
      }
      const data = await response.json();
      if (data.length) {
        setTimeSlot(data[0].value);
        setSelectedTimeSlotsId(data[0].id);
      }
      setSelectedTimeSlots(data);
    } catch (error) {
      setErrorMessage("Failed to fetch timeslots. Please try again.");
    }
  };

  const handleModalClose = () => {
    onClose();
  };

  const handleSubmitComment = async () => {
    if (selectedTimeSlotsId === "") {
      setErrorMessage("Please Select time slot.");
      return;
    }

    setIsLoading(true);

    try {
      
      const response = await axios.post(RescheduleUrl,{
        order_id: order.id,
        time_slot_id: selectedTimeSlotsId,
        date: selectedDate,
      });

      if (response.status === 200) {
        setSuccessMessage("Time Slots update successfully.");
        handleModalClose();
      } else {
        throw new Error("Failed to update time slots.");
      }
    } catch (error) {
      setErrorMessage("Failed to update time slots. Please try again.");
    }
  
    setIsLoading(false);
  };

  const handleAcceptOrder = async () => {
    setIsLoading(true);

    try {
      
      const response = await axios.post(OrderStatusUpdateUrl,{
        order_id: order.id,
        status: "Accepted",
      });

      if (response.status === 200) {
        setSuccessMessage("Order Accepted successfully.");
        handleModalClose();
      } else {
        throw new Error("Failed to Accepted order.");
      }
    } catch (error) {
      setErrorMessage("Failed to Accepted order. Please try again.");
    }

    setIsLoading(false);
  };

  const handleRejectOrder = async () => {
    setIsLoading(true);

    try {
      
      const response = await axios.post(OrderStatusUpdateUrl,{
        order_id: order.id,
        status: "Rejected",
      });

      if (response.status === 200) {
        setSuccessMessage("Order Rejected successfully.");
        handleModalClose();
      } else {
        throw new Error("Failed to Rejected order.");
      }
    } catch (error) {
      setErrorMessage("Failed to Rejected order. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
          <ScrollView>

      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Update Order Schedule</Text>
            <View style={styles.commentContainer}>
              <Text style={styles.label}>Date:</Text>
              <Calendar
                markedDates={{
                  [selectedDate]: {
                    selected: true,
                    disableTouchEvent: true,
                    selectedColor: "blue",
                    selectedTextColor: "white",
                  },
                }}
                onDayPress={(day) => setSelectedDate(day.dateString)}
              />
              {selectedDate !== "" && (
                <>
                  <Text style={styles.label}>TimeSlots:</Text>
                  <Picker
                    style={styles.picker}
                    selectedValue={timeSlot}
                    onValueChange={(itemValue, itemIndex) => {
                      setTimeSlot(selectedTimeSlots[itemIndex].value);
                      setSelectedTimeSlotsId(selectedTimeSlots[itemIndex].id);
                    }}
                  >
                    {selectedTimeSlots.map((slot) => (
                      <Picker.Item
                        key={slot.id}
                        label={slot.value}
                        value={slot.value}
                      />
                    ))}
                  </Picker>
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmitComment}
                    disabled={isLoading}
                  >
                    <Text style={styles.buttonText}>
                      {isLoading ? "Submitting..." : "Save"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              {successMessage !== "" && (
                <Text style={styles.successMessage}>{successMessage}</Text>
              )}
              {errorMessage !== "" && (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              )}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleModalClose}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
        </View>
      </View>
      </ScrollView>

    </Modal>
  );
};

const styles = StyleSheet.create(OrderListStyle);

export default OrderActionModal;
