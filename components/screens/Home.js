import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BaseUrl, IndexUrl, onlineOfflineUrl } from "../config/Api";
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

  useEffect(() => {
    fetchData();
    checkForUpdate();
  }, []);

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
            "Your account has been created successfully and is currently under review. The admin will review your profile and approve your request. You will receive a notification once it's approved. In the meantime, please complete your profile to help speed up the approval process."
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
    navigation.navigate("UpdateProfile");
  };

  if (loading) {
    return <Splash />;
  }

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
              title="Complete Your Profile"
              bgColor="#4CAF50"
              textColor="#fff"
              onPress={() => navigation.navigate("UpdateProfile")}
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

const styles = StyleSheet.create(HomeStyle);

export default Home;
