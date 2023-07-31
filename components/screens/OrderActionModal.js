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

const OrderActionModal = ({ visible, order, onClose }) => {
  const [selectedOrder, setSelectedOrder] = useState(order);
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

    // Simulating a POST request for posting comment
    try {
      // Replace the API_URL with your actual API endpoint
      const response = await fetch(
        RescheduleUrl +
          order.id +
          "?time_slot_id=" +
          selectedTimeSlotsId +
          "&date=" +
          selectedDate
      );
      if (!response.ok) {
        throw new Error("Failed to update time slots.");
      } else {
        setSuccessMessage("Time Slots update successfully.");
        handleModalClose();
        // setErrorMessage('');
      }
    } catch (error) {
      setErrorMessage("Failed to update time slots. Please try again.");
    }

    setIsLoading(false);
  };

  const handleAcceptOrder = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(OrderStatusUpdateUrl + order.id + "?status=Accepted");

      if (!response.ok) {
        throw new Error("Failed to accept order.");
      }

      setSuccessMessage("Order accepted successfully.");
      handleModalClose();

    } catch (error) {
      setErrorMessage("Failed to accept order. Please try again.");
    }

    setIsLoading(false);
  };

  const handleRejectOrder = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(OrderStatusUpdateUrl + order.id + "?status=Rejected");

      if (!response.ok) {
        throw new Error("Failed to reject order.");
      }

      setSuccessMessage("Order rejected successfully.");
      handleModalClose();

    } catch (error) {
      setErrorMessage("Failed to reject order. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
          <ScrollView>

      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Order Details</Text>
            {selectedOrder && (
              <View style={styles.orderDetails}>
                {/* Existing order details */}
              </View>
            )}
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
                      {isLoading ? "Submitting..." : "Submit"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={handleAcceptOrder}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? "Accepting..." : "Accept Order"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={handleRejectOrder}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>Reject Order</Text>
              </TouchableOpacity>
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
