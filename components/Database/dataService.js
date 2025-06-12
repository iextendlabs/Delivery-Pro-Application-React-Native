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

    // Get services with their categories
    const result = await db.getAllAsync(`
      SELECT 
        s.id, 
        s.name,
        GROUP_CONCAT(sc.category_id) AS category_ids
      FROM services s
      LEFT JOIN service_categories sc ON s.id = sc.service_id
      GROUP BY s.id, s.name
      ORDER BY s.name
    `);

    console.log(`[SERVICES] Found ${result.length} services records`);

    return result.map((row) => ({
      id: row.id,
      name: row.name,
      category_ids: row.category_ids
        ? row.category_ids.split(",").map(Number)
        : [],
    }));
  } catch (error) {
    console.error("[SERVICES ERROR] Failed to load local services:", error);
    return [];
  }
};
