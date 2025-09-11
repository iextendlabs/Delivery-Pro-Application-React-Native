import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BalanceUpdateURL, IndexUrl, onlineOfflineUrl } from "../config/Api";
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
import { useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

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
  const [totalBalance, setTotalBalance] = useState(0);
  const [rubydubiBalance, setRubydubiBalance] = useState(0);
  const [fetchingBalance, setFetchingBalance] = useState(false);

  useEffect(() => {
    if (route.params?.success) {
      setShowSuccess(true);

      navigation.setParams({ success: false });

      setTimeout(() => {
        setShowSuccess(false);
      }, 10000);
    }
  }, [route.params?.success]);

  useEffect(() => {
    fetchData();
    checkForUpdate();
  }, []);

  useEffect(() => {
    profile();
  }, []);

  useEffect(() => {
    const loadBalance = async () => {
      const storedTotal = await AsyncStorage.getItem("@total_balance");
      setTotalBalance(storedTotal ? Number(storedTotal) : 0);
    };
    loadBalance();
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
        if (response.data.whatsapp_number) {
          await AsyncStorage.setItem(
            "@whatsapp",
            response.data.whatsapp_number
          );
        }
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
      await AsyncStorage.removeItem("@profileComplete");
      await AsyncStorage.removeItem("@videoAgreement");
      await AsyncStorage.removeItem("@subCategory");
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

  const handleFetchRubydubiBalance = async () => {
    setFetchingBalance(true);
    try {
      const email = userData.email || (await AsyncStorage.getItem("@email"));
      const userId = userData.id || (await AsyncStorage.getItem("@user_id"));
      const rubydubiRes = await axios.get(
        `https://rubydubi.com/api/get_wallet?email=${email}`
      );
      const coins = rubydubiRes.data.coins || 0;
      setRubydubiBalance(coins);
      // 2. Update wallet on Lipslay
      const lipslayRes = await axios.post(`${BalanceUpdateURL}`, {
        user_id: userId,
        balance: coins,
      });
      const total = lipslayRes.data.balance || 0;
      setTotalBalance(total);

      // 3. Store total in AsyncStorage
      await AsyncStorage.setItem("@total_balance", String(total));
    } catch (err) {
      alert("Failed to fetch balance. Please try again.");
    } finally {
      setFetchingBalance(false);
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
                onPress={() => {
                  navigation.navigate("UpdateProfile");
                }}
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
            handleEdit={() => {
              navigation.navigate("UpdateProfile");
            }}
            supervisors={supervisors}
            version={version}
          />

          <View style={{ marginBottom: 20 }}>
            <CommonButton
              title={"Change Password"}
              bgColor={"#fd245f"}
              textColor={"#fff"}
              onPress={() => navigation.navigate("ChangePassword")}
            />
          </View>

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
          <View style={styles.financialSummaryContainer}>
            <Text style={styles.financialSummaryTitle}>RubyDubi Wallet Summary</Text>
            <View style={styles.financialSummary}>
              <View style={styles.summaryItem}>
                <View style={styles.financialCard}>
                  <Text style={styles.summaryLabel}>Total Balance</Text>
                  <Text style={styles.summaryValue}>{totalBalance} coins</Text>
                </View>
              </View>
              <View style={styles.summaryItem}>
                <View style={styles.financialCard}>
                  <Text style={styles.summaryLabel}>Rubydubi Balance</Text>
                  <Text style={styles.summaryValue}>{rubydubiBalance} coins</Text>
                  <TouchableOpacity
                    style={{
                      marginTop: 8,
                      backgroundColor: "#fd245f",
                      padding: 8,
                      borderRadius: 5,
                      alignItems: "center",
                      flexDirection: "row",
                      justifyContent: "center",
                    }}
                    onPress={handleFetchRubydubiBalance}
                    disabled={fetchingBalance}
                  >
                    {fetchingBalance ? (
                      <>
                        <ActivityIndicator size="small" color="#fff" />
                      </>
                    ) : (
                      <>
                        <Icon name="reload" size={20} color="#fff"/>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
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
    </View>
  );
};

const styles = StyleSheet.create(HomeStyle);

export default Home;
