import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import StepIndicator from "react-native-step-indicator";
import axios from "axios";

import BasicInfo from "./BasicInfo";
import Designation from "./Designation";
import DriverAssignment from "./DriverAssignment";
import GalleryVideos from "./GalleryVideos";
import Categories from "./Categories";
import Services from "./Services";
import Documents from "./Documents";
import { IndexUrl, updateUserUrl } from "../../config/Api";
import Splash from "../Splash";
import { loadProfileLocalData } from "../../Database/profile";
import { Ionicons } from "@expo/vector-icons";
import GroupZones from "./GroupZones";

const labels = [
  "Basic Info",
  "Designation",
  "Driver",
  "Gallery",
  "Groups & Zones",
  "Categories",
  "Services",
  "Documents",
];

const customStyles = {
  stepIndicatorSize: 30,
  currentStepIndicatorSize: 35,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: "#000",
  stepStrokeWidth: 2,
  stepStrokeFinishedColor: "#000",
  stepStrokeUnFinishedColor: "#cccccc",
  separatorFinishedColor: "#000",
  separatorUnFinishedColor: "#cccccc",
  stepIndicatorFinishedColor: "#000",
  stepIndicatorUnFinishedColor: "#cccccc",
  stepIndicatorCurrentColor: "#fff",
  stepIndicatorLabelFontSize: 13,
  currentStepIndicatorLabelFontSize: 13,
  stepIndicatorLabelCurrentColor: "#000",
  stepIndicatorLabelFinishedColor: "#fff",
  stepIndicatorLabelUnFinishedColor: "#fff",
  labelColor: "#999999",
  labelSize: 12,
  currentStepLabelColor: "#000",
};

