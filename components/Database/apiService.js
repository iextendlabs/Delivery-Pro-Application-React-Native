// apiService.js
import axios from "axios";
import {
  saveAllCategories,
  saveAllGroupData,
  saveAllServices,
  saveAllSubTitle,
  saveProfile,
  shouldFetchToday,
} from "./servicesRepository";
import { BaseUrl, getStaffProfileUrl } from "../config/Api";

const fetchServices = async () => {
  console.log("[API] Fetching services from server...");
  try {
    const shouldFetch = await shouldFetchToday();

    if (!shouldFetch) {
      console.log("Skipping fetch - already fetched today");
      return null;
    }
    const response = await axios.get(BaseUrl + "AppServicesData.json", {
      timeout: 10000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log(
      `[API] Successfully fetched ${
        response.data.services?.length || 0
      } services`
    );

    services = response.data.services.map((service) => ({
      id: service.id,
      name: service.name,
    }));

    await saveAllServices(services);

    return services;
  } catch (error) {
    console.error("[API ERROR] Failed to fetch services:", error);
    throw error;
  }
};

const fetchCategories = async () => {
  console.log("[API] Fetching categories from server...");
  try {
    const shouldFetch = await shouldFetchToday();

    if (!shouldFetch) {
      console.log("Skipping fetch - already fetched today");
      return null;
    }
    const response = await axios.get(BaseUrl + "AppCategories.json", {
      timeout: 10000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log(
      `[API] Successfully fetched ${
        response.data.categories?.length || 0
      } categories`
    );
    await saveAllCategories(response.data.categories);

    return response.data.categories;
  } catch (error) {
    console.error("[API ERROR] Failed to fetch categories:", error);
    throw error;
  }
};

const fetchSubTitles = async () => {
  console.log("[API] Fetching subtitles from server...");
  try {
    const shouldFetch = await shouldFetchToday();

    if (!shouldFetch) {
      console.log("Skipping fetch - already fetched today");
      return null;
    }
    const response = await axios.get(BaseUrl + "AppSubTitles.json", {
      timeout: 10000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log(
      `[API] Successfully fetched ${
        response.data.subTitles?.length || 0
      } subtitles`
    );
    await saveAllSubTitle(response.data.subTitles);

    return response.data.subTitles;
  } catch (error) {
    console.error("[API ERROR] Failed to fetch subtitles:", error);
    throw error;
  }
};

const fetchGroupZone = async () => {
  console.log("[API] Fetching groupData from server...");
  try {
    const shouldFetch = await shouldFetchToday();

    if (!shouldFetch) {
      console.log("Skipping fetch - already fetched today");
      return null;
    }
    const response = await axios.get(BaseUrl + "AppGroupData.json", {
      timeout: 10000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log(
      `[API] Successfully fetched ${
        response.data.groupData?.length || 0
      } groupData`
    );

    groupData = response.data.groupData.map((group) => ({
      group_id: group.id,
      group_name: group.group_name,
      zone_name: group.zone.join(", "),
    }));

    await saveAllGroupData(groupData);

    return groupData;
  } catch (error) {
    console.error("[API ERROR] Failed to fetch groupData:", error);
    throw error;
  }
};

const fetchProfile = async (userId) => {
  console.log("[API] Fetching Profile from server...");
  try {
    const response = await axios.get(getStaffProfileUrl + "user_id=" + userId, {
      timeout: 10000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log(`[API] Successfully fetched Profile`);

    await saveProfile(response.data);

    return {
      success: true,
      message: "Saved Profile successfully",
    };
  } catch (error) {
    console.error("[API ERROR] Failed to fetch profile:", error);
    return {
      success: false,
      message: "Saved Profile successfully",
    };
    throw error;
  }
};

export {
  fetchServices,
  fetchSubTitles,
  fetchCategories,
  fetchProfile,
  fetchGroupZone,
};
