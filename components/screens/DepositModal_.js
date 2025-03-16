import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import CommonButton from "../common/CommonButton";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { CardField, useStripe } from "@stripe/stripe-react-native";
import Splash from "./Splash";
import { createPaymentIntent } from "../config/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DepositModal() {
  const navigation = useNavigation();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [cardDetails, setCardDetails] = useState(null);
  const { confirmPayment } = useStripe();

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
    navigation.goBack();
  };

  const handleSubmit = async () => {
    const userId = await AsyncStorage.getItem("@user_id");
    console.log("Card Details:", cardDetails); // Debugging: Log cardDetails
    if (!cardDetails?.complete || !amount) {
      setError("Please enter complete card details and amount");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create a PaymentIntent on your server
      const response = await axios.post(createPaymentIntent, {
        user_id: userId,
        amount: amount,
        app: 1,
      });

      if (response.status === 200) {
        const { client_secret, email, name } = response.data;

        const { error, paymentIntent } = await confirmPayment(client_secret, {
          paymentMethodType: "Card",
          paymentMethodData: {
            billingDetails: {
              email: email,
              name: name,
            },
          },
        });

        if (error) {
          setError(`Payment failed: ${error.message}`);
        } else if (paymentIntent) {
          setSuccess("Payment successful!");
          setAmount("");
          setErrorMessage("");
          setLoading(false);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Splash />;
  }

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Deposit</Text>

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
          placeholder="Enter Deposit amount"
          keyboardType="numeric"
        />

        {/* Card Details Input */}
        <Text style={styles.label}>Card Details:</Text>

        <CardField
          postalCodeEnabled={false}
          placeholders={{ number: "4242 4242 4242 4242" }}
          cardStyle={styles.card}
          style={styles.cardField}
          onCardChange={(cardDetails) => {
            console.log("Card Details Updated:", cardDetails); // Debugging: Log cardDetails
            setCardDetails(cardDetails);
          }}
        />

        {/* Apply Button */}
        <CommonButton
          disabled={!cardDetails?.complete || loading}
          title={loading ? "Processing..." : "Deposit"}
          bgColor={!cardDetails?.complete || loading ? "#cde8f8" : "#24a0ed"}
          textColor={!cardDetails?.complete || loading ? "#000" : "#fff"}
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
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    textColor: "#000000",
    fontSize: 16,
    placeholderColor: "#999999",
  },
  cardField: {
    width: "100%",
    height: 50,
    marginBottom: 20,
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
