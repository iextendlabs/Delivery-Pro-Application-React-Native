// apiService.js
import axios from "axios";
import {
  saveAllCategories,
  saveAllZoneData,
  saveAllServices,
  saveAllSubTitle,
  saveProfile,
  setLastFetchDate,
  shouldFetchToday,
  saveTimeSlot,
  saveDrivers,
} from "./servicesRepository";
import { BaseUrl, getStaffProfileUrl } from "../config/Api";

const fetchServices = async () => {
  console.log("[API] Fetching services from server...");
  try {
    const shouldFetch = await shouldFetchToday("services");

    if (!shouldFetch) {
      console.log("Skipping fetch - already fetched today");
      return null;
    }
    const response = await axios.get(BaseUrl + "storage/StaffAppServicesData.json", {
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

    const services = response.data.services.map((service) => ({
      id: service.id,
      name: service.name,
      category_ids: service.category_id || [],
    }));
    await saveAllServices(services);
    await setLastFetchDate("services");

    return services;
  } catch (error) {
    console.error("[API ERROR] Failed to fetch services:", error);
    throw error;
  }
};

const fetchCategories = async () => {
  console.log("[API] Fetching categories from server...");
  try {
    const shouldFetch = await shouldFetchToday("categories");

    if (!shouldFetch) {
      console.log("Skipping fetch - already fetched today");
      return null;
    }
    const response = await axios.get(BaseUrl + "storage/AppCategories.json", {
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
    await setLastFetchDate("categories");

    return response.data.categories;
  } catch (error) {
    console.error("[API ERROR] Failed to fetch categories:", error);
    throw error;
  }
};

const fetchSubTitles = async () => {
  console.log("[API] Fetching subtitles from server...");
  try {
    const shouldFetch = await shouldFetchToday("subtitles");

    if (!shouldFetch) {
      console.log("Skipping fetch - already fetched today");
      return null;
    }
    const response = await axios.get(BaseUrl + "storage/AppSubTitles.json", {
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
    await setLastFetchDate("subtitles");

    return response.data.subTitles;
  } catch (error) {
    console.error("[API ERROR] Failed to fetch subtitles:", error);
    throw error;
  }
};

const fetchZone = async () => {
  console.log("[API] Fetching zoneData from server...");
  try {
    const shouldFetch = await shouldFetchToday("zones");

    if (!shouldFetch) {
      console.log("Skipping fetch - already fetched today");
      return null;
    }
    const response = await axios.get(BaseUrl + "storage/AppZoneData.json", {
      timeout: 10000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log(
      `[API] Successfully fetched ${
        response.data.zoneData?.length || 0
      } zoneData`
    );

    const zoneData = response.data.zoneData.map((zone) => ({
      zone_id: zone.id,
      zone_name: zone.name,
    }));

    await saveAllZoneData(zoneData);
    await setLastFetchDate("zones");

    return zoneData;
  } catch (error) {
    console.error("[API ERROR] Failed to fetch zoneData:", error);
    throw error;
  }
};

const fetchTimeSlot = async () => {
  console.log("[API] Fetching timeSlots from server...");
  try {
    const shouldFetch = await shouldFetchToday("timeSlots");

    if (!shouldFetch) {
      console.log("Skipping fetch - already fetched today");
      return null;
    }
    const response = await axios.get(BaseUrl + "storage/AppTimeSlotsData.json", {
      timeout: 10000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log(
      `[API] Successfully fetched ${
        response.data.timeSlots?.length || 0
      } timeSlots`
    );

    await saveTimeSlot(response.data.timeSlots);
    await setLastFetchDate("timeSlots");

    return response.data.timeSlots;
  } catch (error) {
    console.error("[API ERROR] Failed to fetch timeSlots:", error);
    throw error;
  }
};

const fetchDriver = async () => {
  console.log("[API] Fetching drivers from server...");
  try {
    const shouldFetch = await shouldFetchToday("drivers");

    if (!shouldFetch) {
      console.log("Skipping fetch - already fetched today");
      return null;
    }
    const response = await axios.get(BaseUrl + "storage/AppDriverData.json", {
      timeout: 10000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log(
      `[API] Successfully fetched ${response.data.drivers?.length || 0} drivers`
    );

    await saveDrivers(response.data.drivers);
    await setLastFetchDate("drivers");

    return response.data.drivers;
  } catch (error) {
    console.error("[API ERROR] Failed to fetch drivers:", error);
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
  fetchZone,
  fetchTimeSlot,
  fetchDriver,
};
