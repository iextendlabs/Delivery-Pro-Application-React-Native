import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import MainStyles from '../styles/Main';
const styles = StyleSheet.create(MainStyles);
import { useNavigation } from '@react-navigation/native';

const OrderLinks = () => {
  const navigation = useNavigation();

  const AssignedOrder = () => {
    navigation.navigate('OrderList', { status: 'Assigned' });
  };

  const InProgressOrder = () => {
    navigation.navigate('OrderList', { status: 'Inprogress' });
  };

  const DeliveredOrder = () => {
    navigation.navigate('OrderList', { status: 'Complete' });
  };

    return (
      <View style={styles.screenContainer}>
        <View style={styles.buttonContainer}>
        <TouchableHighlight
          style={styles.button}
          onPress={InProgressOrder}>
          <Text style={styles.buttonText}>In Progress</Text>
        </TouchableHighlight>

        <TouchableHighlight
          style={styles.button}
          onPress={DeliveredOrder}>
          <Text style={styles.buttonText}>Delivered</Text>
        </TouchableHighlight>

        <TouchableHighlight
          style={styles.button}
          onPress={AssignedOrder}>
          <Text style={styles.buttonText}>Assigned</Text>
        </TouchableHighlight>
      </View>
      </View>
    );
  };

  export default OrderLinks;