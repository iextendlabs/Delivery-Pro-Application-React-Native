import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import MainStyles from '../styles/Main';
const styles = StyleSheet.create(MainStyles);

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

  export default Footer;