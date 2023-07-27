import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import MainStyles from '../styles/Main';
const styles = StyleSheet.create(MainStyles);
import { useNavigation } from '@react-navigation/native';

const OrderLinks = () => {
  const navigation = useNavigation();

  const AcceptedOrder = () => {
    navigation.navigate('OrderList', { status: 'Accepted' });
  };
   
  const PendingOrder = () => {
    navigation.navigate('OrderList', { status: 'Pending' });
  };

  const InProgressOrder = () => {
    navigation.navigate('OrderList', { status: 'Inprogress' });
  };

  const CompleteOrder = () => {
    navigation.navigate('OrderList', { status: 'Complete' });
  };

    return (
      <View style={styles.screenContainer}>
        <TouchableHighlight
          style={styles.button}
          onPress={PendingOrder}>
          <Text style={styles.buttonText}>Pending</Text>
        </TouchableHighlight>
        <TouchableHighlight
          style={styles.button}
          onPress={AcceptedOrder}>
          <Text style={styles.buttonText}>Accepted</Text>
        </TouchableHighlight>
        <TouchableHighlight
          style={styles.button}
          onPress={InProgressOrder}>
          <Text style={styles.buttonText}>In Progress</Text>
        </TouchableHighlight>
        <TouchableHighlight
          style={styles.button}
          onPress={CompleteOrder}>
          <Text style={styles.buttonText}>Complete</Text>
        </TouchableHighlight>
      </View>
    );
  };

  export default OrderLinks;