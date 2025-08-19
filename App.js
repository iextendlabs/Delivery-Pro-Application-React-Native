import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Alert,
  ImageBackground,
  Linking,
  TouchableOpacity,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import OrderList from "./components/screens/OrderList";
import messaging from "@react-native-firebase/messaging";
import Login from "./components/screens/Login";
import Notification from "./components/screens/Notification";
import NetInfo from "@react-native-community/netinfo";
import Home from "./components/screens/Home";
import Transactions from "./components/screens/Transactions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NotificationUrl } from "./components/config/Api";
import axios from "axios";
import Holidays from "./components/screens/Holidays";
import HolidayModal from "./components/screens/HolidayModal";
import Orders from "./components/screens/Orders";
import Splash from "./components/screens/Splash";
import * as Notifications from "expo-notifications";
import WithdrawModal from "./components/screens/WithdrawModal";
import Withdraws from "./components/screens/Withdraws";
import EditProfile from "./components/screens/EditProfile";
import DepositModal from "./components/screens/DepositModal";
import { StripeProvider } from "@stripe/stripe-react-native";
import { stripe_publishable_key } from "./components/config/Api";
import TermsCondition from "./components/common/TermsCondition";
import Signup from "./components/screens/Signup";
import PrivacyPolicy from "./components/common/PrivacyPolicy";
import MembershipPlans from "./components/screens/MembershipPlans";
import QuoteListScreen from "./components/screens/QuoteListScreen";
import ViewQuoteScreen from "./components/screens/ViewQuoteScreen";
import BidsScreen from "./components/screens/BidsScreen";
import Icon from "react-native-vector-icons/Ionicons";
import UpdateProfile from "./components/screens/profile/UpdateProfile";
import WhatsappIcon from "./components/common/WhatsappIcon";
import { getDatabase } from "./components/Database/database";
import {
  clearDatabase,
  clearUserData,
} from "./components/Database/servicesRepository";
import ChangePassword from "./components/screens/ChangePassword";

const Stack = createStackNavigator();

