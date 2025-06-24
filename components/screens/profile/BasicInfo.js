import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
  StyleSheet,
} from "react-native";
import CustomTextInput from "../../common/CustomTextInput";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import StepNavigation from "./StepNavigation";
import * as SQLite from "expo-sqlite";
import { getDatabase } from "../../Database/database";
const db = SQLite.openDatabaseAsync("lipslay.db");
import AsyncStorage from "@react-native-async-storage/async-storage";
import Splash from "../Splash";
import Profile from "../../styles/Profile";

const BasicInfo = ({
  currentStep,
  totalSteps,
  onBack,
  onPrevious,
  formData,
  onNext,
  setFormData,
}) => {
  const [selectedCountryForNumber, setSelectedCountryForNumber] = useState("");
  const [selectedCountryForWhatsapp, setSelectedCountryForWhatsapp] =
    useState("");
  const [callingCodeToCountry, setCallingCodeToCountry] = useState({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [about, setAbout] = useState("");
  const [image, setImage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [number, setNumber] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [getQuote, setGetQuote] = useState("");
  const [nationality, setNationality] = useState("");
  const [location, setLocation] = useState("");
  const [mounted, setMounted] = useState(true);
  const [tempImage, setTempImage] = useState(null);
  const [isImageChanged, setIsImageChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    setData();
  }, [formData]);

  const stripHtml = (html) => {
    return html.replace(/<[^>]*>?/gm, "");
  };

  const setData = () => {
    if (!mounted || !formData) return;
    setIsLoading(true);
    setName(formData.name || "");
    setEmail(formData.email || "");
    setAbout(formData.about || "");
    setPassword(formData.password || "");
    setConfirmPassword(formData.confirmPassword || "");
    setNumber(formData.number || "");
    setWhatsapp(formData.whatsapp || "");
    setImage(formData.image || "");
    setTempImage(null);
    setIsImageChanged(false);
    setGetQuote(formData.getQuoteEnabled || false);
    setLocation(formData.location || "");
    setNationality(formData.nationality || "");
    setIsLoading(false);
  };

  const fetchCountries = async () => {
    if (!mounted) return;
    setIsLoading(true);
    try {
      const response = await axios.get(
        "https://restcountries.com/v3.1/all?fields=idd,cca2"
      );

      const tempCallingCodeToCountry = {};
      response.data.forEach((country) => {
        if (country.idd?.root && country.idd.suffixes?.length) {
          const callingCode = `${country.idd.root}${country.idd.suffixes[0]}`;
          tempCallingCodeToCountry[callingCode] = country.cca2;
        }
      });

      if (mounted) {
        setCallingCodeToCountry(tempCallingCodeToCountry);
      }
    } catch (error) {
      console.error("Error fetching country data:", error);
    } finally {
    }
    setIsLoading(false);
  };

  const getCountryFromNumber = (number) => {
    if (!number?.startsWith("+")) return null;

    const numericNumber = number.replace("+", "");
    const sortedCodes = Object.keys(callingCodeToCountry)
      .map((code) => code.replace("+", ""))
      .sort((a, b) => b.length - a.length);

    const matchedCode = sortedCodes.find((code) =>
      numericNumber.startsWith(code)
    );
    return callingCodeToCountry[`+${matchedCode}`] || "AE";
  };

  const cleanNumber = (number, countryCode) => {
    if (!number) return "";

    const callingCode = Object.entries(callingCodeToCountry).find(
      ([code, cca2]) => cca2 === countryCode
    )?.[0];

    if (callingCode && number.startsWith(callingCode)) {
      return number.slice(callingCode.length).replace(/^0+/, "");
    }

    return number.replace(/^0+/, "");
  };

  const getFullNumber = (number, countryCode) => {
    const callingCode = Object.entries(callingCodeToCountry).find(
      ([code, cca2]) => cca2 === countryCode
    )?.[0];

    return `${callingCode}${number}`;
  };

  const handleSelectCountryForNumber = (country) => {
    setSelectedCountryForNumber(country.cca2);
    setNumber("");
  };

  const handleSelectCountryForWhatsapp = (country) => {
    setSelectedCountryForWhatsapp(country.cca2);
    setWhatsapp("");
  };

  useEffect(() => {
    if (
      !formData.number ||
      !formData.whatsapp ||
      !Object.keys(callingCodeToCountry).length
    )
      return;

    const numberCountry = getCountryFromNumber(formData.number);
    const whatsappCountry = getCountryFromNumber(formData.whatsapp);

    setSelectedCountryForNumber(numberCountry);
    setSelectedCountryForWhatsapp(whatsappCountry);
    setNumber(cleanNumber(formData.number, numberCountry));
    setWhatsapp(cleanNumber(formData.whatsapp, whatsappCountry));
  }, [callingCodeToCountry]);

  const handleImageUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "We need access to your photos to upload a profile picture"
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setTempImage(result.assets[0].uri);
      setIsImageChanged(true);

      setImage(result.assets[0].uri);
    }
  };

  const copyImageToLocalDirectory = async (imageUri) => {
    try {
      if (!imageUri) return null;

      const filename = imageUri.split("/").pop();
      const newPath = FileSystem.documentDirectory + filename;

      await FileSystem.copyAsync({
        from: imageUri,
        to: newPath,
      });

      return newPath;
    } catch (error) {
      console.error("Error copying image:", error);
      return null;
    }
  };

  const handleNextPress = async () => {
    const fullNumber = getFullNumber(number, selectedCountryForNumber);
    const fullWhatsapp = getFullNumber(whatsapp, selectedCountryForWhatsapp);

    const validationErrors = {};

    if (!name || name.trim().length === 0) {
      validationErrors.name = "Full name is required";
    } else if (name.length < 2) {
      validationErrors.name = "Name is too short";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || email.trim().length === 0) {
      validationErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      validationErrors.email = "Invalid email format";
    }

    if (!number || number.trim().length === 0) {
      validationErrors.number = "Phone number is required";
    } else if (number.length < 6) {
      validationErrors.number = "Phone number is too short";
    } else if (!/^[\d\s]+$/.test(number)) {
      validationErrors.number = "Phone number must contain only digits and spaces";
    }

    if (!whatsapp || whatsapp.trim().length === 0) {
      validationErrors.whatsapp = "WhatsApp number is required";
    } else if (whatsapp.length < 6) {
      validationErrors.whatsapp = "WhatsApp number is too short";
    } else if (!/^[\d\s]+$/.test(whatsapp)) {
      validationErrors.whatsapp = "WhatsApp number must contain only digits and spaces";
    }

    if (password || confirmPassword) {
      if (password.length < 8) {
        validationErrors.password = "Password must be at least 8 characters";
      } else if (password !== confirmPassword) {
        validationErrors.confirmPassword = "Passwords do not match";
      }
    }

    let finalImagePath = image;
    if (isImageChanged && tempImage) {
      finalImagePath = await copyImageToLocalDirectory(tempImage);
      if (!finalImagePath) {
        Alert.alert("Error", "Failed to save profile picture");
        return;
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      alert(
        "Please fix the following errors:\n" +
          Object.values(validationErrors).join("\n")
      );
      return;
    }
    setIsLoading(true);
    const newHtml = `<p>${about.replace(/\n\n/g, "</p><p>")}</p>`;

    const stepData = {
      name: name.trim(),
      email: email.trim(),
      about: newHtml,
      image: finalImagePath,
      password,
      confirmPassword,
      number: fullNumber,
      whatsapp: fullWhatsapp,
      getQuoteEnabled: getQuote,
      location: location.trim(),
      nationality: nationality.trim(),
    };
    const userId = await AsyncStorage.getItem("@user_id");

    const db = await getDatabase();

    try {
      await db.runAsync("BEGIN");

      const existingUser = await db.getFirstAsync(
        "SELECT id FROM users WHERE id = ?",
        [userId]
      );

      if (existingUser) {
        const updateQuery = `UPDATE users SET 
        name = ?, 
        email = ?, 
        password = COALESCE(?, password),
        get_quote = ?, 
        ${isImageChanged ? "image = ?," : ""}
        phone = ?, 
        about = ?, 
        whatsapp = ?, 
        location = ?, 
        nationality = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`;

        const updateParams = [
          stepData.name,
          stepData.email,
          stepData.password || null,
          stepData.getQuoteEnabled,
          ...(isImageChanged ? [stepData.image] : []),
          stepData.number,
          stepData.about,
          stepData.whatsapp,
          stepData.location,
          stepData.nationality,
          userId,
        ];

        await db.runAsync(updateQuery, updateParams);
      } else {
        const insertQuery = `INSERT INTO users (
        id, name, email, password, get_quote, image,
        phone, about, whatsapp, location, nationality, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`;

        const insertParams = [
          userId,
          stepData.name,
          stepData.email,
          stepData.password,
          stepData.getQuoteEnabled,
          stepData.image,
          stepData.number,
          stepData.about,
          stepData.whatsapp,
          stepData.location,
          stepData.nationality,
        ];

        await db.runAsync(insertQuery, insertParams);
      }

      await db.runAsync("COMMIT");

      setTempImage(null);
      setIsImageChanged(false);

      setFormData((prev) => ({
        ...prev,
        ...stepData,
        ...(password ? { password } : {}),
        ...(confirmPassword ? { confirmPassword } : {}),
      }));

      onNext();
    } catch (error) {
      console.error("Error:", error.message);
      try {
        await db.runAsync("ROLLBACK");
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }

      Alert.alert("Error", `Database operation failed: ${error.message}`);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <Splash />;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          keyboardShouldPersistTaps="handled"
        >
          {image ? (
            <TouchableOpacity
              onPress={handleImageUpload}
              style={styles.imageContainer}
            >
              <Image
                source={
                  image ? { uri: image } : require("../../images/icon.jpeg")
                }
                style={styles.profileImage}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleImageUpload}
              style={styles.uploadButton}
            >
              <Text style={styles.uploadText}>Upload Profile Picture</Text>
            </TouchableOpacity>
          )}

          <CustomTextInput
            label="Full Name"
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            editable={false}
          />

          <CustomTextInput
            label="Email"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={false}
          />

          <CustomTextInput
            label="Phone Number"
            placeholder="Phone Number"
            value={number}
            onChangeText={(txt) => setNumber(txt.replace(/^0+/, ""))}
            keyboardType="phone-pad"
            onSelectCountry={handleSelectCountryForNumber}
            selectedCountry={selectedCountryForNumber}
            isNumber={true}
            withCallingCodeButton={true}
          />

          <CustomTextInput
            label="WhatsApp Number"
            placeholder="WhatsApp Number"
            value={whatsapp}
            onChangeText={(txt) => setWhatsapp(txt.replace(/^0+/, ""))}
            keyboardType="phone-pad"
            onSelectCountry={handleSelectCountryForWhatsapp}
            selectedCountry={selectedCountryForWhatsapp}
            isNumber={true}
            withCallingCodeButton={true}
          />

          <CustomTextInput
            label="About Yourself"
            placeholder="About Yourself"
            value={stripHtml(about)}
            onChangeText={setAbout}
            multiline
            numberOfLines={10}
          />

          <CustomTextInput
            label="Password (Optional)"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            type={"password"}
          />

          <CustomTextInput
            label="Confirm Password (Optional)"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            type={"password"}
          />

          <Text style={styles.subSectionTitle}>Get Quote</Text>
          <Text style={styles.description}>
            Enable this option if you want to receive quotes for your services.
          </Text>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Enable Get Quote:</Text>
            <Switch
              value={getQuote}
              onValueChange={setGetQuote}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={getQuote ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>

          <Text style={styles.subSectionTitle}>Location & Nationality</Text>

          <CustomTextInput
            label="Location You Want to Work In"
            placeholder="Location You Want to Work In"
            value={location}
            onChangeText={setLocation}
          />

          <CustomTextInput
            label="Nationality"
            placeholder="Nationality"
            value={nationality}
            onChangeText={setNationality}
          />
        </ScrollView>

        <StepNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          onBack={onBack}
          onPrevious={onPrevious}
          onNext={handleNextPress}
          onSubmit={() => alert("Submit")}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create(Profile);

export default BasicInfo;
