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

const Home = ({ navigation }) => {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isToggled, setIsToggled] = useState(false);
  const [supervisors, setSupervisors] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const userId = await AsyncStorage.getItem("@user_id");
    if (userId) {
      try {
        const response = await axios.get(`${IndexUrl}user_id=${userId}`);
        if (response.status == 201) {
          handleLogout();
        } else {
          setUserData(response.data);
          setSupervisors(response.data.supervisors);
          console.log(response.data.supervisors);
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
    navigation.navigate("EditProfile");
  };

  if (loading) {
    return <Splash />;
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
        {/* User Profile Card */}
        <View style={styles.card}>
          {/* Profile Image */}
          <Image
            source={
              userData.image
                ? { uri: BaseUrl + "staff-images/" + userData.image }
                : require("../images/user.png")
            }
            style={styles.userImage}
          />

          <TouchableOpacity onPress={handleToggle} style={styles.toggleIcon}>
            <Image
              source={
                userData.online == 1
                  ? require("../images/on.png") // Add your on image
                  : require("../images/off.png") // Add your toggle-off image
              }
              style={{
                width: 40,
                height: 40,
              }}
            />
          </TouchableOpacity>
          {/* Logout Icon */}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
            <Image
              source={require("../images/logout.png")} // Your icon image here
              style={{
                width: 24,
                height: 24,
                tintColor: "#333", // Adjust color as per requirement
              }}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleEdit} style={styles.editIcon}>
            <Image
              source={require("../images/edit.png")} // Your icon image here
              style={{
                width: 24,
                height: 24,
                tintColor: "#333", // Adjust color as per requirement
              }}
            />
          </TouchableOpacity>

          {/* User Details */}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userSubtitle}>
              {userData.sub_title ?? "N/A"}
            </Text>
            <Text style={styles.userLocation}>
              📍 {userData.location ?? "N/A"}
            </Text>

            {/* User Data */}
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoText}>{userData.email}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Number:</Text>
              <Text style={styles.infoText}>{userData.number}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Commission:</Text>
              <Text style={styles.infoText}>{userData.commission}%</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Fix Salary:</Text>
              <Text style={styles.infoText}>
                {userData.fix_salary ? `AED ${userData.fix_salary}` : "N/A"}
              </Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Extra Charges:</Text>
              <Text style={styles.infoText}>
                {userData.charge ? `AED ${userData.charge}` : "N/A"}
              </Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Nationality:</Text>
              <Text style={styles.infoText}>
                {userData.nationality ?? "N/A"}
              </Text>
            </View>
            {/* Supervisors Section */}
            {supervisors.length > 0 && (
              <View style={styles.supervisorSection}>
                <Text style={styles.supervisorHeading}>Supervisors</Text>
                {supervisors.map((supervisor, index) => (
                  <View key={index} style={styles.supervisorBox}>
                    <Text style={styles.infoText}>{supervisor.name}</Text>
                    <Text style={styles.infoText}>{supervisor.email}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Round Icons Section */}
        <View style={styles.menuContainer}>
          <View style={styles.menuItem}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("OrderList");
              }}
            >
              <View style={styles.menu}>
                <Image
                  source={require("../images/order.png")}
                  style={styles.iconImage}
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.iconLabel}>Today's Orders</Text>
          </View>

          <View style={styles.menuItem}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Transactions");
              }}
            >
              <View style={[styles.menu, { backgroundColor: "#a0c7ff" }]}>
                <Image
                  source={require("../images/transaction.png")}
                  style={styles.iconImage}
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.iconLabel}>Transactions</Text>
          </View>

          <View style={styles.menuItem}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Withdraws");
              }}
            >
              <View style={styles.menu}>
                <Image
                  source={require("../images/withdraw.png")}
                  style={styles.iconImage}
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.iconLabel}>Withdraws</Text>
          </View>
          <View style={styles.menuItem}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Holidays");
              }}
            >
              <View style={[styles.menu, { backgroundColor: "#a0c7ff" }]}>
                <Image
                  source={require("../images/holidays.png")}
                  style={styles.iconImage}
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.iconLabel}>Holidays</Text>
          </View>
        </View>

        {/* Financial Summary */}
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
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e4fbfb",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginLeft: 15,
    marginRight: 15,
  },
  userImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#62b6cb",
    marginBottom: 10,
  },
  logoutIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  editIcon: {
    position: "absolute",
    top: 10,
    right: 50, // Adjust the distance to position the Edit button next to the Logout button
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  toggleIcon: {
    position: "absolute",
    top: 50,
    right: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  supervisorSection: {
    marginTop: 20,
  },
  supervisorHeading: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  supervisorBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 8,
  },
  userInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  userSubtitle: {
    fontSize: 16,
    color: "#555",
    fontStyle: "italic",
    marginBottom: 5,
  },
  userLocation: {
    fontSize: 14,
    color: "#1e6091",
    fontWeight: "600",
    marginBottom: 10,
  },
  infoBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  infoText: {
    fontSize: 14,
    color: "#333",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    backgroundColor: "#a0c7ff",
    paddingVertical: 10,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  membershipPlan: {
    marginLeft: 15,
    marginRight: 15,
  },
  financialSummaryContainer: {
    marginTop: 20,
    marginLeft: 15,
    marginRight: 15,
  },
  financialSummaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    backgroundColor: "#a0c7ff",
    paddingVertical: 10,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  financialSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 2,
  },
  financialCard: {
    padding: 20,
    height: 130,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
  },

  menuContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  menuItem: {
    alignItems: "center",
    flex: 1,
  },
  menu: {
    width: 60,
    height: 60,
    borderRadius: 45,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  iconImage: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  iconLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
});

export default Home;
