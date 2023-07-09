import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/Ionicons';

const Drawer = createDrawerNavigator();

const HomeScreen = () => {
  return (
    <View style={styles.screenContainer}>
      <Text style={styles.screenText}>Home Screen</Text>
    </View>
  );
};

const ServicesScreen = () => {
  return (
    <View style={styles.screenContainer}>
      <Text style={styles.screenText}>Services Screen</Text>
    </View>
  );
};

const SettingsScreen = () => {
  return (
    <View style={styles.screenContainer}>
      <Text style={styles.screenText}>Settings Screen</Text>
    </View>
  );
};

const Footer = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.footerContainer}>
      <TouchableOpacity style={styles.footerLink} onPress={() => navigation.navigate('Home')}>
        <Icon name="home" size={24} color="#FFFFFF" />
        <Text style={styles.footerLinkText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.footerLink} onPress={() => navigation.navigate('Services')}>
        <Icon name="person" size={24} color="#FFFFFF" />
        <Text style={styles.footerLinkText}>Services</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.footerLink} onPress={() => navigation.navigate('Settings')}>
        <Icon name="settings" size={24} color="#FFFFFF" />
        <Text style={styles.footerLinkText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <View style={styles.container}>
        <Drawer.Navigator>
          <Drawer.Screen name="Home" component={HomeScreen} />
          <Drawer.Screen name="Services" component={ServicesScreen} />
          <Drawer.Screen name="Settings" component={SettingsScreen} />
        </Drawer.Navigator>
      </View>
      <Footer />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenText: {
    fontSize: 20,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    backgroundColor: '#213141',
  },
  footerLink: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLinkText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#228866',
    marginTop: 5,
  },
});

export default App;
