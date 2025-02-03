import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import CommonButton from "../common/CommonButton";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ShortHolidayURL,
  GetWithdrawPaymentMethodsUrl,
  WithdrawUrl,
} from "../config/Api";
import { Picker } from "@react-native-picker/picker"; // Import the Picker component

export default function WithdrawModal() {
  const navigation = useNavigation();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [accountDetail, setAccountDetail] = useState("");

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    setLoading(true);
    try {
      const user_id = await AsyncStorage.getItem("@user_id");

      const response = await axios.get(GetWithdrawPaymentMethodsUrl, {
        params: { user_id: user_id },
      });

      if (response.status === 200) {
        setPaymentMethods(response.data.payment_methods);
        setAmount(response.data.total_balance);
      }
    } catch (error) {
      setError("Failed to fetch payment methods. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const setSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage("");
    }, 10000);
  };

  const setError = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage("");
    }, 10000);
  };

  const handleModalClose = () => {
    setSuccessMessage("");
    setErrorMessage("");
    setAmount("");
    setSelectedPaymentMethod("");
    setAccountDetail("");
    navigation.navigate("Withdraws");
  };

  const handleSubmit = async () => {
    if (amount.trim() === "") {
      setError("Please enter amount.");
      return;
    }

    if (selectedPaymentMethod.trim() === "") {
      setError("Please select a payment method.");
      return;
    }

    if (accountDetail.trim() === "") {
      setError("Please enter account details.");
      return;
    }

    setLoading(true);

    try {
      const user_id = await AsyncStorage.getItem("@user_id");

      const response = await axios.post(WithdrawUrl, {
        amount: amount,
        payment_method: selectedPaymentMethod,
        account_detail: accountDetail,
        user_id: user_id,
      });

      if (response.status === 200) {
        setSuccess("Your withdrawal request has been sent.");
        setAmount("");
        setAccountDetail("");
        setSelectedPaymentMethod("");
        setErrorMessage("");
        setLoading(false);
      } else if (response.status === 201) {
        setLoading(false);
        setError(response.data.msg);
        setAmount("");
        setAccountDetail("");
        setSelectedPaymentMethod("");
      }
    } catch (error) {
      setLoading(false);
      setError("Failed to request withdrawal. Please try again.");
    }
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Withdraw</Text>

        {successMessage !== "" && (
          <Text style={styles.successMessage}>{successMessage}</Text>
        )}
        {errorMessage !== "" && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}

        {/* Amount Input */}
        <Text style={styles.label}>Amount:</Text>
        <TextInput
          style={styles.amountInput}
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter withdrawal amount"
          keyboardType="numeric"
        />

        {/* Payment Method Dropdown using Picker */}
        <Text style={styles.label}>Payment Method:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedPaymentMethod}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedPaymentMethod(itemValue)}
          >
            <Picker.Item label="Select a payment method" value=" " />
            {paymentMethods.map((method, index) => (
              <Picker.Item key={index} label={method} value={method} />
            ))}
          </Picker>
        </View>

        {/* Account Details Input */}
        <Text style={styles.label}>Account Details:</Text>
        <TextInput
          style={styles.accountInput}
          value={accountDetail}
          onChangeText={setAccountDetail}
          placeholder="Enter account details"
          multiline
          numberOfLines={4}
        />

        {/* Apply Button */}
        <CommonButton
          disabled={loading}
          title={loading ? "Applying..." : "Apply"}
          bgColor="#24a0ed"
          textColor="#fff"
          onPress={handleSubmit}
        />

        {/* Close Button */}
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
  pickerContainer: {
    height: 60,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 8,
    justifyContent: "center",
  },
  picker: {
    height: 60,
    width: "100%",
  },
  accountInput: {
    height: 100,
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
