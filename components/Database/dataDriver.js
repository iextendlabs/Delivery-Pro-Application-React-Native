// dataDriver.js
import { fetchDriver } from "./apiService";
import { getDatabase } from "./database";

export const loadAndRefreshDriverData = async () => {
  console.log("[DATA] Starting data load and refresh...");
  try {
    const freshDriver = await fetchDriver();

    if (freshDriver) {
      console.log("[DATA] Successfully loaded fresh drivers data");
      return {
        success: true,
        data: freshDriver,
        message: "Data refreshed successfully",
      };
    } else {
      console.log("[DATA] No fresh data available, loading local data");
      const localData = await loadLocalDriverData();
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

export const loadLocalDriverData = async () => {
  console.log("[DATA] Loading drivers data...");
  try {
    const db = await getDatabase();
    const result = await db.getAllAsync(
      `SELECT * FROM driver ORDER BY name`
    );

    console.log(`[DRIVERS] Found ${result.length} drivers records`);
    return result.map((row) => ({
      id: row.id,
      name: row.name,
    }));

  } catch (error) {
    console.error("[DRIVERS ERROR] Failed to load local drivers:", error);
    return [];
  }
};
