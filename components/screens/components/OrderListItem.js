import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";

import Icon from "react-native-vector-icons/Ionicons";
import LocationElement from "../../modules/LocationElement";
import WhatsAppElement from "../../modules/WhatsappElement";
import OrderListStyle from "../../styles/OrderListStyle";
import { StyleSheet } from "react-native-web";
const styles = StyleSheet.create(OrderListStyle);
const orderStatusActions = {
    "Accepted": "Inprogress",
    "Pending": ["Accepted", "Rejected"],
    "Inprogress": "Complete",
  };
const OrderListItem = ({ item, handleIconPress }) => {
    let container;
    switch (item.status) {
        case "Pending":
            container = styles.orderContainerOrange
            break;
        case "Accepted":
            container = styles.orderContainerGreen
            break;
        case "Inprogress":
            container = styles.orderContainerBlue
            break;
        default:
            container = styles.orderContainer;
            break;
    }
    return (
      <TouchableOpacity style={container}>
        <View style={{ flex: 1 }}>
          <Text style={styles.orderId}>
            #{item.id} {"  "}<Icon name="ios-calendar" size={20} color="black" />{item.time_slot_value}
          </Text>
          <Text style={styles.orderDate}>{item.driver_name}
            <Icon name="ios-car" size={15} color="black" />
            {item.driver_status}
          </Text>
        </View>

        <View style={styles.OrderLinks}>
          <LocationElement
            latitude={item.latitude}
            longitude={item.longitude}
            address={
              item.buildingName +
              " " +
              item.street +
              "," +
              item.area +
              " " +
              item.city
            }
          />
          <Icon
            name="eye"
            size={25}
            color="orange"
            style={styles.icons}
            onPress={() => handleIconPress("detail",item)}
          />
          {item.driver_id && (
            <Icon
              name="chatbubble"
              size={25}
              color="blue" // Change this to your desired color for 'Pending' status.
              style={styles.icons}
              onPress={() => handleIconPress("chat",item)}
            />
          )}
          {(item.status === "Accepted" || item.status === "Complete") &&
            item.driver_status === "Pending" && (
              <Icon
                name="ios-car"
                size={25}
                color="blue" // Change this to your desired color for 'Pending' status.
                style={styles.icons}
                onPress={() => handleIconPress("driver",item)}
              />
            )}
          {item.status !== "Complete" && (
            <Icon
              name="chatbubble-ellipses-outline"
              size={25}
              color="black"
              style={styles.icons}
              onPress={() => handleIconPress("comment", item)}
            />
          )}

          <WhatsAppElement showNumber={false} phoneNumber={item.whatsapp} />
          {item.status === "Pending" && (
            <Icon
              name="ios-calendar"
              size={25}
              color="blue" // Change this to your desired color for 'Pending' status.
              style={styles.icons}
              onPress={() => handleIconPress("schedule", item)}
            />
          )}
          {item.status == "Complete" && (
            <Icon
              name="cash-outline"
              size={25}
              color={item.cashCollection_status ? "green" : "orange"}
              style={styles.icons}
              onPress={() =>item.cashCollection_status === false && handleIconPress("cash", item)}
            />
          )}
          {item.status in orderStatusActions && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleIconPress("status", item, orderStatusActions[item.status])}

            >
              <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>
          )}



        </View>

        <View style={styles.OrderLinks}>
          <Text style={styles.orderId}>
            {item.status}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  export default OrderListItem;