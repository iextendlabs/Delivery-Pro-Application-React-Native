import { View, Text, StyleSheet } from 'react-native';
import MainStyles from '../styles/Main';
const styles = StyleSheet.create(MainStyles);

const HomeScreen = () => {
    return (
      <View style={styles.screenContainer}>
        <Text style={styles.screenText}>Home Screen</Text>
      </View>
    );
  };

  export default HomeScreen;