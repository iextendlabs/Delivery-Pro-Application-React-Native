import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import MainStyles from './components/styles/Main';
import HomeScreen from './components/screens/HomeScreen';
import ServicesScreen from './components/screens/ServicesScreen';
import SettingsScreen from './components/screens/SettingsScreen';
import Footer from './components/layout/Footer';
import OrderList from './components/screens/OrderList';

const Drawer = createDrawerNavigator();
const App = () => {
  return (
    <NavigationContainer>
      <View style={styles.container}>
        <Drawer.Navigator>
          <Drawer.Screen name="Home" component={HomeScreen} />
          <Drawer.Screen name="Services" component={ServicesScreen} />
          <Drawer.Screen name="Settings" component={SettingsScreen} />
          <Drawer.Screen name="OrderList" component={OrderList} />
        </Drawer.Navigator>
      </View>

      <Footer />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create(MainStyles);

export default App;
