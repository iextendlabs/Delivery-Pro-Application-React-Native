import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import CommonButton from "../common/CommonButton";
import CustomTextInput from "../common/CustomTextInput";
import { useNavigation } from "@react-navigation/native";
import { getPlansUrl, SignupUrl } from "../config/Api";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Splash from "./Splash";
import messaging from "@react-native-firebase/messaging";
import { fetchProfile } from "../Database/apiService";

const Signup = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    affiliate: "",
    number: "+971",
    whatsapp: "+971",
    membership_plan_id: "", // Add membership_plan_id to store the selected plan's ID
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [fcmToken, setFcmToken] = useState("");
  const [plans, setPlans] = useState([]);
  const [selectedCountryForNumber, setSelectedCountryForNumber] =
    useState("AE");
  const [selectedCountryForWhatsapp, setSelectedCountryForWhatsapp] =
    useState("AE");

  const handleSelectCountryForNumber = (country) => {
    setSelectedCountryForNumber(country.cca2);
    setFormData((prev) => ({ ...prev, number: `+${country.callingCode[0]}` }));
  };

  const handleSelectCountryForWhatsapp = (country) => {
    setSelectedCountryForWhatsapp(country.cca2);
    setFormData((prev) => ({
      ...prev,
      whatsapp: `+${country.callingCode[0]}`,
    }));
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${getPlansUrl}`);
      setPlans(response.data.plans);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribeOnTokenRefreshed = messaging().onTokenRefresh(
      (fcmToken) => {
        console.log("FCM Token:", fcmToken);
      }
    );

    messaging()
      .getToken()
      .then((fcmToken) => {
        setFcmToken(fcmToken);
      });

    return () => {
      unsubscribeOnTokenRefreshed();
    };
  }, []);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Please Enter Name";
    if (!formData.membership_plan_id) newErrors.plan = "Please Select a Plan";
    if (!formData.email) newErrors.email = "Please Enter Email";
    else if (!isValidEmail(formData.email))
      newErrors.email = "Enter a valid email address.";
    if (!formData.password) newErrors.password = "Please Enter Password";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please Enter Confirm Password";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword =
        "The password and confirm-password must match.";
    if (selectedCountryForNumber == null || selectedCountryForWhatsapp == null)
      newErrors.country = "Please select country for number and Whatsapp.";
    if (!formData.number || formData.number.length < 6) {
      newErrors.number = "Number must be at least 6 digits";
    }
    if (!formData.whatsapp || formData.whatsapp.length < 6) {
      newErrors.whatsapp = "WhatsApp number must be at least 6 digits";
    }

    if (!termsChecked)
      newErrors.terms = "Please agree to the Terms & Conditions.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(SignupUrl, {
        ...formData,
        fcmToken,
      });

      if (response.status === 200) {
        const userId = response.data.user.id;
        const accessToken = response.data.access_token;

        await AsyncStorage.setItem("@access_token", accessToken);
        await AsyncStorage.setItem("@user_id", String(userId));
        await AsyncStorage.setItem(
          "@selectedCountryForNumber",
          selectedCountryForNumber
        );
        await AsyncStorage.setItem(
          "@selectedCountryForWhatsapp",
          selectedCountryForWhatsapp
        );
        const profileResult = await fetchProfile(userId);
        if (!profileResult.success) {
          throw new Error("Failed to load Profile data");
        }
        console.log("[INIT] Profile load succeeded");
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      } else if (response.status === 201) {
        if (response.data.errors.email) {
          setErrors({ api: response.data.errors.email });
        } else if (response.data.errors.affiliate) {
          setErrors({ api: response.data.errors.affiliate });
        }
      } else {
        setErrors({ api: "Signup failed. Please try again." });
      }
    } catch (error) {
      setErrors({ api: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Splash />;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#e4fbfb" }}>
      <View style={{ flex: 1 }}>
        <Image
          source={require("../images/icon.jpeg")}
          style={{ width: 60, height: 60, alignSelf: "center", marginTop: 40 }}
        />
        <Text
          style={{
            marginTop: 20,
            alignSelf: "center",
            fontSize: 24,
            fontWeight: "600",
            color: "#000",
          }}
        >
          Create New Account
        </Text>
        {errors.api && (
          <Text style={{ marginTop: 10, marginLeft: 40, color: "red" }}>
            {errors.api}
          </Text>
        )}
        <CustomTextInput
          placeholder="Enter Name"
          icon={require("../images/user.png")}
          value={formData.name}
          onChangeText={(txt) => setFormData({ ...formData, name: txt })}
        />
        {errors.name && (
          <Text style={{ marginTop: 10, marginLeft: 40, color: "red" }}>
            {errors.name}
          </Text>
        )}
        <CustomTextInput
          placeholder="Enter Email"
          icon={require("../images/mail.png")}
          value={formData.email}
          onChangeText={(txt) => setFormData({ ...formData, email: txt })}
        />
        {errors.email && (
          <Text style={{ marginTop: 10, marginLeft: 40, color: "red" }}>
            {errors.email}
          </Text>
        )}
        <CustomTextInput
          placeholder="Enter Password"
          icon={require("../images/lock.png")}
          type="password"
          value={formData.password}
          onChangeText={(txt) => setFormData({ ...formData, password: txt })}
        />
        {errors.password && (
          <Text style={{ marginTop: 10, marginLeft: 40, color: "red" }}>
            {errors.password}
          </Text>
        )}
        <CustomTextInput
          placeholder="Enter Confirm Password"
          icon={require("../images/lock.png")}
          type="password"
          value={formData.confirmPassword}
          onChangeText={(txt) =>
            setFormData({ ...formData, confirmPassword: txt })
          }
        />
        {errors.confirmPassword && (
          <Text style={{ marginTop: 10, marginLeft: 40, color: "red" }}>
            {errors.confirmPassword}
          </Text>
        )}
        <View
          style={{
            borderWidth: 0.5,
            borderRadius: 10,
            marginHorizontal: 20,
            marginTop: 10,
          }}
        >
          <Picker
            selectedValue={formData.membership_plan_id}
            onValueChange={(itemValue) =>
              setFormData({ ...formData, membership_plan_id: itemValue })
            }
            style={{ borderRadius: 5 }}
          >
            <Picker.Item label="Select a Plan" value="" />
            {plans.map((plan) => (
              <Picker.Item
                key={plan.id}
                label={`${plan.plan_name} (AED${plan.membership_fee})`}
                value={plan.id}
              />
            ))}
          </Picker>
          {errors.plan && (
            <Text style={{ marginTop: 10, marginLeft: 20, color: "red" }}>
              {errors.plan}
            </Text>
          )}
        </View>
        {errors.country && (
          <Text style={{ marginTop: 10, marginLeft: 20, color: "red" }}>
            {errors.country}
          </Text>
        )}
        <CustomTextInput
          value={formData.number}
          onChangeText={(txt) => setFormData({ ...formData, number: txt })}
          placeholder="Enter Phone Number"
          keyboardType="numeric"
          onSelectCountry={handleSelectCountryForNumber}
          selectedCountry={selectedCountryForNumber}
          isNumber={true}
        />
        {errors.number && (
          <Text style={{ marginTop: 10, marginLeft: 20, color: "red" }}>
            {errors.number}
          </Text>
        )}
        <CustomTextInput
          value={formData.whatsapp}
          onChangeText={(txt) => setFormData({ ...formData, whatsapp: txt })}
          placeholder="Enter Whatsapp Number"
          keyboardType="numeric"
          onSelectCountry={handleSelectCountryForWhatsapp}
          selectedCountry={selectedCountryForWhatsapp}
          isNumber={true}
        />
        {errors.whatsapp && (
          <Text style={{ marginTop: 10, marginLeft: 20, color: "red" }}>
            {errors.whatsapp}
          </Text>
        )}
        <CustomTextInput
          placeholder="Enter Affiliate Code (Optional)"
          icon={require("../images/affiliate.png")}
          value={formData.affiliate}
          onChangeText={(txt) => setFormData({ ...formData, affiliate: txt })}
        />
        {errors.affiliate && (
          <Text style={{ marginTop: 10, marginLeft: 40, color: "red" }}>
            {errors.affiliate}
          </Text>
        )}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 10,
            marginLeft: 30,
          }}
        >
          <TouchableOpacity
            onPress={() => setTermsChecked(!termsChecked)}
            style={{
              width: 20,
              height: 20,
              borderRadius: 5,
              borderWidth: 1,
              borderColor: "#000",
              marginRight: 5,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {termsChecked && (
              <View
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: "#000",
                  borderRadius: 3,
                }}
              />
            )}
          </TouchableOpacity>
          <Text style={{ fontSize: 14, color: "#000" }}>
            I agree to the{" "}
            <Text
              style={{
                fontSize: 14,
                color: "#00a1fc",
                textDecorationLine: "underline",
              }}
              onPress={() => navigation.navigate("TermsCondition")}
            >
              Terms and Conditions
            </Text>
            {" and "}
            <Text
              style={{
                fontSize: 14,
                color: "#00a1fc",
                textDecorationLine: "underline",
              }}
              onPress={() => navigation.navigate("PrivacyPolicy")}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
        {errors.terms && (
          <Text style={{ marginTop: 10, marginLeft: 40, color: "red" }}>
            {errors.terms}
          </Text>
        )}
        <CommonButton
          title="Signup"
          bgColor="#000"
          textColor="#fff"
          onPress={handleSignup}
        />
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            alignSelf: "center",
            marginTop: 20,
            marginBottom: 40,
            textDecorationLine: "underline",
          }}
          onPress={() => navigation.goBack()}
        >
          Already Have Account?
        </Text>
      </View>
    </ScrollView>
  );
};

export default Signup;
