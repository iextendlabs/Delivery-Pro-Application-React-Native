import { getDatabase } from "./database";

const clearDatabase = async () => {
  console.log("[DATABASE] Starting database cleanup...");
  try {
    const db = await getDatabase();
    await db.execAsync(`
      DELETE FROM services;
      DELETE FROM service_categories;
      DELETE FROM sub_titles;
      DELETE FROM sync_metadata;
      DELETE FROM group_zone_data;
      DELETE FROM users;
      DELETE FROM images;
      DELETE FROM youtube_videos;
      DELETE FROM staff_groups;
      DELETE FROM staff_categories;
      DELETE FROM staff_services;
      DELETE FROM documents;
      DELETE FROM designations;
    `);
    console.log("[DATABASE] Cleanup completed successfully");
  } catch (error) {
    console.error("[DATABASE ERROR] Cleanup failed:", error);
    throw error;
  }
};

const saveAllServices = async (services) => {
  console.log("[SERVICES] Starting to save services...");
  const db = await getDatabase();

  try {
    // Start transaction manually
    await db.execAsync("BEGIN TRANSACTION");

    try {
      // Delete existing services
      await db.runAsync("DELETE FROM services");

      // Insert new services
      for (const service of services) {
        await db.runAsync("INSERT INTO services (id, name) VALUES (?, ?)", [
          service.id,
          service.name,
        ]);
      }

      // Commit transaction
      await db.execAsync("COMMIT");
      console.log(`[SERVICES] Successfully saved ${services.length} services`);
    } catch (error) {
      // Rollback on error
      await db.execAsync("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("[SERVICES ERROR] Failed to save services:", error);
    throw error;
  }
};

const saveAllCategories = async (categories) => {
  console.log("[CATEGORIES] Starting to save categories...");
  const db = await getDatabase();

  try {
    await db.execAsync("BEGIN TRANSACTION");

    try {
      if (categories.length > 0) {
        await db.runAsync("DELETE FROM service_categories");

        for (const category of categories) {
          await db.runAsync(
            "INSERT INTO service_categories (id, title) VALUES (?, ?)",
            [category.id, category.title]
          );
        }
      }

      await db.execAsync("COMMIT");
      if (categories.length > 0) {
        console.log(`[CATEGORIES] Saved ${categories.length} categories`);
      } else {
        console.log("[CATEGORIES] No categories to save");
      }
    } catch (error) {
      await db.execAsync("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("[CATEGORIES ERROR] Failed to save categories:", error);
    throw error;
  }
};

const saveAllSubTitle = async (sub_titles) => {
  console.log("[SUBTITLES] Starting to save subtitles...");
  const db = await getDatabase();

  try {
    await db.execAsync("BEGIN TRANSACTION");

    try {
      if (sub_titles.length > 0) {
        await db.runAsync("DELETE FROM sub_titles");

        for (const sub_title of sub_titles) {
          await db.runAsync("INSERT INTO sub_titles (id, name) VALUES (?, ?)", [
            sub_title.id,
            sub_title.name,
          ]);
        }
      }

      await db.execAsync("COMMIT");
      if (sub_titles.length > 0) {
        console.log(`[SUBTITLES] Saved ${sub_titles.length} subtitles`);
      } else {
        console.log("[SUBTITLES] No subtitles to save");
      }
    } catch (error) {
      await db.execAsync("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("[SUBTITLES ERROR] Failed to save subtitles:", error);
    throw error;
  }
};

const saveAllGroupData = async (groupData) => {
  console.log("[GroupData] Starting to save groupData...");
  const db = await getDatabase();

  try {
    // Start transaction manually
    await db.execAsync("BEGIN TRANSACTION");

    try {
      // Delete existing groupData
      await db.runAsync("DELETE FROM group_zone_data");

      // Insert new GroupData
      for (const group of groupData) {
        await db.runAsync(
          "INSERT INTO group_zone_data (group_id, group_name,zone_name) VALUES (?, ?, ?)",
          [group.group_id, group.group_name, group.zone_name]
        );
      }

      // Commit transaction
      await db.execAsync("COMMIT");
      console.log(
        `[GroupData] Successfully saved ${groupData.length} groupData`
      );
    } catch (error) {
      // Rollback on error
      await db.execAsync("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("[GroupData ERROR] Failed to save groupData:", error);
    throw error;
  }
};

const saveProfile = async (data) => {
  console.log("[PROFILE] Starting to save profile...");
  const db = await getDatabase();

  try {
    await db.execAsync("BEGIN TRANSACTION");
    await db.runAsync("DELETE FROM users");

    // Save user data
    await db.runAsync(
      `INSERT INTO users (
        id, name, email, phone, whatsapp, get_quote, status, image, 
        location, nationality, about
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.user_id,
        data.name,
        data.email,
        data.phone,
        data.whatsapp,
        data.get_quote,
        data.status,
        data.image,
        data.location,
        data.nationality,
        data.about,
      ]
    );

    // Save images
    await db.runAsync("DELETE FROM images");
    if (data.staffImages && data.staffImages.length > 0) {
      for (const image of data.staffImages) {
        await db.runAsync("INSERT INTO images (image) VALUES (?)", [image]);
      }
    }

    // Save youtube videos
    await db.runAsync("DELETE FROM youtube_videos");
    if (data.staffYoutubeVideo && data.staffYoutubeVideo.length > 0) {
      for (const video of data.staffYoutubeVideo) {
        await db.runAsync("INSERT INTO youtube_videos (video) VALUES (?)", [
          video,
        ]);
      }
    }

    // Save groups
    await db.runAsync("DELETE FROM staff_groups");
    if (data.staffGroups && data.staffGroups.length > 0) {
      for (const groupId of data.staffGroups) {
        await db.runAsync("INSERT INTO staff_groups (group_id) VALUES (?)", [
          groupId,
        ]);
      }
    }

    // Save categories
    await db.runAsync("DELETE FROM staff_categories");
    if (data.category_ids && data.category_ids.length > 0) {
      for (const categoryId of data.category_ids) {
        await db.runAsync(
          "INSERT INTO staff_categories (category_id) VALUES (?)",
          [categoryId]
        );
      }
    }

    // Save services
    await db.runAsync("DELETE FROM staff_services");
    if (data.service_ids && data.service_ids.length > 0) {
      for (const serviceId of data.service_ids) {
        await db.runAsync(
          "INSERT INTO staff_services (service_id) VALUES (?)",
          [serviceId]
        );
      }
    }

    // Save documents
    await db.runAsync("DELETE FROM documents");
    if (data.document) {
      await db.runAsync(
        `INSERT INTO documents (
          address_proof,
          driving_license,
          education,
          id_card_back,
          id_card_front,
          noc,
          other,
          passport
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.document.address_proof,
          data.document.driving_license,
          data.document.education,
          data.document.id_card_back,
          data.document.id_card_front,
          data.document.noc,
          data.document.other,
          data.document.passport,
        ]
      );
    }

    // Save designations (subTitles in your data)
    await db.runAsync("DELETE FROM designations");
    if (data.subTitles && data.subTitles.length > 0) {
      for (const designationId of data.subTitles) {
        await db.runAsync(
          "INSERT INTO designations (designation_id) VALUES (?)",
          [designationId]
        );
      }
    }

    await db.execAsync("COMMIT");
    console.log("[PROFILE] Profile saved successfully");
  } catch (error) {
    await db.execAsync("ROLLBACK");
    console.error("[PROFILE ERROR] Failed to save profile:", error);
    throw error;
  }
};

const setLastFetchDate = async () => {
  const now = new Date().toISOString();
  console.log("[SYNC] Setting last fetch date to:", now);

  try {
    const db = await getDatabase();
    await db.runAsync(
      "INSERT OR REPLACE INTO sync_metadata (key, value) VALUES (?, ?)",
      ["last_fetch_date", now]
    );
    console.log("[SYNC] Last fetch date set successfully");
  } catch (error) {
    console.error("[SYNC ERROR] Failed to set last fetch date:", error);
    throw error;
  }
};

const shouldFetchToday = async () => {
  try {
    const db = await getDatabase();
    const result = await db.getFirstAsync(
      "SELECT value FROM sync_metadata WHERE key = ?",
      ["last_fetch_date"]
    );

    if (!result) {
      console.log("[SYNC] No previous fetch found - need to fetch");
      return true;
    }

    const lastFetch = new Date(result.value);
    const today = new Date();
    console.log(`[SYNC] Last fetch was at: ${lastFetch}`);

    const isDifferentDay =
      lastFetch.getDate() !== today.getDate() ||
      lastFetch.getMonth() !== today.getMonth() ||
      lastFetch.getFullYear() !== today.getFullYear();

    console.log(`[SYNC] Need to fetch today: ${isDifferentDay}`);
    return isDifferentDay;
  } catch (error) {
    console.error("[SYNC ERROR] Failed to check fetch status:", error);
    return true;
  }
};

export {
  saveAllServices,
  setLastFetchDate,
  shouldFetchToday,
  saveAllSubTitle,
  saveAllGroupData,
  clearDatabase,
  saveAllCategories,
  saveProfile,
};
