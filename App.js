import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import MainStyles from './components/styles/Main';
import HomeScreen from './components/screens/HomeScreen';
import ServicesScreen from './components/screens/ServicesScreen';
import SettingsScreen from './components/screens/SettingsScreen';
import Footer from './components/layout/Footer';
import OrderList from './components/screens/OrderList';
import LoginScreen from './components/screens/LoginScreen';

import AsyncStorage from '@react-native-async-storage/async-storage'; // Add this line
import { Title } from 'react-native-paper';

const Drawer = createDrawerNavigator();
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const userId = await AsyncStorage.getItem('@user_id');
      setIsAuthenticated(!!userId);
    } catch (error) {
      console.log('Error retrieving user ID:', error);
    }
  };

  const handleOrderListNavigation = (status) => {
    console.log('navigating');
    navigation.navigate('OrderList', { status: status });
  };

  return (
    <NavigationContainer>
      <View style={styles.container}>
        <Drawer.Navigator>
              <Drawer.Screen name="OrderList" options={{ title: 'Home' }} component={OrderList} />
              <Drawer.Screen name="Settings" component={SettingsScreen} />
              <Drawer.Screen name="Login" component={LoginScreen} />
        </Drawer.Navigator>
        <Footer />
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create(MainStyles);

export default App;
