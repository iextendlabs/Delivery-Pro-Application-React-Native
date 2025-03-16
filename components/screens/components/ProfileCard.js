import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import HomeStyle from "../../styles/HomeStyle";
import { BaseUrl } from "../../config/Api";

const ProfileCard = ({
  userData,
  handleToggle,
  handleLogout,
  handleEdit,
  supervisors,
}) => {
  return (
    <View style={styles.card}>
      <Image
        source={
          userData.image
            ? { uri: BaseUrl + "staff-images/" + userData.image }
            : require("../../images/user.png")
        }
        style={styles.userImage}
      />

      <TouchableOpacity onPress={handleToggle} style={styles.toggleIcon}>
        <Image
          source={
            userData.online == 1
              ? require("../../images/on.png")
              : require("../../images/off.png")
          }
          style={{
            width: 40,
            height: 40,
          }}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
        <Image
          source={require("../../images/logout.png")}
          style={{
            width: 24,
            height: 24,
            tintColor: "#333",
          }}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleEdit} style={styles.editIcon}>
        <Image
          source={require("../../images/edit.png")}
          style={{
            width: 24,
            height: 24,
            tintColor: "#333",
          }}
        />
      </TouchableOpacity>

      <View style={styles.userInfo}>
        <Text style={styles.userName}>{userData.name}</Text>
        <Text style={styles.userSubtitle}>{userData.sub_title ?? "N/A"}</Text>
        <Text style={styles.userLocation}>📍 {userData.location ?? "N/A"}</Text>

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
          <Text style={styles.infoText}>{userData.nationality ?? "N/A"}</Text>
        </View>

        {supervisors && supervisors.length > 0 && (
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
  );
};

const styles = StyleSheet.create(HomeStyle);

export default ProfileCard;
