import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  Modal,
  Platform,
  ScrollView,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BaseUrl, getQuotesUrl, quoteStatusUpdateUrl } from "../config/Api";
import Splash from "./Splash";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import QuoteListStyle from "../styles/QuoteListStyle";
import Icon from "react-native-vector-icons/FontAwesome";
import { formatDistanceToNow, isToday, parseISO, format } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";

const QuoteListScreen = ({ navigation }) => {
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "All",
    dateFrom: null,
    dateTo: null,
    todayOnly: false,
  });
  const [showDatePicker, setShowDatePicker] = useState(null);

  const statusTabs = ["All", "Pending", "Accepted", "Inprogress", "Rejected"];

  const fetchQuotes = async () => {
    setLoading(true);
    setError("");

    try {
      const user = await AsyncStorage.getItem("@user_id");
      setUserId(user);
      const response = await axios.get(`${getQuotesUrl}user_id=${user}`);

      if (response.status === 200) {
        setQuotes(response.data.quotes);
        setFilteredQuotes(response.data.quotes);
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

  const applyFilters = () => {
    let result = [...quotes];

    if (filters.status !== "All") {
      result = result.filter(
        (quote) => quote.staffs[0].pivot.status === filters.status
      );
    }

    if (filters.todayOnly) {
      result = result.filter((quote) => isToday(parseISO(quote.created_at)));
    }

    if (filters.dateFrom && filters.dateTo) {
      result = result.filter((quote) => {
        const quoteDate = new Date(quote.created_at);
        const startDate = new Date(filters.dateFrom);
        const endDate = new Date(filters.dateTo);

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        quoteDate.setHours(12, 0, 0, 0);

        return quoteDate >= startDate && quoteDate <= endDate;
      });
    }

    setFilteredQuotes(result);
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, quotes]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchQuotes();
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(null);
    if (selectedDate) {
      setFilters({
        ...filters,
        [showDatePicker === "from" ? "dateFrom" : "dateTo"]: selectedDate,
        todayOnly: false, // Disable today filter when selecting custom dates
      });
    }
  };

  const resetFilters = () => {
    setFilters({
      status: "All",
      dateFrom: null,
      dateTo: null,
      todayOnly: false,
    });
  };

  const formatDateDisplay = (date) => {
    if (!date) return "Select date";
    return format(date, "MMM dd, yyyy");
  };

  const handleAccept = async (quote, status) => {
    const pivot = quote.staffs[0]?.pivot || {};
    const quote_amount = pivot.quote_amount ?? 0;
    const quote_commission = pivot.quote_commission ?? 0;

    const message =
      status === "Accepted"
        ? `Accept this quote? Your balance will be adjusted by ${quote_amount} AED. If you win, ${quote_commission}% will be deducted.`
        : "Reject this quote?";

    Alert.alert("Confirm", message, [
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
              user_id: userId,
              status: status,
            });

            if (response.status === 200) {
              Alert.alert("Success", response.data.message);
              fetchQuotes();
            } else if (response.status === 201) {
              Alert.alert("Error", response.data.error);
            }
          } catch (error) {
            Alert.alert("Error", "Failed to update quote status.");
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
      <View style={styles.quoteCard}>
        <TouchableOpacity
          onPress={() => navigation.navigate("ViewQuote", { quote: item })}
          style={styles.quoteContent}
        >
          {service.image && (
            <Image
              source={{ uri: `${BaseUrl}service-images/${service.image}` }}
              style={styles.quoteServiceImage}
            />
          )}

          <View style={styles.quoteMain}>
            <View style={styles.quoteHeader}>
              <Text style={styles.quoteServiceName} numberOfLines={1}>
                {item.service_name}
              </Text>
              <Text style={styles.timeText}>
                {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
              </Text>
            </View>

            <View style={styles.quoteMeta}>
              {show_quote_detail == "1" && (status === "Accepted" || status === "Inprogress") && (
                <Text style={styles.metaText} numberOfLines={1}>
                  <Text style={styles.boldText}>From:</Text>{" "}
                  {user?.name || "Unknown"}
                </Text>
              )}

              {sourcing_quantity && (
                <Text style={styles.metaText}>
                  <Text style={styles.boldText}>Qty:</Text> {sourcing_quantity}
                </Text>
              )}
            </View>

            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusBadge,
                  status === "Accepted" && styles.statusAccepted,
                  status === "Rejected" && styles.statusRejected,
                  status === "Pending" && styles.statusPending,
                  status === "Inprogress" && styles.statusInprogress,
                ]}
              >
                <Text style={styles.quoteStatusText}>{status}</Text>
              </View>

              {bid && (
                <View
                  style={[
                    styles.bidBadge,
                    bid.staff_id === userId ? styles.bidWon : styles.bidLost,
                  ]}
                >
                  <Text style={styles.bidText}>
                    {bid.staff_id === userId ? "You won" : "Bid lost"}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {(bid === null || (bid && bid.staff_id === userId)) &&
            (status === "Accepted" || status === "Inprogress") && (
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  item.bid_status === true && styles.chatBtn,
                ]}
                onPress={() =>
                  navigation.navigate("BidsScreen", { quoteId: item.id })
                }
              >
                {item.bid_status == true ? (
                  <View style={styles.chatBtnContent}>
                    <Icon
                      name="comments"
                      size={16}
                      color="#fff"
                      style={styles.chatIcon}
                    />
                    <Text style={styles.actionBtnText}>Chat</Text>
                  </View>
                ) : (
                  <Text style={styles.actionBtnText}>Place Bid</Text>
                )}
              </TouchableOpacity>
            )}

          {bid === null && status === "Pending" && (
            <View style={styles.statusActions}>
              <TouchableOpacity
                style={[styles.statusBtn, styles.acceptBtn]}
                onPress={() => handleAccept(item, "Accepted")}
              >
                <Text style={styles.statusBtnText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusBtn, styles.rejectBtn]}
                onPress={() => handleAccept(item, "Rejected")}
              >
                <Text style={styles.statusBtnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
      <Header title="Quotes" />

      <View style={styles.statusTabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {statusTabs.map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusTab,
                filters.status === status && styles.statusTabActive,
              ]}
              onPress={() => setFilters({ ...filters, status })}
            >
              <Text
                style={[
                  styles.statusTabText,
                  filters.status === status && styles.statusTabTextActive,
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filter Button */}
      <View style={styles.filterContent}>
        <TouchableOpacity
          style={styles.todayFilter}
          onPress={() =>
            setFilters({
              ...filters,
              todayOnly: !filters.todayOnly,
              dateFrom: null,
              dateTo: null,
            })
          }
        >
          <View style={styles.checkbox}>
            {filters.todayOnly && <Icon name="check" size={14} color="#fff" />}
          </View>
          <Text style={styles.todayFilterText}>Today's quotes only</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Icon name="filter" size={18} color="#fff" />
          <Text style={styles.filterButtonText}>Filter By date</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredQuotes}
        renderItem={renderQuoteItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={[styles.listContent, { paddingBottom: 55 }]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No quotes match your filters</Text>
            <TouchableOpacity onPress={resetFilters}>
              <Text style={styles.resetFilterText}>Reset filters</Text>
            </TouchableOpacity>
          </View>
        }
        ListHeaderComponent={
          filteredQuotes.length > 0 && (
            <Text style={styles.filterResultsText}>
              Showing {filteredQuotes.length} of {quotes.length} quotes
            </Text>
          )
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Quotes</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Icon name="times" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Date Range Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Date Range</Text>
              <View style={styles.dateRangeContainer}>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker("from")}
                >
                  <Text>{formatDateDisplay(filters.dateFrom)}</Text>
                  <Icon name="calendar" size={16} color="#666" />
                </TouchableOpacity>
                <Text style={styles.dateRangeSeparator}>to</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker("to")}
                >
                  <Text>{formatDateDisplay(filters.dateTo)}</Text>
                  <Icon name="calendar" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Today Filter */}

            {/* Action Buttons */}
            <View style={styles.filterActions}>
              <TouchableOpacity
                style={[styles.filterActionButton, styles.resetButton]}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterActionButton, styles.applyButton]}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={
            filters[showDatePicker === "from" ? "dateFrom" : "dateTo"] ||
            new Date()
          }
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
        />
      )}

      <Footer />
    </View>
  );
};

const styles = StyleSheet.create(QuoteListStyle);

export default QuoteListScreen;
