import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Modal,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { IndexUrl, onlineOfflineUrl } from "../config/Api";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import Splash from "./Splash";
import CommonButton from "../common/CommonButton";
import HomeStyle from "../styles/HomeStyle";
import ProfileCard from "./components/ProfileCard";
import HomeMenu from "./components/HomeMenu";
import VersionCheck from "react-native-version-check";
import UpdateModal from "../common/UpdateModal";
import Constants from "expo-constants";
import { loadAndRefreshData } from "../Database/dataService";
import { loadAndRefreshCategoryData } from "../Database/dataCategories";
import { loadAndRefreshSubTitleData } from "../Database/dataSubTitles";
import { loadAndRefreshZoneData } from "../Database/zoneData";
import { loadAndRefreshTimeSlotData } from "../Database/dataTimeSlot";
import { loadAndRefreshDriverData } from "../Database/dataDriver";
import { useRoute } from "@react-navigation/native";

const Home = ({ navigation }) => {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isToggled, setIsToggled] = useState(false);
  const [supervisors, setSupervisors] = useState([]);
  const [user, setUser] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [planExpire, setPlanExpire] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [isUpdate, setIsUpdate] = useState(true);
  const [version, setVersion] = useState("");
  const [profileStatus, setProfileStatus] = useState("");
  const route = useRoute();
  const [showSuccess, setShowSuccess] = useState(false);
  const [dataSaving, setDataSaving] = useState(false);

  useEffect(() => {
    if (route.params?.success) {
      setShowSuccess(true);

      navigation.setParams({ success: false });

      setTimeout(() => {
        setShowSuccess(false);
      }, 10000);
    }
  }, [route.params?.success]);

  const initializeApp = async () => {
    setDataSaving(true);
    try {
      await AsyncStorage.setItem("@loading", "1");
      console.log("[INIT] Step 4: Loading services data...");
      const serviceResult = await loadAndRefreshData();
      if (!serviceResult.success) {
        throw new Error("Failed to load services data");
      }
      console.log("[INIT] Services load succeeded");

      console.log("[INIT] Step 5: Loading categories data...");
      const categoryResult = await loadAndRefreshCategoryData();
      if (!categoryResult.success) {
        throw new Error("Failed to load categories data");
      }
      console.log("[INIT] Categories load succeeded");

      console.log("[INIT] Step 6: Loading subtitles data...");
      const subTitleResult = await loadAndRefreshSubTitleData();
      if (!subTitleResult.success) {
        throw new Error("Failed to load subtitles data");
      }
      console.log("[INIT] Subtitles load succeeded");

      console.log("[INIT] Step 4: Loading zone data...");
      const zoneResult = await loadAndRefreshZoneData();
      if (!zoneResult.success) {
        throw new Error("Failed to load zone data");
      }
      console.log("[INIT] zone load succeeded");

      console.log("[INIT] Step 4: Loading TimeSlot data...");
      const timeSlotsResult = await loadAndRefreshTimeSlotData();
      if (!timeSlotsResult.success) {
        throw new Error("Failed to load TimeSlot data");
      }
      console.log("[INIT] TimeSlot load succeeded");

      console.log("[INIT] Step 4: Loading Driver data...");
      const driversResult = await loadAndRefreshDriverData();
      if (!driversResult.success) {
        throw new Error("Failed to load Driver data");
      }
      console.log("[INIT] Driver load succeeded");
      await AsyncStorage.setItem("@loading", "0");
    } catch (error) {
      await AsyncStorage.setItem("@loading", "0");
      console.error("[INIT ERROR] Initialization failed:", error);
      throw error; // Re-throw to allow calling code to handle
    }
    setDataSaving(false);
  };

  // // Usage in component
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize the app
        await initializeApp();
      } catch (error) {
        console.error("Initialization failed:", error);
        // Optionally show error to user or retry
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    fetchData();
    checkForUpdate();
  }, []);

  useEffect(() => {
    profile();
  }, []);

  const profile = async () => {
    if ((await AsyncStorage.getItem("@profileComplete")) == "true") {
      setProfileStatus("Complete");
    } else if ((await AsyncStorage.getItem("@signup_step")) >= 1) {
      setProfileStatus("Inprogress");
    }
  };

  const checkForUpdate = async () => {
    try {
      const latestVersion = await VersionCheck.getLatestVersion({
        provider: "playStore",
        packageName: "com.forexleo.lipslaystaff",
      });

      const currentVersion = Constants.expoConfig.version;
      setVersion(currentVersion);
      if (latestVersion !== currentVersion) {
        setUpdateModalVisible(true);
        setIsUpdate(true);
      } else {
        setIsUpdate(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchData = async () => {
    const userId = await AsyncStorage.getItem("@user_id");
    if (userId) {
      try {
        const response = await axios.get(`${IndexUrl}user_id=${userId}`);
        if (response.status == 202) {
          setUserMessage(
            "✅ Account Successfully Created – Under Review\n\n" +
              "Thank you for signing up! Your profile is currently being reviewed by our team. " +
              "If all details are correct, we’ll approve it shortly.\n\n" +
              "💡 Complete your profile now to help speed up the approval process.\n\n" +
              "You’ll receive a notification as soon as your account is approved."
          );
          setUser(true);
        } else if (response.status == 203) {
          setUserMessage(
            "Your membership plan has expired. Upgrade your plan to continue enjoying our services."
          );
          setUser(true);
          setPlanExpire(true);
        } else if (response.status == 201) {
          handleLogout();
        } else {
          setUser(false);
          setUserMessage("");
          setPlanExpire(false);
          setUserData(response.data);
          if (response.data.whatsapp_number) {
            await AsyncStorage.setItem(
              "@whatsapp",
              response.data.whatsapp_number
            );
          }
          setSupervisors(response.data.supervisors);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    } else {
      navigation.navigate("Login");
    }
  };

  const handleLogout = async () => {
    try {
      // Remove the user_id from AsyncStorage
      await AsyncStorage.removeItem("@user_id");
      await AsyncStorage.removeItem("@access_token");
      await AsyncStorage.removeItem("@notifications");
      await AsyncStorage.removeItem("@signup_step");
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.log("Error occurred during logout:", error);
    }
  };

  const handleToggle = async () => {
    setLoading(true);

    const newToggleState = !isToggled;
    setIsToggled(newToggleState);

    try {
      const userId = await AsyncStorage.getItem("@user_id");
      if (userId) {
        const response = await axios.post(`${onlineOfflineUrl}`, {
          user_id: userId,
          online: newToggleState ? 1 : 0,
        });

        if (response.status === 200) {
          fetchData();
          setUserData((prev) => ({ ...prev, online: newToggleState }));
        } else if (response.status === 201) {
          setError("User not found.");
          navigation.navigate("Login");
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    const loading = await AsyncStorage.getItem("@loading");
    if (loading === "1") {
      alert("Please wait, data is being loaded. Try again in a few minutes.");
    } else {
      navigation.navigate("UpdateProfile");
    }
  };

  if (loading) {
    return <Splash />;
  }
  const renderMainContent = () => {
    if (user) {
      return (
        <View style={styles.container}>
          <Header title="Home" />
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={fetchData} />
            }
          >
            {showSuccess && (
              <Text
                style={{
                  color: "green",
                  backgroundColor: "#e8f5e9",
                  padding: 10,
                  borderRadius: 5,
                  marginVertical: 10,
                  textAlign: "center",
                  fontWeight: "500",
                }}
              >
                Profile updated successfully!
              </Text>
            )}
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                padding: 20,
                marginHorizontal: 20,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 16,
                  color: "#333",
                  marginBottom: 20,
                }}
              >
                {userMessage}
              </Text>

              <CommonButton
                title={
                  profileStatus === "Complete"
                    ? "Edit Profile"
                    : profileStatus === "Inprogress"
                    ? "Continue Completing Profile..."
                    : "Start Profile Completion"
                }
                bgColor="#4CAF50"
                textColor="#fff"
                onPress={handleEdit}
              />

              <CommonButton
                title="Logout"
                bgColor="#000"
                textColor="#fff"
                onPress={handleLogout}
                style={{ marginTop: 10 }}
              />

              {planExpire && (
                <CommonButton
                  title="Upgrade your plan"
                  bgColor="#fd245f"
                  textColor="#fff"
                  onPress={() => navigation.navigate("MembershipPlans")}
                  style={{ marginTop: 10 }}
                />
              )}
            </View>
          </ScrollView>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Header title="Home" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchData} />
          }
        >
          {showSuccess && (
            <Text
              style={{
                color: "green",
                backgroundColor: "#e8f5e9",
                padding: 10,
                borderRadius: 5,
                marginVertical: 10,
                textAlign: "center",
                fontWeight: "500",
              }}
            >
              Profile updated successfully!
            </Text>
          )}
          <ProfileCard
            userData={userData}
            handleToggle={handleToggle}
            handleLogout={handleLogout}
            handleEdit={handleEdit}
            supervisors={supervisors}
            version={version}
          />

          <HomeMenu navigation={navigation} />

          <View style={styles.financialSummaryContainer}>
            <Text style={styles.financialSummaryTitle}>Financial Summary</Text>
            <View style={styles.financialSummary}>
              <View style={styles.summaryItem}>
                <View style={styles.financialCard}>
                  <Text style={styles.summaryLabel}>Balance</Text>
                  <Text style={styles.summaryValue}>
                    AED {userData.total_balance}
                  </Text>
                </View>
              </View>
              <View style={styles.summaryItem}>
                <View
                  style={[
                    styles.financialCard,
                    {
                      borderLeftWidth: 1,
                      borderRightWidth: 1,
                      borderColor: "#ddd",
                    },
                  ]}
                >
                  <Text style={styles.summaryLabel}>
                    {userData.current_month} Product Sales
                  </Text>
                  <Text style={styles.summaryValue}>
                    AED {userData.product_sales}
                  </Text>
                </View>
              </View>
              <View style={styles.summaryItem}>
                <View style={styles.financialCard}>
                  <Text style={styles.summaryLabel}>
                    {userData.current_month} Bonus
                  </Text>
                  <Text style={styles.summaryValue}>AED {userData.bonus}</Text>
                </View>
              </View>
            </View>
          </View>
          {/* Membership Plan (Separated from Profile Card) */}
          {userData.staff_membership_plan && (
            <View style={styles.membershipPlan}>
              <Text style={styles.sectionTitle}>Membership Plan</Text>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Plan Name:</Text>
                <Text style={styles.infoText}>
                  {userData.staff_membership_plan.plan_name}
                </Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Fee:</Text>
                <Text style={styles.infoText}>
                  AED {userData.staff_membership_plan.membership_fee}
                </Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Expire After:</Text>
                <Text style={styles.infoText}>{userData.expiry_date}</Text>
              </View>
            </View>
          )}
          <View style={{ marginBottom: 70 }}>
            <CommonButton
              title={"Apply Short Holiday"}
              bgColor={"#fd245f"}
              textColor={"#fff"}
              onPress={() => navigation.navigate("HolidayModal")}
            />
          </View>
        </ScrollView>
        <UpdateModal
          visible={updateModalVisible}
          setUpdateModalVisible={setUpdateModalVisible}
          setIsUpdate={setIsUpdate}
        />
        <Footer />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Main content */}
      {renderMainContent()}

      {/* Data saving overlay */}
      <Modal
        transparent={true}
        visible={dataSaving}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.overlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>
              Please wait, data is being loaded.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  ...HomeStyle,
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Darker semi-transparent background
  },
  loadingContainer: {
    backgroundColor: "transparent", // Make container transparent
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "80%", // Take up most of screen width
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#ffffff", // White text
    textAlign: "center",
  },
});

export default Home;
