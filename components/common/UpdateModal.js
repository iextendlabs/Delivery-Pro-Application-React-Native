import React from "react";
import {
  Modal,
  View,
  Text,
  Button,
  Linking,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const UpdateModal = ({ visible, setUpdateModalVisible, setIsUpdate }) => {
  const handleUpdate = async () => {
    Linking.openURL("market://details?id=com.forexleo.lipslaystaff");
    setUpdateModalVisible(false);
    setIsUpdate(false);
  };

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Update Available</Text>
          <Text style={styles.message}>
            A new version of the app is available. Please update to the latest
            version to ensure smooth performance and avoid any potential issues.
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleUpdate}>
              <Text style={styles.buttonText}>UPDATE NOW</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: {
    backgroundColor: "#ffffff",
    padding: 25,
    borderRadius: 15,
    width: "85%",
    borderWidth: 2,
    borderColor: "#8ee9e9",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#000",
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
    color: "#333",
    textAlign: "center",
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#8ee9e9",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 200,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default UpdateModal;