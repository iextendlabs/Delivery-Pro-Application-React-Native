import { getDatabase } from "./database";

const clearDatabase = async () => {
  console.log("[DATABASE] Starting database cleanup...");
  try {
    const db = await getDatabase();
    await db.execAsync(`
      DELETE FROM services;
      DELETE FROM categories;
      DELETE FROM service_categories;
      DELETE FROM sub_titles;
      DELETE FROM sync_metadata;
      DELETE FROM zone_data;
      DELETE FROM timeSlots;
      DELETE FROM driver;
    `);
    console.log("[DATABASE] Cleanup completed successfully");
  } catch (error) {
    console.error("[DATABASE ERROR] Cleanup failed:", error);
    throw error;
  }
};

const clearUserData = async () => {
  console.log("[DATABASE] Starting database cleanup...");
  try {
    const db = await getDatabase();
    await db.execAsync(`
      DELETE FROM users;
      DELETE FROM images;
      DELETE FROM youtube_videos;
      DELETE FROM staff_zones;
      DELETE FROM staff_categories;
      DELETE FROM staff_services;
      DELETE FROM documents;
      DELETE FROM staff_timeSlots;
      DELETE FROM staff_drivers;
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
      await db.runAsync("DELETE FROM service_categories");
      // Insert new services
      for (const service of services) {
        await db.runAsync("INSERT INTO services (id, name) VALUES (?, ?)", [
          service.id,
          service.name,
        ]);

        if (service.category_ids && service.category_ids.length > 0) {
          const uniqueCategories = [...new Set(service.category_ids)];
          for (const categoryId of uniqueCategories) {
            await db.runAsync(
              "INSERT INTO service_categories (service_id, category_id) VALUES (?, ?)",
              [service.id, categoryId]
            );
          }
        }
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
        await db.runAsync("DELETE FROM categories");

        for (const category of categories) {
          await db.runAsync(
            "INSERT INTO categories (id, title, parent_id) VALUES (?, ?, ?)",
            [category.id, category.title, category.parent_id || null]
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

const saveAllZoneData = async (zoneData) => {
  console.log("[zoneData] Starting to save zoneData...");
  const db = await getDatabase();

  try {
    // Start transaction manually
    await db.execAsync("BEGIN TRANSACTION");

    try {
      // Delete existing zoneData
      await db.runAsync("DELETE FROM zone_data");

      // Insert new zoneData
      for (const zone of zoneData) {
        await db.runAsync(
          "INSERT INTO zone_data (zone_id, zone_name) VALUES (?, ?)",
          [zone.zone_id, zone.zone_name]
        );
      }

      // Commit transaction
      await db.execAsync("COMMIT");
      console.log(`[zoneData] Successfully saved ${zoneData.length} zoneData`);
    } catch (error) {
      // Rollback on error
      await db.execAsync("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("[zoneData ERROR] Failed to save zoneData:", error);
    throw error;
  }
};

const saveTimeSlot = async (timeSlots) => {
  console.log("[TIMESLOTS] Starting to save timeSlots...");
  const db = await getDatabase();

  try {
    await db.execAsync("BEGIN TRANSACTION");

    try {
      if (timeSlots.length > 0) {
        await db.runAsync("DELETE FROM timeSlots");

        for (const timeSlot of timeSlots) {
          await db.runAsync(
            "INSERT INTO timeSlots (id, name, time_start, time_end, date, type) VALUES (?, ?, ?, ?, ?, ?)",
            [
              timeSlot.id,
              timeSlot.name,
              timeSlot.time_start,
              timeSlot.time_end,
              timeSlot.date,
              timeSlot.type,
            ]
          );
        }
      }

      await db.execAsync("COMMIT");
      if (timeSlots.length > 0) {
        console.log(`[TIMESLOTS] Saved ${timeSlots.length} timeSlots`);
      } else {
        console.log("[TIMESLOTS] No timeSlots to save");
      }
    } catch (error) {
      await db.execAsync("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("[TIMESLOTS ERROR] Failed to save timeSlots:", error);
    throw error;
  }
};

const saveDrivers = async (drivers) => {
  console.log("[DRIVERS] Starting to save drivers...");
  const db = await getDatabase();

  try {
    await db.execAsync("BEGIN TRANSACTION");

    try {
      if (drivers.length > 0) {
        await db.runAsync("DELETE FROM driver");

        for (const driver of drivers) {
          await db.runAsync("INSERT INTO driver (id, name) VALUES (?, ?)", [
            driver.id,
            driver.name,
          ]);
        }
      }

      await db.execAsync("COMMIT");
      if (drivers.length > 0) {
        console.log(`[DRIVERS] Saved ${drivers.length} drivers`);
      } else {
        console.log("[DRIVERS] No drivers to save");
      }
    } catch (error) {
      await db.execAsync("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("[DRIVERS ERROR] Failed to save drivers:", error);
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
    await db.runAsync("DELETE FROM staff_zones");
    if (data.staffZones && data.staffZones.length > 0) {
      for (const zoneId of data.staffZones) {
        await db.runAsync("INSERT INTO staff_zones (zone_id) VALUES (?)", [
          zoneId,
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

    // Save staff timeSlot
    await db.runAsync("DELETE FROM staff_timeSlots");
    if (data.timeSlots && data.timeSlots.length > 0) {
      for (const timeSlotId of data.timeSlots) {
        await db.runAsync(
          "INSERT INTO staff_timeSlots (timeSlot_id) VALUES (?)",
          [timeSlotId]
        );
      }
    }

    // Save staff driver
    await db.runAsync("DELETE FROM staff_drivers");
    if (data.drivers && data.drivers.length > 0) {
      for (const driver of data.drivers) {
        await db.runAsync(
          "INSERT INTO staff_drivers (id, staff_id, driver_id, day, time_slot_id) VALUES (?, ?, ?, ?, ?)",
          [
            driver.id,
            driver.staff_id,
            driver.driver_id,
            driver.day,
            driver.time_slot_id,
          ]
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

const setLastFetchDate = async ($key) => {
  const now = new Date().toISOString();
  console.log("[SYNC] Setting last fetch date to:", now);

  try {
    const db = await getDatabase();
    await db.runAsync(
      "INSERT OR REPLACE INTO sync_metadata (key, value) VALUES (?, ?)",
      [$key, now]
    );
    console.log("[SYNC] Last fetch date set successfully");
  } catch (error) {
    console.error("[SYNC ERROR] Failed to set last fetch date:", error);
    throw error;
  }
};

const shouldFetchToday = async ($key) => {
  try {
    const db = await getDatabase();
    const result = await db.getFirstAsync(
      "SELECT value FROM sync_metadata WHERE key = ?",
      [$key]
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
  saveAllZoneData,
  clearDatabase,
  saveAllCategories,
  saveProfile,
  clearUserData,
  saveTimeSlot,
  saveDrivers,
};
