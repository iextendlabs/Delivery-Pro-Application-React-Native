import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Or use react-native-vector-icons/Ionicons

const SearchBox = ({ value, onChangeText, placeholder }) => (
  <View style={styles.container}>
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.input}
        placeholder={placeholder || "Search..."}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#888"
      />
      <Ionicons name="search" size={22} color="#888" style={styles.icon} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 10,
    marginTop: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e4fbfb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bbb",
    paddingHorizontal: 8,
    height: 50,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#222",
    backgroundColor: "#e4fbfb",
    paddingVertical: 0,
    paddingHorizontal: 4,
  },
  icon: {
    marginLeft: 8,
  },
});

export default SearchBox;