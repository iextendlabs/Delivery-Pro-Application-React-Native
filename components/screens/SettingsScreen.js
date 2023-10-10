import { View, Text, StyleSheet } from 'react-native';
import MainStyles from '../styles/Main';
import { TouchableOpacity } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
const styles = StyleSheet.create(MainStyles);

const SettingsScreen = ({navigation}) => {
  const handleLogout = async () => {
    try {
      // Remove the user_id from AsyncStorage
      await AsyncStorage.removeItem('@user_id');
      await AsyncStorage.removeItem('@access_token');

      // Navigate back to the Login screen
      navigation.navigate('OrderList', { status: 'LogOut' });
    } catch (error) {
      console.log('Error occurred during logout:', error);
    }
  };

    return (
      <View style={styles.screenContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
      </View>
    );
  };

  export default SettingsScreen;