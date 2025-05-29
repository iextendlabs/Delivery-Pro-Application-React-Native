// groupData.js
import { fetchGroupZone } from "./apiService";
import { getDatabase } from "./database";

export const loadAndRefreshGroupZoneData = async () => {
  console.log("[DATA] Starting data load and refresh...");
  try {
    const fetchGroupZoneData = await fetchGroupZone();

    if (fetchGroupZoneData) {
      console.log("[DATA] Successfully loaded fresh groupZone data");
      return {
        success: true,
        data: fetchGroupZoneData,
        message: "Data refreshed successfully",
      };
    } else {
      console.log("[DATA] No fresh data available, loading local data");
      const localData = await loadLocalGroupZoneData();
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

export const loadLocalGroupZoneData = async () => {
  console.log("[DATA] Loading local groupZone data...");
  try {
    const db = await getDatabase();
    const result = await db.getAllAsync(
      `SELECT * FROM group_zone_data ORDER BY id`
    );

    console.log(`[GroupZone] Found ${result.length} groupZone records`);
    return result.map((row) => ({
      group_id: row.group_id,
      group_name: row.group_name,
      zone_name: row.zone_name,
    }));
  } catch (error) {
    console.error("[GroupZone ERROR] Failed to load local groupZone:", error);
    return [];
  }
};
