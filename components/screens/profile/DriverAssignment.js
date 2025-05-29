import React from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import StepNavigation from "./StepNavigation";

const DriverAssignment = ({
  currentStep,
  totalSteps,
  onBack,
  onPrevious,
  formData,
  onNext,
  setFormData,
}) => {
  const handleNextPress = () => {
    onNext();
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Driver Assignment</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.message}>
          We are currently working on this feature. It will be available soon.
        </Text>
        <Text style={styles.note}>
          You can skip this step for now and come back later when the feature is
          ready.
        </Text>

        <View style={styles.placeholder} />
        <View style={styles.placeholder} />
        <View style={styles.placeholder} />
      </ScrollView>

      <StepNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={onBack}
        onPrevious={onPrevious}
        onNext={handleNextPress}
        onSubmit={() => alert("Submit")}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  note: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  placeholder: {
    height: 200,
    backgroundColor: "#f5f5f5",
    marginVertical: 10,
    borderRadius: 8,
  },
});

export default DriverAssignment;
