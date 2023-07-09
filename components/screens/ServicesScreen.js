import { View, Text, StyleSheet } from 'react-native';
import MainStyles from '../styles/Main';
const styles = StyleSheet.create(MainStyles);

const ServicesScreen = () => {
    return (
      <View style={styles.screenContainer}>
        <Text style={styles.screenText}>Services Screen</Text>
      </View>
    );
  };

  export default ServicesScreen;