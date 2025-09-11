// zoneData.js
import { fetchZone } from "./apiService";
import { getDatabase } from "./database";

export const loadAndRefreshZoneData = async () => {
  console.log("[DATA] Starting data load and refresh...");
  try {
    const fetchZoneData = await fetchZone();

    if (fetchZoneData) {
      console.log("[DATA] Successfully loaded fresh Zone data");
      return {
        success: true,
        data: fetchZoneData,
        message: "Data refreshed successfully",
      };
    } else {
      console.log("[DATA] No fresh data available, loading local data");
      const localData = await loadLocalZoneData();
      return {
        success: true,
        data: localData,
        message: "Using cached data",
      };
    }
  } catch (error) {
    console.error("[DATA ERROR] Failed to load and refresh data:", error);
    return {
      success: false,
      error: error.message,
      data: null,
    };
  }
};

export const loadLocalZoneData = async () => {
  console.log("[DATA] Loading local Zone data...");
  try {
    const db = await getDatabase();
    const result = await db.getAllAsync(`SELECT * FROM zone_data ORDER BY id`);

    console.log(`[Zone] Found ${result.length} Zone records`);
    return result.map((row) => ({
      zone_id: row.zone_id,
      zone_name: row.zone_name,
      country: row.country,
    }));
  } catch (error) {
    console.error("[Zone ERROR] Failed to load local Zone:", error);
    return [];
  }
};
