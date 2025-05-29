// dataService.js
import { fetchServices } from "./apiService";
import { getDatabase } from "./database";

export const loadAndRefreshData = async () => {
  console.log("[DATA] Starting data load and refresh...");
  try {
    const freshServices = await fetchServices();

    if (freshServices) {
      console.log("[DATA] Successfully loaded fresh services data");
      return {
        success: true,
        data: freshServices,
        message: "Data refreshed successfully",
      };
    } else {
      console.log("[DATA] No fresh data available, loading local data");
      const localData = await loadLocalData();
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

export const loadLocalData = async () => {
  console.log("[DATA] Loading local services data...");
  try {
    const db = await getDatabase();
    const result = await db.getAllAsync(`SELECT * FROM services ORDER BY name`);

    console.log(`[SERVICES] Found ${result.length} services records`);
    return result.map((row) => ({
      id: row.id,
      name: row.name,
    }));
  } catch (error) {
    console.error("[SERVICES ERROR] Failed to load local services:", error);
    return [];
  }
};