const App = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [initialRoute, setInitialRoute] = useState(null);
  const [loading, setLoading] = useState(false);

  const initializeApp = async () => {
    setLoading(true);
    try {
      console.log("=== APP INITIALIZATION STARTED ===");

      // 1. Database Initialization
      console.log("[INIT] Step 1: Initializing database...");
      await getDatabase(); // This now handles initialization
      console.log("[INIT] Database initialized successfully");


      console.log("=== APP INITIALIZATION COMPLETED ===");
    } catch (error) {
      setLoading(false);
      console.error("[INIT ERROR] Initialization failed:", error);
      throw error; // Re-throw to allow calling code to handle
    }
    setLoading(false);
  };

  // Usage in component
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check if we need a clean install
        const needsReset = await AsyncStorage.getItem("needsCleanInstall");
        console.log("Clean install needed:", needsReset);

        if (needsReset === "true" || needsReset === null) {
          console.log("Performing clean database reset...");
          await clearDatabase();
          await clearUserData();
          await AsyncStorage.setItem("needsCleanInstall", "false");
        }

        // Initialize the app
        await initializeApp();
      } catch (error) {
        console.error("Initialization failed:", error);
        // Optionally show error to user or retry
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const requestUserPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log("Authorization status:", authStatus);
      }
    };

    if (requestUserPermission()) {
      messaging()
        .getToken()
        .then((token) => {
          console.log(token);
        });
    } else {
      console.log("Failed token status", authStatus);
    }
    messaging()
      .getInitialNotification()
      .then(async (remoteMessage) => {
        if (remoteMessage) {
          console.log(
            "Notification caused app to open from quit state:",
            remoteMessage.notification
          );
        }
      });

    messaging().onNotificationOpenedApp(async (remoteMessage) => {
      console.log(
        "Notification caused app to open from background state:",
        remoteMessage.notification
      );
      getNotification();
    });

    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log("Message handled in the background!", remoteMessage);
      getNotification();
    });

    messaging().onMessage(async (remoteMessage) => {
      const { body, title } = remoteMessage.notification;
      Alert.alert(`${title}`, `${body}`);
      getNotification();
    });
  }, []);

  useEffect(() => {
    checkUserLoggedIn();
    getNotification();
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();

      if (status !== "granted") {
        const { status: newStatus } =
          await Notifications.requestPermissionsAsync();

        if (newStatus !== "granted") {
          console.log("Notification permission denied");
          Alert.alert(
            "Notification Permission Required",
            "To receive notifications, please enable notification permissions in your device settings.",
            [
              {
                text: "OK",
                onPress: () => {
                  Linking.openSettings();
                },
              },
            ]
          );
        }
      }
    } catch (error) {
      console.error("Error checking notification permission:", error);
    }
  };

  const showConnectionAlert = () => {
    Alert.alert(
      "No Internet Connection",
      "Please check your internet connection and try again.",
      [{ text: "OK" }],
      { cancelable: false }
    );
  };

  useEffect(() => {
    if (!isConnected) {
      showConnectionAlert();
    }
  }, [isConnected]);

  const checkUserLoggedIn = async () => {
    try {
      const userId = await AsyncStorage.getItem("@user_id");
      if (userId) {
        setInitialRoute("Home");
      } else {
        setInitialRoute("Login");
      }
    } catch (error) {
      console.error("Error checking user login status:", error);
      setInitialRoute("Login");
    }
  };

  const getNotification = async () => {
    const user = await AsyncStorage.getItem("@user_id");
    try {
      const response = await axios.get(`${NotificationUrl}user_id=${user}`);
      if (response.status === 200) {
        let data = response.data.notifications;
        await AsyncStorage.setItem("@notifications", JSON.stringify(data));
      } else {
        setError("Please try again.");
      }
    } catch (error) {}
  };

  if (initialRoute === null || loading) {
    return <Splash />;
  }

  return (
    <StripeProvider publishableKey={stripe_publishable_key}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerBackground: () => (
              <ImageBackground
                source={require("./components/images/rotated_logo.png")}
                style={{
                  position: "absolute",
                  top: 1,
                  left: 0,
                  width: 150,
                  height: 100,
                  zIndex: 1,
                }}
              />
            ),
            headerTintColor: "#000",
          }}
        >
          <Stack.Screen options={{ headerShown: false }} name="Login" component={Login} />
          <Stack.Screen options={{ headerShown: false }} name="Signup" component={Signup} />
          <Stack.Screen options={{ headerShown: false }} name="UpdateProfile" component={UpdateProfile} />
          <Stack.Screen options={{ headerShown: false }} name="Notification" component={Notification} />
          <Stack.Screen options={{ headerShown: false }} name="Home" component={Home} />
          <Stack.Screen options={{ headerShown: false }} name="Transactions" component={Transactions} />
          <Stack.Screen options={{ headerShown: false }} name="OrderList" component={OrderList} />
          <Stack.Screen options={{ headerShown: false }} name="Orders" component={Orders} />
          <Stack.Screen options={{ headerShown: false }} name="Holidays" component={Holidays} />
          <Stack.Screen options={{ headerShown: false }} name="HolidayModal" component={HolidayModal} />
          <Stack.Screen options={{ headerShown: false }} name="WithdrawModal" component={WithdrawModal} />
          <Stack.Screen options={{ headerShown: false }} name="Withdraws" component={Withdraws} />
          <Stack.Screen options={{ headerShown: false }} name="EditProfile" component={EditProfile} />
          <Stack.Screen options={{ title: "Deposit" }} name="DepositModal" component={DepositModal} />
          <Stack.Screen options={{ title: "Terms & Condition" }} name="TermsCondition" component={TermsCondition} />
          <Stack.Screen options={{ title: "Privacy Policy" }} name="PrivacyPolicy" component={PrivacyPolicy} />
          <Stack.Screen options={{ title: "Membership Plans" }} name="MembershipPlans" component={MembershipPlans} />
          <Stack.Screen options={{ headerShown: false }} name="QuoteListScreen" component={QuoteListScreen} />
          <Stack.Screen options={{ title: "Quote" }} name="ViewQuote" component={ViewQuoteScreen} />
          <Stack.Screen name="BidsScreen" component={BidsScreen} options={({ navigation }) => ({ title: "Bid", headerLeft: () => (<TouchableOpacity onPress={() => { navigation.navigate("QuoteListScreen"); }} style={{ marginLeft: 15 }}><Icon name="arrow-back" size={24} color="#000" /></TouchableOpacity>), })} />
          <Stack.Screen options={{ headerShown: false }} name="ChangePassword" component={ChangePassword} />
        </Stack.Navigator>
        <WhatsappIcon />
      </NavigationContainer>
    </StripeProvider>
  );
};

const styles = StyleSheet.create({});

export default App;