const UpdateProfile = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const userId = await AsyncStorage.getItem("@user_id");
    if (userId) {
      setLoading(true);
      try {
        const profileData = await loadProfileLocalData();
        if (!profileData) {
          throw new Error("Failed to load profile data");
        }
        setFormData({
          name: profileData.name ?? "",
          email: profileData.email ?? "",
          number: profileData.phone ?? "",
          whatsapp: profileData.whatsapp ?? "",
          image: profileData.image ?? "",
          about: profileData.about ?? "",
          password: "",
          confirmPassword: "",
          designations: profileData.subTitles ?? [],
          getQuoteEnabled: Boolean(profileData.get_quote) ?? false,
          driverAssigned: false,
          location: profileData.location ?? "",
          nationality: profileData.nationality ?? "",
          affiliate: "",
          galleryImages: profileData.staffImages ?? [],
          youtubeVideos: profileData.staffYoutubeVideo ?? [],
          staffGroups: profileData.staffGroups ?? [],
          categories: profileData.category_ids ?? [],
          services: profileData.service_ids ?? [],
          addressProof: profileData.document[0]?.address_proof || null,
          noc: profileData.document[0]?.noc || null,
          idCardFront: profileData.document[0]?.id_card_front || null,
          idCardBack: profileData.document[0]?.id_card_back || null,
          passport: profileData.document[0]?.passport || null,
          drivingLicense: profileData.document[0]?.driving_license || null,
          education: profileData.document[0]?.education || null,
          other: profileData.document[0]?.other || null,
        });
      } catch (error) {
        Alert.alert(
          "Issue to Load Data",
          "Failed to load profile data,\n Please log out and log back in.",
          [{ text: "OK" }]
        );
      } finally {
        setLoading(false);
      }
    } else {
      navigation.navigate("Login");
    }
  };

  useEffect(() => {
    const loadProgress = async () => {
      const savedStep = await AsyncStorage.getItem("@signup_step");
      if (savedStep) setCurrentStep(parseInt(savedStep));
    };
    loadProgress();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("@signup_step", currentStep.toString());
  }, [currentStep]);

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit = async () => {
    setCurrentStep(0);
    const isLocal = (path) => path?.startsWith("file://");
    const toFormDataFile = (uri, name) => {
      const filename = uri.split("/").pop();
      const fileType = filename.split(".").pop();
      return {
        uri,
        name: name || filename,
        type: `image/${fileType}` || "image/jpeg",
      };
    };

    const formattedData = new FormData();

    formattedData.append("user_id", await AsyncStorage.getItem("@user_id"));
    formattedData.append("user[name]", formData.name);
    formattedData.append("user[email]", formData.email);
    formattedData.append("user[password]", formData.password || "");
    formattedData.append("user[get_quote]", formData.getQuoteEnabled);
    formattedData.append("user[phone]", formData.number);
    formattedData.append("user[about]", formData.about);
    formattedData.append("user[whatsapp]", formData.whatsapp);
    formattedData.append("user[location]", formData.location);
    formattedData.append("user[nationality]", formData.nationality);

    if (isLocal(formData.image)) {
      formattedData.append(
        "image",
        toFormDataFile(formData.image, "profile.jpg")
      );
    }

    if (formData.galleryImages?.filter(isLocal).length > 0) {
      formData.galleryImages.filter(isLocal).forEach((img, index) => {
        formattedData.append(
          `images[${index}]`,
          toFormDataFile(img, `gallery_${index}.jpg`)
        );
      });
    }

    const documents = {
      address_proof: formData.addressProof,
      noc: formData.noc,
      id_card_front: formData.idCardFront,
      id_card_back: formData.idCardBack,
      passport: formData.passport,
      driving_license: formData.drivingLicense,
      education: formData.education,
      other: formData.other,
    };

    Object.entries(documents).forEach(([key, uri]) => {
      if (isLocal(uri)) {
        formattedData.append(
          `documents[${key}]`,
          toFormDataFile(uri, `${key}.jpg`)
        );
      }
    });

    formData.staffGroups?.forEach((groupId, index) => {
      formattedData.append(`staff_groups[${index}]`, groupId);
    });

    formData.designations?.forEach((subtitleId, index) => {
      formattedData.append(`subtitles[${index}]`, subtitleId);
    });

    formData.categories?.forEach((categoryId, index) => {
      formattedData.append(`staff_categories[${index}]`, categoryId);
    });

    formData.services?.forEach((serviceId, index) => {
      formattedData.append(`staff_services[${index}]`, serviceId);
    });
    setLoading(true);

    try {
      const response = await axios.post(`${updateUserUrl}`, formattedData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 200) {
        setSuccess(true);
        setError(false);
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      } else if (response.status === 201) {
        setSuccess(false);
        setError(true);
      }
    } catch (error) {
      setSuccess(false);
      setError(true);
      setLoading(false);
    }
    setLoading(false);
  };

  const renderStep = () => {
    const commonProps = {
      currentStep,
      totalSteps: labels.length,
      onBack: () => navigation.goBack(),
      onPrevious: handlePrevious,
      onSubmit: handleSubmit,
      formData,
      setFormData,
    };
    switch (currentStep) {
      case 0:
        return <BasicInfo {...commonProps} onNext={handleNext} />;
      case 1:
        return <Designation {...commonProps} onNext={handleNext} />;
      case 2:
        return <DriverAssignment {...commonProps} onNext={handleNext} />;
      case 3:
        return <GalleryVideos {...commonProps} onNext={handleNext} />;
      case 4:
        return <GroupZones {...commonProps} onNext={handleNext} />;
      case 5:
        return <Categories {...commonProps} onNext={handleNext} />;
      case 6:
        return <Services {...commonProps} onNext={handleNext} />;
      case 7:
        return <Documents {...commonProps} onNext={handleNext} />;
      default:
        return null;
    }
  };

  const getVisibleSteps = () => {
    const start = Math.max(0, currentStep - 2);
    const end = Math.min(labels.length, currentStep + 3); // +3 because slice is exclusive at end
    return Array.from({ length: end - start }, (_, i) => start + i);
  };

  const renderStepIndicator = ({ position, stepStatus }) => {
    const visibleSteps = getVisibleSteps();
    const stepNumber = visibleSteps[position] + 1; // Adjust number
    const isCurrent = visibleSteps[position] === currentStep;

    return (
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor:
            stepStatus === "finished"
              ? "#000"
              : stepStatus === "current"
              ? "#fff"
              : "#ccc",
          justifyContent: "center",
          alignItems: "center",
          borderWidth: isCurrent ? 2 : 1,
          borderColor: "#000",
        }}
      >
        <Text
          style={{
            color: stepStatus === "current" ? "#000" : "#fff",
            fontWeight: "bold",
          }}
        >
          {stepNumber}
        </Text>
      </View>
    );
  };

  const handleHomePress = () => {
    navigation.navigate("Home"); // Replace "Home" with your actual home screen name
  };

  if (loading) {
    return <Splash />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.homeButton} onPress={handleHomePress}>
          <Ionicons name="close-circle" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.stepIndicatorContainer}>
        <StepIndicator
          customStyles={customStyles}
          currentPosition={getVisibleSteps().indexOf(currentStep)}
          labels={getVisibleSteps().map((i) => labels[i])}
          stepCount={getVisibleSteps().length}
          renderStepIndicator={renderStepIndicator}
        />
      </View>
      {error && (
        <Text style={styles.error}>
          Something went wrong. Please log out and log back in, then try again{" "}
        </Text>
      )}
      {success && (
        <Text style={styles.success}>Profile updated successfully.</Text>
      )}

      <View style={styles.content}>{renderStep()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e4fbfb",
    padding: 10,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  stepIndicatorContainer: {
    marginTop: 20,
  },
  homeButton: {
    backgroundColor: "#000",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    marginTop: 20,
  },
  error: {
    color: "red",
    backgroundColor: "#ffebee",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    textAlign: "center",
    fontWeight: "500",
  },
  success: {
    color: "green",
    backgroundColor: "#e8f5e9",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    textAlign: "center",
    fontWeight: "500",
  },
});

export default UpdateProfile;
