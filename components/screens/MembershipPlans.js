import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { BaseUrl, getPlansUrl } from "../config/Api";
import Splash from "./Splash";
import { useNavigation } from "@react-navigation/native";

const MembershipPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get(`${getPlansUrl}`);
        setPlans(response.data.plans);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSubscribe = (planId, amount) => {
    navigation.navigate("DepositModal", { planId, amount });
  };

  if (loading) {
    return <Splash />;
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={plans}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.planName}>{item.plan_name}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.planDetails}>
                💰 AED{item.membership_fee}
              </Text>
              <Text style={styles.planDetails}>⏳ {item.expire} days</Text>
            </View>
            <View style={styles.cardFooter}>
              <TouchableOpacity
                style={styles.subscribeButton}
                onPress={() => handleSubscribe(item.id,item.membership_fee)}
              >
                <Text style={styles.subscribeButtonText}>Subscribe</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#e4fbfb",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2c3e50",
  },
  planType: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 4,
  },
  cardBody: {
    marginBottom: 16,
  },
  planDetails: {
    fontSize: 16,
    color: "#34495e",
    marginBottom: 8,
  },
  cardFooter: {
    alignItems: "center",
  },
  subscribeButton: {
    backgroundColor: "#3498db",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
  },
  subscribeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "#e74c3c",
    fontSize: 16,
  },
});

export default MembershipPlans;
