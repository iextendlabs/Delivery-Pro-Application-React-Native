import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { PasswordChangeUrl } from "../config/Api";
import CustomTextInput from "../common/CustomTextInput";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChangePassword = async () => {
    const userId = await AsyncStorage.getItem("@user_id");
    setMessage(null);
    setError(null);
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(PasswordChangeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          user_id: userId,
        }),
      });

      const data = await response.json();
      if (response.ok && data.msg) {
        setMessage(data.msg);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else if (data.errors) {
        setError(Object.values(data.errors).join("\n"));
      } else if (data.error) {
        setError(data.error);
      } else {
        setError("Failed to change password.");
      }
    } catch (error) {
      setError("Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Header title={"Change Password"} />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.centerWrapper}>
          <View style={styles.innerContainer}>
            {error && <Text style={styles.error}>{error}</Text>}
            {message && <Text style={styles.message}>{message}</Text>}

            <CustomTextInput
              placeholder="Enter old password"
              icon={require("../images/lock.png")}
              type="password"
              value={oldPassword}
              onChangeText={setOldPassword}
            />
            <CustomTextInput
              placeholder="Enter new password"
              icon={require("../images/lock.png")}
              type="password"
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <CustomTextInput
              placeholder="Confirm new password"
              icon={require("../images/lock.png")}
              type="password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleChangePassword}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Changing..." : "Change Password"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e4fbfb",
  },
  centerWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  innerContainer: {
    width: "100%",
    maxWidth: 400,
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    color: "green",
    marginBottom: 10,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    margin: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ChangePassword;
