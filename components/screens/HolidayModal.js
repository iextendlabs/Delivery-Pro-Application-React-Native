import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    TextInput,
} from "react-native";
import { ShortHolidayURL } from "../config/Api";
import axios from "axios";
import { format } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HolidayModal = ({ visible, onClose, order }) => {
    const [hours, setHours] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
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
        setSelectedDate(new Date());
        setSelectedTime(new Date());
        setHours("")
        onClose();
    };

    const handleSubmit = async () => {
        if (hours.trim() === "") {
            setError("Please enter a hours.");
            return;
        }

        if (selectedDate === "") {
            setError("Please select date.");
            return;
        }

        if (selectedTime === "") {
            setError("Please select start time.");
            return;
        }

        setIsLoading(true);
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
                setSuccess("Your Short Holiday Request Send to Admin.");
                setHours("");
                setIsLoading(false);
            } else {
                setIsLoading(false);
                throw new Error("Failed to Request for Short Holiday.");
            }
        } catch (error) {
            setIsLoading(false);
            setError("Failed to Request for Short Holiday. Please try again.");
        }

        setIsLoading(false);
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalContainer}>
                <View style={styles.holidayModalContent}>
                    <Text style={styles.modalTitle}>Apply Short Holiday</Text>

                    <View style={styles.commentContainer}>
                        {/* Select Date */}
                        <View style={styles.dateContainer}>
                            <Text style={styles.label}>Select Date:</Text>
                            <TouchableOpacity
                                style={styles.changeButton}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text>Change</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.selectedDateTimeContainer}>
                            <Text style={styles.selectedDateTimeText}>
                                {format(selectedDate, "yyyy-MM-dd")}
                            </Text>
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
                        <View style={styles.dateContainer}>
                            <Text style={styles.label}>Select Start Time:</Text>
                            <TouchableOpacity
                                style={styles.changeButton}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <Text>Change</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.selectedDateTimeContainer}>
                            <Text style={styles.selectedDateTimeText}>
                                {format(selectedTime, "HH:mm")}
                            </Text>
                        </View>
                        {showTimePicker && (
                            <DateTimePicker
                                value={selectedTime}
                                mode="time"
                                display="default"
                                onChange={handleTimeChange}
                            />
                        )}

                        {/* Text Input */}
                        <Text style={styles.label}>Hours:</Text>
                        <TextInput
                            style={styles.amountInput}
                            value={hours}
                            onChangeText={setHours}
                            placeholder="Enter your Hours"
                        />

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            <Text style={styles.buttonText}>
                                {isLoading ? "Submitting..." : "Submit"}
                            </Text>
                        </TouchableOpacity>

                        {/* Success and Error Messages */}
                        {successMessage !== "" && (
                            <Text style={styles.successMessage}>{successMessage}</Text>
                        )}
                        {errorMessage !== "" && (
                            <Text style={styles.errorMessage}>{errorMessage}</Text>
                        )}
                    </View>

                    {/* Close Button */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={handleModalClose}
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({

    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    holidayModalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    commentContainer: {
        marginBottom: 20,
    },
    dateContainer: {
        width: '100%',
        justifyContent: 'space-between',
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectedDateTimeContainer: {
        marginLeft: 20,
        marginRight: 20,
        fontSize: 16,
    },
    selectedDateTimeText: {
        marginLeft: 20,
        marginRight: 20,
        fontSize: 16,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    amountInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        padding: 10,
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    successMessage: {
        color: 'green',
        marginTop: 10,
        fontSize: 16,
    },
    errorMessage: {
        color: 'red',
        marginTop: 10,
        fontSize: 16,
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#e0e0e0',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
    },
    changeButton: {
        borderWidth: 0.2,
        borderRadius: 4,
        padding: 7,
        marginRight: 20,
        alignSelf: 'center',
        justifyContent: 'center',
    },
});

export default HolidayModal;
