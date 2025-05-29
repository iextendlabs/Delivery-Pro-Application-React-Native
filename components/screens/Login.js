import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LoginUrl } from "../config/Api";
import axios from "axios";
import messaging from "@react-native-firebase/messaging";
import Splash from "./Splash";
import CommonButton from "../common/CommonButton";
import CustomTextInput from "../common/CustomTextInput";
import appJson from "../../app.json";
import { fetchProfile } from "../Database/apiService";

const Login = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [badEmail, setBadEmail] = useState(false);
  const [badPassword, setBadPassword] = useState(false);
  const [fcmToken, setFcmToken] = useState("");
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    typeof unsubscribeOnTokenRefreshed === "function" &&
      unsubscribeOnTokenRefreshed();
  }, []);
  try {
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
  } catch (error) {}

  const handleLogin = async () => {
    setLoading(true);
    setBadPassword(false);
    setBadEmail(false);
    setError("");
    // Validate email
    if (email.trim() === "") {
      setBadEmail(true);
      setLoading(false);
      return;
    } else {
      setBadEmail(false);
    }

    // Validate password
    if (password.trim() === "") {
      setBadPassword(true);
      setLoading(false);
      return;
    } else {
      setBadPassword(false);
    }
    try {
      const response = await axios.post(LoginUrl, {
        username: email,
        password: password,
        fcmToken: fcmToken,
      });

      if (response.status === 200) {
        const userId = response.data.user.id;
        const accessToken = response.data.access_token;
        const notifications = response.data.notifications;

        // Store access token in AsyncStorage
        await AsyncStorage.setItem("@access_token", accessToken);
        await AsyncStorage.setItem("@user_id", String(userId));
        await AsyncStorage.setItem(
          "@notifications",
          JSON.stringify(notifications)
        );

        const headers = {
          Authorization: `Bearer ${accessToken}`,
        };
        console.log("[INIT] Step 4: Loading Profile data...");
        const profileResult = await fetchProfile(userId);
        if (!profileResult.success) {
          throw new Error("Failed to load Profile data");
        }
        console.log("[INIT] Profile load succeeded");
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (error) {
      setError("These credentials do not match our records.");
    }
    setLoading(false);
  };

  if (loading) {
    return Splash();
  }
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#e4fbfb" }}>
      <View style={{ flex: 1 }}>
        <Image
          source={require("../images/icon.jpeg")}
          style={{
            width: 60,
            height: 60,
            alignSelf: "center",
            marginTop: 120,
          }}
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
          Login
        </Text>

        {error && (
          <Text style={{ marginTop: 10, marginLeft: 40, color: "red" }}>
            {error}
          </Text>
        )}

        <CustomTextInput
          placeholder={"Enter Email"}
          icon={require("../images/mail.png")}
          value={email}
          onChangeText={(txt) => {
            setEmail(txt);
          }}
        />
        {badEmail === true && (
          <Text style={{ marginTop: 10, marginLeft: 40, color: "red" }}>
            Please Enter Email
          </Text>
        )}
        <CustomTextInput
          placeholder={"Enter Password"}
          icon={require("../images/lock.png")}
          type={"password"}
          value={password}
          onChangeText={(txt) => {
            setPassword(txt);
          }}
        />
        {badPassword === true && (
          <Text style={{ marginTop: 10, marginLeft: 40, color: "red" }}>
            Please Enter Password
          </Text>
        )}
        <CommonButton
          title={"Login"}
          bgColor={"#000"}
          textColor={"#fff"}
          onPress={() => {
            handleLogin();
          }}
        />
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            alignSelf: "center",
            marginTop: 20,
            textDecorationLine: "underline",
          }}
          onPress={() => {
            navigation.navigate("Signup");
          }}
        >
          Create New Account?
        </Text>
        <Text
          style={{
            textAlign: "center",
            color: "#666",
            fontSize: 12,
            marginTop: 20,
          }}
        >
          v{appJson.expo.version}
        </Text>
      </View>
    </ScrollView>
  );
};

export default Login;
