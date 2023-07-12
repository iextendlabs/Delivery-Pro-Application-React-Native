import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import MainStyles from '../styles/Main';
const styles = StyleSheet.create(MainStyles);
import { useNavigation } from '@react-navigation/native';

const OrderLinks = () => {
  const navigation = useNavigation();

  const AssignedOrder = () => {
    navigation.navigate('OrderList', { status: 'ASSIGNED' });
  };

  const InProgressOrder = () => {
    navigation.navigate('OrderList', { status: 'INPROGRESS' });
  };

  const DeliveredOrder = () => {
    navigation.navigate('OrderList', { status: 'DELIVERED' });
  };

  const UnassignedOrder = () => {
    navigation.navigate('OrderList', { status: 'UNASSIGNED' });
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

        <TouchableHighlight
          style={styles.button}
          onPress={UnassignedOrder}>
          <Text style={styles.buttonText}>Un Assigned</Text>
        </TouchableHighlight>
      </View>
      </View>
    );
  };

  export default OrderLinks;