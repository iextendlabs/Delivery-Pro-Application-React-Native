import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Modal } from "react-native";
import { format } from "date-fns";
import TransactionStyle from "../../styles/TransactionStyle";

const FilterModal = ({
  filterModalVisible,
  setFilterModalVisible,
  fromDate,
  toDate,
  showDatePicker,
  filterTransactions,
}) => {
  return (
    <Modal visible={filterModalVisible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setFilterModalVisible(false)}
          >
            <Text style={styles.closeText}>❌</Text>
          </TouchableOpacity>
          <Text style={styles.filterTitle}>Filter by Date</Text>

          {/* From Date */}
          <View style={styles.dateTimeContainer}>
            <Text style={styles.label}>From Date:</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => showDatePicker("from")}
            >
              <Text style={styles.dateTimeText}>
                {format(fromDate, "yyyy-MM-dd")}
              </Text>
              <Image
                style={styles.icon}
                source={require("../../images/calendar.png")}
              />
            </TouchableOpacity>
          </View>

          {/* To Date */}
          <View style={styles.dateTimeContainer}>
            <Text style={styles.label}>To Date:</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => showDatePicker("to")}
            >
              <Text style={styles.dateTimeText}>
                {format(toDate, "yyyy-MM-dd")}
              </Text>
              <Image
                style={styles.icon}
                source={require("../../images/calendar.png")}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={filterTransactions}
            style={styles.applyButton}
          >
            <Text style={styles.applyButtonText}>Apply Filter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create(TransactionStyle);

export default FilterModal;