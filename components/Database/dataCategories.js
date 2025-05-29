// dataCategories.js
import { fetchCategories } from "./apiService";
import { getDatabase } from "./database";

export const loadAndRefreshCategoryData = async () => {
  console.log("[CATEGORIES] Starting category data load and refresh...");
  try {
    const freshCategories = await fetchCategories();

    if (freshCategories) {
      console.log("[CATEGORIES] Successfully loaded fresh category data");
      return {
        success: true,
        data: freshCategories,
        message: "Categories refreshed successfully",
      };
    } else {
      console.log(
        "[CATEGORIES] No fresh data available, loading local categories"
      );
      const localData = await loadLocalCategoriesData();
      return {
        success: true,
        data: localData,
        message: "Using cached categories",
      };
    }
  } catch (error) {
    console.error(
      "[CATEGORIES ERROR] Failed to load and refresh categories:",
      error
    );
    return {
      success: false,
      error: error.message,
      data: null,
    };
  }
};

export const loadLocalCategoriesData = async () => {
  console.log("[CATEGORIES] Loading local category data...");
  try {
    const db = await getDatabase();
    const result = await db.getAllAsync(
      `SELECT * FROM service_categories ORDER BY title`
    );

    console.log(`[CATEGORIES] Found ${result.length} category records`);
    return result.map((row) => ({
      id: row.id,
      title: row.title,
    }));
  } catch (error) {
    console.error("[CATEGORIES ERROR] Failed to load local categories:", error);
    return [];
  }
};
