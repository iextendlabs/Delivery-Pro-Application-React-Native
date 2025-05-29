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
    if (
      !documents.idCardFront ||
      !documents.idCardBack ||
      !documents.passport
    ) {
      Alert.alert(
        "Validation Error",
        "Please upload ID Card Front, ID Card Back, and Passport."
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
      <View style={styles.container}>
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
          {renderDocumentField("passport", "Passport", true)}
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

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  container: {
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
  contentContainer: {
    flex: 1,
  },
  innerContent: {
    paddingVertical: 20,
    justifyContent: "center",
  },
  required: {
    color: "red",
  },
  note: {
    fontSize: 14,
    color: "#666",
    marginTop: 20,
    fontStyle: "italic",
    textAlign: "center",
  },
  documentField: {
    marginBottom: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  documentLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "600",
    color: "#333",
  },
  selectButton: {
    backgroundColor: "#0d6efd",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  selectButtonText: {
    color: "#fff",
  },
  previewBox: {
    marginTop: 12,
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    backgroundColor: "#d9d9d9",
    minHeight: 110,
    justifyContent: "center",
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  pdfLink: {
    fontSize: 16,
    color: "#007bff",
    textDecorationLine: "underline",
  },
});

export default Documents;
