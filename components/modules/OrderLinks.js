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

    return (
      <View style={styles.screenContainer}>
        <View style={styles.buttonContainer}>
        <TouchableHighlight
          style={styles.button}
          onPress={InProgressOrder}>
          <Text>In Progress</Text>
        </TouchableHighlight>

        <TouchableHighlight
          style={styles.button}
          onPress={DeliveredOrder}>
          <Text>Delivered</Text>
        </TouchableHighlight>

        <TouchableHighlight
          style={styles.button}
          onPress={AssignedOrder}>
          <Text>Assigned</Text>
        </TouchableHighlight>
      </View>
      </View>
    );
  };

  export default OrderLinks;