import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import MainStyles from './components/styles/Main';
import SettingsScreen from './components/screens/SettingsScreen';
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
      if(!userId){
        setIsAuthenticated(false);
      }

    } catch (error) {
      console.log('Error retrieving user ID:', error);
    }
  };

  return (
    <NavigationContainer>
      <View style={styles.container}>
        <Drawer.Navigator>
              <Drawer.Screen name="Login" component={LoginScreen} />
              <Drawer.Screen name="OrderList" options={{ title: 'Home' }} component={OrderList} />
              <Drawer.Screen name="Settings" component={SettingsScreen} />
        </Drawer.Navigator>
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create(MainStyles);

export default App;
