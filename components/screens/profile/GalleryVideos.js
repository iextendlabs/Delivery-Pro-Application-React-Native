import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import StepNavigation from "./StepNavigation";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDatabase } from "../../Database/database";
import Splash from "../Splash";
import Profile from "../../styles/Profile";

const GalleryVideos = ({
  currentStep,
  totalSteps,
  onBack,
  onPrevious,
  formData,
  onNext,
  setFormData,
}) => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [videoAgreement, setVideoAgreement] = useState(false);
  const [whatsapp, setWhatsapp] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    const fetchAndCacheImages = async () => {
      if (!mounted || !formData) return;
      setIsLoading(true);
      const whatsapp = await AsyncStorage.getItem("@whatsapp");
      const videoAgreement = await AsyncStorage.getItem("@videoAgreement");
      setWhatsapp(whatsapp);
      setVideoAgreement(videoAgreement == "true" ? true : false);
      if (formData?.galleryImages?.length) {
        setGalleryImages(formData.galleryImages || []);
      }
      setIsLoading(false);
    };

    fetchAndCacheImages();
  }, [formData]);

  const addGalleryImage = async () => {
    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const localUris = [];

        for (let asset of result.assets) {
          const fileName = asset.uri.split("/").pop();
          const localUri = FileSystem.documentDirectory + fileName;

          const fileInfo = await FileSystem.getInfoAsync(localUri);

          if (!fileInfo.exists) {
            // Copy the image to local file system
            await FileSystem.copyAsync({
              from: asset.uri,
              to: localUri,
            });
          }

          localUris.push(localUri); // Add the local path (new or existing)
        }

        // Prepend new images to galleryImages
        setGalleryImages([...localUris, ...galleryImages]);
      }
    } catch (error) {
      console.error("Error picking images:", error);
      Alert.alert("Error", "Failed to pick images. Please try again.");
    }
    setIsLoading(false);
  };

  const removeImage = (index) => {
    setIsLoading(true);
    const newImages = [...galleryImages];
    newImages.splice(index, 1);
    setGalleryImages(newImages);
    setIsLoading(false);
  };

  const toggleVideoAgreement = () => {
    setVideoAgreement(!videoAgreement);
  };

  const handleSendWhatsapp = async () => {
    if (!whatsapp) {
      Alert.alert("Error", "WhatsApp number not set.");
      return;
    }

    const phoneNumber = whatsapp.replace(/\D/g, ""); // sanitize to digits
    const message = "Hi, I would like to send you some videos.";
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(
      message
    )}`;

    Linking.openURL(whatsappUrl);
  };

  const handleNextPress = async () => {
    if (galleryImages.length < 1) {
      Alert.alert("Validation Error", "Please add at least one image.");
      return;
    }

    if (videoAgreement != true) {
      Alert.alert("Validation Error", "Please agree to Terms & Conditions.");
      return;
    }
    setIsLoading(true);

    await AsyncStorage.setItem("@videoAgreement", "true");

    const db = await getDatabase();

    try {
      await db.execAsync("BEGIN TRANSACTION");

      await db.runAsync("DELETE FROM images");

      for (const image of galleryImages) {
        await db.runAsync("INSERT INTO images (image) VALUES (?)", [image]);
      }

      await db.execAsync("COMMIT");
      setFormData((prev) => ({
        ...prev,
        galleryImages: galleryImages,
      }));
      onNext();
    } catch (error) {
      await db.execAsync("ROLLBACK");
      console.error("[GalleryImages ERROR] Failed to save:", error);
      Alert.alert("Error", "Failed to save selected galleryImages.");
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <Splash />;
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Gallery & YouTube Videos</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subSectionTitle}>Gallery Images</Text>
        <TouchableOpacity style={styles.addButton} onPress={addGalleryImage}>
          <Text style={styles.addButtonText}>Add Images to Gallery</Text>
        </TouchableOpacity>

        <FlatList
          data={galleryImages}
          keyExtractor={(item, index) => index.toString()}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.galleryList}
          renderItem={({ item, index }) => (
            <View style={styles.galleryImageContainer}>
              <Image source={{ uri: item }} style={styles.galleryImage} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        <Text style={styles.subSectionTitle}>YouTube Videos</Text>
        <Text style={styles.note}>
          Note: Videos should not be uploaded to any social media before
          submission. We need new videos that haven't been shared anywhere else.
          By submitting, you agree that you have no rights or copyright claims
          on these videos. Any future claims will result in penalty charges as
          per damage to company reputation as decided by the team.{"\n\n"}
          Please upload your video via WhatsApp and also mention your email
          address to help us identify your account.
        </Text>

        <TouchableOpacity
          style={styles.whatsappButton}
          onPress={handleSendWhatsapp}
        >
          <Text style={styles.whatsappButtonText}>
            Send Videos via WhatsApp
          </Text>
        </TouchableOpacity>

        <View style={styles.agreementContainer}>
          <TouchableOpacity
            style={[styles.checkbox, videoAgreement && styles.checkedBox]}
            onPress={toggleVideoAgreement}
          >
            {videoAgreement && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          <Text style={styles.agreementText}>
            I understand and agree to the video submission terms
          </Text>
        </View>
      </ScrollView>

      {/* Fixed Footer Navigation */}
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

const styles = StyleSheet.create(Profile);

export default GalleryVideos;
