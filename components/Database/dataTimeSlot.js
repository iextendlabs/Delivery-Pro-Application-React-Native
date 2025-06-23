// dataTimeSlot.js
import { fetchTimeSlot } from "./apiService";
import { getDatabase } from "./database";

export const loadAndRefreshTimeSlotData = async () => {
  console.log("[DATA] Starting data load and refresh...");
  try {
    const freshTimeSlots = await fetchTimeSlot();

    if (freshTimeSlots) {
      console.log("[DATA] Successfully loaded fresh timeSlots data");
      return {
        success: true,
        data: freshTimeSlots,
        message: "Data refreshed successfully",
      };
    } else {
      console.log("[DATA] No fresh data available, loading local data");
      const localData = await loadLocalTimeSlotData();
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

export const loadLocalTimeSlotData = async () => {
  console.log("[DATA] Loading timeSlots data...");
  try {
    const db = await getDatabase();
    const result = await db.getAllAsync(
      `SELECT * FROM timeSlots time_start`
    );

    console.log(`[TIMESLOTS] Found ${result.length} timeSlots records`);
    return result.map((row) => ({
      id: row.id,
      name: row.name,
      time_start: row.time_start,
      time_end: row.time_end,
      date: row.date,
      type: row.type
    }));

  } catch (error) {
    console.error("[TIMESLOTS ERROR] Failed to load local timeSlots:", error);
    return [];
  }
};
