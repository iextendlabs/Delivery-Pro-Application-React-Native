import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  Alert, // Add Alert
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BaseUrl, getQuotesUrl, quoteStatusUpdateUrl } from "../config/Api";
import Splash from "./Splash";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import QuoteListStyle from "../styles/QuoteListStyle";
import Icon from "react-native-vector-icons/FontAwesome";

const QuoteListScreen = ({ navigation }) => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState("");

  // Fetch quotes
  const fetchQuotes = async () => {
    setLoading(true);
    setError("");

    try {
      const user = await AsyncStorage.getItem("@user_id");
      setUserId(user);
      const response = await axios.get(`${getQuotesUrl}user_id=${user}`);

      if (response.status === 200) {
        setQuotes(response.data.quotes);
      } else {
        setError("Failed to fetch quotes. Please try again.");
      }
    } catch (error) {
      setError("An error occurred while fetching data.");
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchQuotes();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  // Handle Accept button click
  const handleAccept = async (quote, status) => {
    const pivot = quote.staffs[0]?.pivot || {};
    const quote_amount = pivot.quote_amount ?? 0;
    const quote_commission = pivot.quote_commission ?? 0;


    const message =
      status === "Accepted"
        ? `Are you sure you want to accept this quote? Upon acceptance, your balance will be adjusted by ${quote_amount} AED. If you win the bid, ${quote_commission}% of your bid value will be deducted from your balance.`
        : "Are you sure you want to reject this quote?";

    Alert.alert("Confirm Acceptance", message, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "OK",
        onPress: async () => {
          setLoading(true);
          try {
            const response = await axios.post(quoteStatusUpdateUrl, {
              id: quote.id,
              user_id: userId, // Ensure userId is correctly defined in your component state
              status: status,
            });

            if (response.status === 200) {
              Alert.alert("Success", response.data.message);
              fetchQuotes(); // Refresh data after successful update
            } else if (response.status === 201) {
              Alert.alert("Error", response.data.error);
            }
          } catch (error) {
            Alert.alert(
              "Error",
              "An error occurred while updating the quote status."
            );
            console.error("Error updating quote:", error);
          }
          setLoading(false);
        },
      },
    ]);
  };

  const renderQuoteItem = ({ item }) => {
    const {
      id,
      bid,
      staffs,
      service,
      user,
      sourcing_quantity,
      created_at,
      show_quote_detail,
      location,
    } = item;
    const { status, quote_amount, quote_commission } = staffs[0].pivot;

    return (
      <View style={styles.quoteItem}>
        <View style={styles.serviceContainer}>
          {service.image && (
            <Image
              source={{ uri: `${BaseUrl}service-images/${service.image}` }}
              style={styles.serviceImage}
            />
          )}
          <View style={styles.serviceDetails}>
            <Text style={styles.serviceName}>{item.service_name}</Text>
            {sourcing_quantity && (
              <Text style={styles.quantityText}>
                {sourcing_quantity} Quantity
              </Text>
            )}
          </View>
        </View>
        <Text style={styles.senderText}>
          <Text style={styles.boldText}>Id #:</Text> {id}
        </Text>
        <Text style={styles.senderText}>
          <Text style={styles.boldText}>Send by:</Text>{" "}
          {user?.name || "Unknown"}
        </Text>
        <Text style={styles.statusText}>
          <Text style={styles.boldText}>Status:</Text> {status}
        </Text>
        <Text style={styles.statusText}>
          <Text style={styles.boldText}>Quote Amount:</Text> AED {quote_amount ?? 0}
        </Text>
        <Text style={styles.statusText}>
          <Text style={styles.boldText}>Commission:</Text> {quote_commission ?? 0}%
        </Text>
        <Text style={styles.dateText}>
          <Text style={styles.boldText}>Date Added:</Text>{" "}
          {formatDate(created_at)}
        </Text>
        {show_quote_detail == "1" && status == "Accepted" && (
          <Text style={styles.statusText}>
            <Text style={styles.boldText}>Location:</Text> {location}
          </Text>
        )}
        {bid && (
          <View style={styles.centeredContainer}>
            <View
              style={[
                styles.badge,
                bid.staff_id === userId ? styles.success : styles.danger,
              ]}
            >
              <Text style={styles.badgeText}>
                {bid.staff_id === userId
                  ? "You have won the bid"
                  : "Another staff member has won the bid"}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("ViewQuote", { quote: item })}
          >
            <Text style={styles.actionButtonText}>View Detail</Text>
          </TouchableOpacity>
          {(bid === null || (bid && bid.staff_id === userId)) &&
            status === "Accepted" && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  item.bid_status === true && { backgroundColor: "#ffbf0b" },
                ]}
                onPress={() =>
                  navigation.navigate("BidsScreen", { quoteId: item.id })
                }
              >
                {item.bid_status == true ? (
                  <Text style={styles.actionButtonText}>
                    <Icon name="comments" size={24} color="#fff" />
                    Chat
                  </Text>
                ) : (
                  <Text style={styles.actionButtonText}>Bids</Text>
                )}
              </TouchableOpacity>
            )}
        </View>

        {bid === null && status === "Pending" && (
          <View style={styles.statusButtons}>
            <TouchableOpacity
              style={[styles.statusButton, styles.success]}
              onPress={() => handleAccept(item, "Accepted")}
            >
              <Text style={styles.actionButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statusButton, styles.danger]}
              onPress={() => handleAccept(item, "Rejected")}
            >
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) return <Splash />;
  if (error)
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Header title="Home" />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={{ paddingHorizontal: 16, marginBottom: 40 }}>
          {quotes.length > 0 ? (
            <FlatList
              data={quotes}
              renderItem={renderQuoteItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.noQuotesText}>There are no quotes.</Text>
          )}
        </View>
      </ScrollView>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create(QuoteListStyle);

export default QuoteListScreen;
