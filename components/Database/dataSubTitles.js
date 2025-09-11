// dataSubTitles.js
import { fetchSubTitles } from "./apiService";
import { db, getDatabase } from "./database";

export const loadAndRefreshSubTitleData = async () => {
  console.log("[SUBTITLES] Starting subtitle data load and refresh...");
  try {
    const freshSubTitles = await fetchSubTitles();

    if (freshSubTitles) {
      console.log("[SUBTITLES] Successfully loaded fresh subtitle data");
      return {
        success: true,
        data: freshSubTitles,
        message: "Subtitles refreshed successfully",
      };
    } else {
      console.log(
        "[SUBTITLES] No fresh data available, loading local subtitles"
      );
      const localData = await loadLocalSubTitleData();
      return {
        success: true,
        data: localData,
        message: "Using cached subtitles",
      };
    }
  } catch (error) {
    console.error(
      "[SUBTITLES ERROR] Failed to load and refresh subtitles:",
      error
    );
    return {
      success: false,
      error: error.message,
      data: null,
    };
  }
};

export const loadLocalSubTitleData = async () => {
  console.log("[SUBTITLES] Loading local subtitle data...");
  try {
    const db = await getDatabase();
    const result = await db.getAllAsync(
      `SELECT * FROM sub_titles ORDER BY name`
    );

    console.log(`[SUBTITLES] Found ${result.length} subtitle records`);
    return result.map((row) => ({
      id: row.id,
      name: row.name,
      parent_id: row.parent_id,
    }));
  } catch (error) {
    console.error("[SUBTITLES ERROR] Failed to load local subtitle:", error);
    return [];
  }
};
