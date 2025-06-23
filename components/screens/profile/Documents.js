// Documents.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  Linking,
  Alert,
} from "react-native";
import DocumentPicker from "react-native-document-picker";
import StepNavigation from "./StepNavigation";
import * as FileSystem from "expo-file-system";
import Splash from "../Splash";
import { getDatabase } from "../../Database/database";
import Profile from "../../styles/Profile";

const getFileExtension = (url) => {
  return url.substring(url.lastIndexOf("."));
};

const getFileNameFromUrl = (url) => {
  return url.split("/").pop();
};

const getMimeType = (url) => {
  const ext = getFileExtension(url).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".mp4") return "video/mp4";
  return "application/octet-stream";
};

const Documents = ({
  currentStep,
  totalSteps,
  onBack,
  onPrevious,
  formData,
  onNext,
  setFormData,
  onSubmit,
}) => {
  const [documents, setDocuments] = useState({});
  const [mounted, setMounted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    if (submitting) {
      setIsLoading(false);
      onSubmit(); // now safe to call
      setSubmitting(false); // reset
    }
  }, [formData]);

  useEffect(() => {
    const downloadAllDocuments = async () => {
      if (!formData) return;
      setIsLoading(true);

      const fields = {
        addressProof: formData.addressProof,
        noc: formData.noc,
        idCardFront: formData.idCardFront,
        idCardBack: formData.idCardBack,
        passport: formData.passport,
        drivingLicense: formData.driving_license,
        education: formData.education,
        other: formData.other,
      };

      setIsLoading(false);

      if (mounted) {
        setDocuments(fields);
      }
    };

    downloadAllDocuments();
  }, [formData]);

  const pickDocument = async (fieldName) => {
    setIsLoading(true);
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
      });

      const file = res[0] || res;
      const fileExtension = getFileExtension(file.name || file.fileName);
      const localFileName = `${fieldName}_${Date.now()}${fileExtension}`;
      const localUri = `${FileSystem.documentDirectory}${localFileName}`;

      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (!fileInfo.exists) {
        await FileSystem.copyAsync({
          from: file.uri,
          to: localUri,
        });
      }
      setDocuments((prev) => ({ ...prev, [fieldName]: localUri }));
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error("DocumentPicker Error: ", err);
      }
    }
    setIsLoading(false);
  };

  const renderDocumentField = (fieldName, label, required = false) => {
    const doc = documents[fieldName];
    const isImage = doc?.match(/\.(jpg|jpeg|png)$/i);
    const isPdf = doc?.match(/\.pdf$/i);

    return (
      <View style={styles.documentField}>
        <Text style={styles.documentLabel}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>

        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => pickDocument(fieldName)}
          activeOpacity={0.8}
        >
          <Text style={styles.selectButtonText}>
            {doc ? "Change File" : "Upload File"}
          </Text>
        </TouchableOpacity>

        {doc && (
          <View style={styles.previewBox}>
            {isImage && (
              <Image
                source={{ uri: doc }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
            )}
            {isPdf && (
              <TouchableOpacity onPress={() => Linking.openURL(doc)}>
                <Text style={styles.pdfLink}>View PDF</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const handleSubmit = async () => {
    if (!documents.idCardFront || !documents.idCardBack) {
      Alert.alert(
        "Validation Error",
        "Please upload ID Card Front and ID Card Back."
      );
      return;
    }

    setIsLoading(true);

    const db = await getDatabase();

    try {
      await db.execAsync("BEGIN TRANSACTION");

      await db.runAsync("DELETE FROM documents");

      await db.runAsync(
        `INSERT INTO documents (
        address_proof,
        driving_license,
        education,
        id_card_back,
        id_card_front,
        noc,
        other,
        passport
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          documents.addressProof || null,
          documents.drivingLicense || null,
          documents.education || null,
          documents.idCardBack || null,
          documents.idCardFront || null,
          documents.noc || null,
          documents.other || null,
          documents.passport || null,
        ]
      );

      await db.execAsync("COMMIT");

      setFormData((prev) => ({
        ...prev,
        addressProof: documents.addressProof || null,
        noc: documents.noc || null,
        idCardFront: documents.idCardFront || null,
        idCardBack: documents.idCardBack || null,
        passport: documents.passport || null,
        drivingLicense: documents.drivingLicense || null,
        education: documents.education || null,
        other: documents.other || null,
      }));

      setSubmitting(true);
    } catch (error) {
      await db.execAsync("ROLLBACK");
      console.error("[DOCUMENTS ERROR] Failed to save:", error);
      Alert.alert("Error", "Failed to save documents.");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Splash />;
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Document Upload</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.innerContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.note}>
            * Required fields must be uploaded to complete your registration.
          </Text>
          {renderDocumentField("idCardFront", "ID Card Front Side", true)}
          {renderDocumentField("idCardBack", "ID Card Back Side", true)}
          {renderDocumentField("passport", "Passport")}
          {renderDocumentField("addressProof", "Address Proof")}
          {renderDocumentField("noc", "NOC (No Objection Certificate)")}
          {renderDocumentField("drivingLicense", "Driving License")}
          {renderDocumentField("education", "Education Certificate")}
          {renderDocumentField("other", "Other Documents")}
        </ScrollView>

        <StepNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          onBack={onBack}
          onPrevious={onPrevious}
          onSubmit={handleSubmit}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create(Profile);

export default Documents;
