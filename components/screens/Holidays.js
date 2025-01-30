import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import Splash from "./Splash";
import { GetHolidaysUrl } from "../config/Api";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CommonButton from "../common/CommonButton";

const Holidays = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [holidays, setHolidays] = useState({
    holiday: [],
    long_holiday: [],
    short_holiday: [],
    staff_general_holidays: [],
    staff_holidays: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const userId = await AsyncStorage.getItem("@user_id");
    if (userId) {
      try {
        const response = await axios.get(`${GetHolidaysUrl}user_id=${userId}`);
        setHolidays(response.data);
      } catch (error) {
        console.error("Error fetching holidays:", error);
      } finally {
        setLoading(false);
      }
    } else {
      navigation.navigate("Login");
    }
  };

  if (loading) {
    return <Splash />;
  }

  const renderHoliday = ({ item, type }) => {
    let holidayText;
    let cardStyle = styles.holidayItem; // Default card style
    let statusText = "";

    if (type === "holiday") {
      holidayText = `Holiday Date: ${item.date}`;
    } else if (type === "long_holiday") {
      holidayText = `Long Holiday: ${item.date_start} to ${item.date_end}`;
    } else if (type === "short_holiday") {
      holidayText = `Short Holiday: ${item.date} from ${item.time_start} for ${item.hours} hours`;
      if (item.status === "1") {
        statusText = "Approved";
        cardStyle = { ...styles.holidayItem, backgroundColor: "#a2c8b2" }; // Green for approved
      } else {
        statusText = "Not Approved";
        cardStyle = { ...styles.holidayItem, backgroundColor: "#f8d7da" }; // Red for not approved
      }
    } else if (type === "staff_general_holidays") {
      holidayText = `Staff General Holiday: ${item.day}`;
    } else if (type === "staff_holidays") {
      holidayText = `Staff Holiday: ${item.date}`;
    }

    return (
      <View style={cardStyle}>
        <Text style={styles.holidayText}>{holidayText}</Text>
        {statusText && <Text style={styles.statusText}>{statusText}</Text>}
      </View>
    );
  };

  const renderSection = ({ item, sectionTitle }) => (
    <View
      style={[
        styles.holidaySection,
        { marginBottom: item === "staff_holidays" ? 70 : 20 },
      ]}
    >
      <Text style={styles.sectionTitle}>{sectionTitle}</Text>
      <FlatList
        data={holidays[item]}
        renderItem={(holiday) => renderHoliday({ ...holiday, type: item })}
        keyExtractor={(holiday) => holiday.id.toString()}
        ListEmptyComponent={() => (
          <View style={styles.holidayItem}>
            <Text style={styles.statusText}>No {sectionTitle} available</Text>
          </View>
        )}
      />

      {item === "short_holiday" && (
        <CommonButton
          title={"Apply Short Holiday"}
          bgColor={"#fd245f"}
          textColor={"#fff"}
          onPress={() => navigation.navigate("HolidayModal")}
        />
      )}
    </View>
  );

  const sections = Object.keys(holidays);

  return (
    <View style={styles.container}>
      <Header title={"Holidays"} />
      <FlatList
        showsVerticalScrollIndicator={false}
        data={sections}
        renderItem={({ item }) =>
          renderSection({
            item,
            sectionTitle: item.replace(/_/g, " ").toUpperCase(),
          })
        }
        keyExtractor={(item) => item}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No holidays available</Text>
        }
      />

      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e4fbfb",
  },
  holidaySection: {
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 10,
    color: "#2c3e50",
    letterSpacing: 0.5,
  },
  holidayItem: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  holidayText: {
    fontSize: 16,
    color: "#333",
  },
  statusText: {
    marginTop: 5,
    fontWeight: "600",
    padding: 5,
    borderRadius: 5,
    textAlign: "center",
    color: "#000",
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 18,
    color: "#888",
    marginTop: 20,
  },
});

export default Holidays;
