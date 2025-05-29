import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

const StepNavigation = ({
  currentStep,
  totalSteps,
  onBack,
  onPrevious,
  onNext,
  onSubmit,
  showBack = true,
  showPrevious = true,
  showNext = true,
  showSubmit = true,
}) => {
  return (
    <View style={styles.buttonRow}>
      {showBack && currentStep <= 0 && (
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={onBack}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      )}

      {showPrevious && currentStep > 0 && (
        <TouchableOpacity style={styles.button} onPress={onPrevious}>
          <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>
      )}

      {showNext && currentStep < totalSteps - 1 ? (
        <TouchableOpacity style={styles.button} onPress={onNext}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      ) : (
        showSubmit && (
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={onSubmit}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 10,
    gap: 10,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: "#28a745",
  },
  backButton: {
    backgroundColor: "#8b8b8b",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});

export default StepNavigation;
