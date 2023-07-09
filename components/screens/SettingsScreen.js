import { View, Text, StyleSheet } from 'react-native';
import MainStyles from '../styles/Main';
const styles = StyleSheet.create(MainStyles);

const SettingsScreen = () => {
    return (
      <View style={styles.screenContainer}>
        <Text style={styles.screenText}>Settings Screen</Text>
      </View>
    );
  };

  export default SettingsScreen;