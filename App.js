import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import MainStyles from "./components/styles/Main";
import OrderList from "./components/screens/OrderList";
import ProfileScreen from "./components/screens/ProfileScreen";
import messaging from "@react-native-firebase/messaging";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Notification from "./components/screens/Notification";
import NetInfo from '@react-native-community/netinfo';

const Drawer = createDrawerNavigator();
const App = () => {
  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Authorization status:", authStatus);
    }
  };

  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const showConnectionAlert = () => {
    Alert.alert(
      'No Internet Connection',
      'Please check your internet connection and try again.',
      [{ text: 'OK' }],
      { cancelable: false }
    );
  };

  useEffect(() => {
    if (!isConnected) {
      showConnectionAlert();
    }
  }, [isConnected]);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const userId = await AsyncStorage.getItem("@user_id");
      if (!userId) {
        setIsAuthenticated(false);
      } else {
        try {
          if (requestUserPermission()) {
            messaging()
              .getToken()
              .then((token) => {
                console.log(token);
              });
          } else {
            console.log("Failed token status", authStatus);
          }
          // Check whether an initial notification is available
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
    
          // Assume a message-notification contains a "type" property in the data payload of the screen to open
    
          messaging().onNotificationOpenedApp(async (remoteMessage) => {
            console.log(
              "Notification caused app to open from background state:",
              remoteMessage.notification
            );
          });
    
          // Register background handler
          messaging().setBackgroundMessageHandler(async (remoteMessage) => {
            console.log("Message handled in the background!", remoteMessage);
          });
    
          messaging().onMessage(async (remoteMessage) => {
            const { body, title } = remoteMessage.notification;
            Alert.alert(`${title}`, `${body}`);
          });
        } catch (error) {}
      }
    } catch (error) {
      console.log("Error retrieving user ID:", error);
    }
  };

  return (
    <NavigationContainer>
      <View style={styles.container}>
        <Drawer.Navigator>
          <Drawer.Screen
            name="OrderList"
            options={({ navigation }) => ({
              title: "Home",
              headerRight: () => (
                <Icon
                  name="notifications-outline"
                  size={24}
                  style={{ marginRight: 10 }}
                  onPress={() => navigation.navigate("Notification")}
                  color="#000"
                />
              ),
            })}
            component={() => <OrderList />}
          />
          <Drawer.Screen
            name="Notification"
            options={({ navigation }) => ({
              title: "Notification",
              headerRight: () => (
                <Icon
                  name="home-outline"
                  size={24}
                  color="#000"
                  style={{ marginRight: 10 }}
                  onPress={() => navigation.navigate("OrderList")}
                />
              ),
            })}
            component={() => <Notification />}
          />
          <Drawer.Screen name="Profile" component={ProfileScreen} />
        </Drawer.Navigator>
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create(MainStyles);

export default App;
