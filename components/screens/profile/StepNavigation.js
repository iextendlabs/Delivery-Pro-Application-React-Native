import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

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
  showSkip = false,
  showScrollPrompt = false, // New prop to control scroll prompt visibility
}) => {
  const arrowAnim = React.useRef(new Animated.Value(0)).current;

  // Animation setup
  React.useEffect(() => {
    if (!showScrollPrompt) return;

    const animateArrow = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(arrowAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(arrowAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateArrow();

    return () => arrowAnim.stopAnimation();
  }, [showScrollPrompt]);

  const arrowTranslateY = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 5],
  });

  return (
    <View style={styles.container}>
      {showScrollPrompt && (
        <Animated.View
          style={[
            styles.scrollPromptContainer,
            { transform: [{ translateY: arrowTranslateY }] },
          ]}
        >
          <View style={styles.scrollPromptContent}>
            <Text style={styles.scrollPromptText}>Scroll to explore</Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
          </View>
        </Animated.View>
      )}

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
        {showSkip && (
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={onNext}
          >
            <Text style={styles.buttonText}>Skip</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
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
  scrollPromptContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "100%", // Position above the buttons
    zIndex: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  scrollPromptContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  scrollPromptText: {
    color: "#666",
    fontSize: 14,
    marginRight: 8,
  },
});

export default StepNavigation;
