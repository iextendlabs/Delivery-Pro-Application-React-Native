import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Switch,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BaseUrl, IndexUrl, updateProfileUrl } from "../config/Api";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import Splash from "./Splash";
import CommonButton from "../common/CommonButton";

export default function EditProfile({ navigation }) {
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [location, setLocation] = useState("");
  const [nationality, setNationality] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [image, setImage] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const userId = await AsyncStorage.getItem("@user_id");
    if (userId) {
      try {
        const response = await axios.get(`${IndexUrl}user_id=${userId}`);
        setUserData(response.data);
        setEmail(response.data.email ?? "");
        setPhone(response.data.number ?? "");
        setWhatsapp(response.data.whatsapp ?? "");
        setLocation(response.data.location ?? "");
        setNationality(response.data.nationality ?? "");
        setSubtitle(response.data.sub_title ?? "");
        setImage(response.data.image ?? "");
        setIsOnline(response.data.online === "1");
      } catch (error) {
        setError("Error fetching user data. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      navigation.navigate("Login");
    }
  };

  const handleUpdateProfile = async () => {
    // Validate required fields
    if (email.trim() === "") {
      setError("Please enter a valid email.");
      return;
    }
    if (phone.trim() === "") {
      setError("Please enter a valid phone number.");
      return;
    }
    if (whatsapp.trim() === "") {
      setError("Please enter a valid WhatsApp number.");
      return;
    }
    if (location.trim() === "") {
      setError("Please enter a valid location.");
      return;
    }
    if (nationality.trim() === "") {
      setError("Please enter a valid nationality.");
      return;
    }
    if (subtitle.trim() === "") {
      setError("Please enter a subtitle.");
      return;
    }

    if (
      (password.trim() && !confirmPassword.trim()) ||
      (!password.trim() && confirmPassword.trim())
    ) {
      setError(
        "Both password and confirm password must be filled or left empty."
      );
      return;
    }
    if (
      password.trim() &&
      confirmPassword.trim() &&
      password !== confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const updatedData = {
      email,
      password,
      phone,
      whatsapp,
      location,
      nationality,
      subtitle,
      online: isOnline ? 1 : 0,
    };

    try {
      const userId = await AsyncStorage.getItem("@user_id");
      if (userId) {
        const response = await axios.post(`${updateProfileUrl}`, {
          user_id: userId,
          ...updatedData,
        });

        if (response.status === 200) {
          setSuccess("Profile updated successfully.");
        } else if (response.status === 201) {
          setError("User not found.");
          navigation.navigate("Login");
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
    setLoading(false);
  };

  if (loading) {
    return <Splash />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : null}
    >
      <Header title={"Edit Profile"} />
      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <Image
            source={
              image
                ? { uri: BaseUrl + "staff-images/" + image }
                : require("../images/user.png")
            }
            style={styles.profileImage}
          />
          <Text style={styles.userName}>{userData.name}</Text>
          {success !== "" && <Text style={styles.success}>{success}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry={true}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Confirm Password (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            secureTextEntry={true}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Phone</Text>
          <TextInput
            style={styles.textInput}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>WhatsApp</Text>
          <TextInput
            style={styles.textInput}
            value={whatsapp}
            onChangeText={setWhatsapp}
            placeholder="Enter your WhatsApp number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Location</Text>
          <TextInput
            style={styles.textInput}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter your location"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Nationality</Text>
          <TextInput
            style={styles.textInput}
            value={nationality}
            onChangeText={setNationality}
            placeholder="Enter your nationality"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Subtitle</Text>
          <TextInput
            style={styles.textInput}
            value={subtitle}
            onChangeText={setSubtitle}
            placeholder="Enter your subtitle"
          />
        </View>

        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Online</Text>
          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{ false: "#d1d1d1", true: "#81b0ff" }}
            thumbColor={isOnline ? "#4db8ff" : "#f4f3f4"}
            style={styles.toggleSwitch}
          />
        </View>
        {error !== "" && <Text style={styles.error}>{error}</Text>}
        <CommonButton
          disabled={loading}
          title={loading ? "Updating..." : "Update Profile"}
          bgColor="#24a0ed"
          textColor="#fff"
          onPress={handleUpdateProfile}
        />
      </ScrollView>
      <Footer />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e4fbfb",
    paddingTop: 20,
  },
  scrollViewContainer: {
    flexGrow: 1,
    paddingBottom: 70, // To ensure the content doesn't get cut off when scrolled
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#62b6cb",
    marginBottom: 10,
  },
  imagePlaceholder: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  textInput: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  toggleContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  toggleLabel: {
    fontSize: 16,
    marginRight: 10,
    color: "#333",
    flex: 1,
  },
  toggleSwitch: {
    transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }],
  },
  success: {
    padding: 20,
    color: "green",
    marginTop: 10,
    fontSize: 16,
  },
  error: {
    padding: 20,
    color: "red",
    marginTop: 10,
    fontSize: 16,
  },
});
