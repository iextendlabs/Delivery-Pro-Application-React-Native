import { BaseUrl } from "../config/Api";
import { getDatabase } from "./database";
import axios from "axios";

// Utility function for batch inserts
const batchInsert = async (db, table, columns, data) => {
  if (data.length === 0) return;
  
  const placeholders = data.map(() => `(${columns.map(() => '?').join(',')})`).join(',');
  const query = `INSERT INTO ${table} (${columns.join(',')}) VALUES ${placeholders}`;
  await db.runAsync(query, data.flat());
};

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
    await db.execAsync("BEGIN TRANSACTION");

    try {
      // Delete existing data
      await db.runAsync("DELETE FROM services");
      await db.runAsync("DELETE FROM service_categories");

      // Prepare batch inserts
      const servicesBatch = services.map(service => [service.id, service.name]);
      
      const categoriesBatch = services.flatMap(service => 
        (service.category_ids && service.category_ids.length > 0) 
          ? [...new Set(service.category_ids)].map(categoryId => [service.id, categoryId])
          : []
      );

      // Batch insert services
      await batchInsert(db, 'services', ['id', 'name'], servicesBatch);
      
      // Batch insert categories
      await batchInsert(db, 'service_categories', ['service_id', 'category_id'], categoriesBatch);

      await db.execAsync("COMMIT");
      console.log(`[SERVICES] Successfully saved ${services.length} services`);
    } catch (error) {
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
      await db.runAsync("DELETE FROM categories");

      if (categories.length > 0) {
        const batch = categories.map(cat => [cat.id, cat.title, cat.parent_id || null]);
        await batchInsert(db, 'categories', ['id', 'title', 'parent_id'], batch);
      }

      await db.execAsync("COMMIT");
      console.log(`[CATEGORIES] ${categories.length > 0 ? `Saved ${categories.length} categories` : 'No categories to save'}`);
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
      await db.runAsync("DELETE FROM sub_titles");

      if (sub_titles.length > 0) {
        const batch = sub_titles.map(st => [st.id, st.name, st.parent_id]);
        await batchInsert(db, 'sub_titles', ['id', 'name', 'parent_id'], batch);
      }

      await db.execAsync("COMMIT");
      console.log(`[SUBTITLES] ${sub_titles.length > 0 ? `Saved ${sub_titles.length} subtitles` : 'No subtitles to save'}`);
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
    await db.execAsync("BEGIN TRANSACTION");

    try {
      await db.runAsync("DELETE FROM zone_data");

      if (zoneData.length > 0) {
        const batch = zoneData.map(zone => [zone.zone_id, zone.zone_name, zone.country]);
        await batchInsert(db, 'zone_data', ['zone_id', 'zone_name', 'country'], batch);
      }

      await db.execAsync("COMMIT");
      console.log(`[zoneData] ${zoneData.length > 0 ? `Saved ${zoneData.length} zoneData` : 'No zone data to save'}`);
    } catch (error) {
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
      await db.runAsync("DELETE FROM timeSlots");

      if (timeSlots.length > 0) {
        const batch = timeSlots.map(ts => [
          ts.id, 
          ts.name, 
          ts.time_start, 
          ts.time_end, 
          ts.date, 
          ts.type
        ]);
        await batchInsert(db, 'timeSlots', 
          ['id', 'name', 'time_start', 'time_end', 'date', 'type'], 
          batch
        );
      }

      await db.execAsync("COMMIT");
      console.log(`[TIMESLOTS] ${timeSlots.length > 0 ? `Saved ${timeSlots.length} timeSlots` : 'No timeSlots to save'}`);
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
      await db.runAsync("DELETE FROM driver");

      if (drivers.length > 0) {
        const batch = drivers.map(d => [d.id, d.name]);
        await batchInsert(db, 'driver', ['id', 'name'], batch);
      }

      await db.execAsync("COMMIT");
      console.log(`[DRIVERS] ${drivers.length > 0 ? `Saved ${drivers.length} drivers` : 'No drivers to save'}`);
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

    try {
      // Save user data
      await db.runAsync("DELETE FROM users");
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
      if (data.staffImages?.length > 0) {
        const batch = data.staffImages.map(img => [img]);
        await batchInsert(db, 'images', ['image'], batch);
      }

      // Save youtube videos
      await db.runAsync("DELETE FROM youtube_videos");
      if (data.staffYoutubeVideo?.length > 0) {
        const batch = data.staffYoutubeVideo.map(video => [video]);
        await batchInsert(db, 'youtube_videos', ['video'], batch);
      }

      // Save groups
      await db.runAsync("DELETE FROM staff_zones");
      if (data.staffZones?.length > 0) {
        const batch = data.staffZones.map(zoneId => [zoneId]);
        await batchInsert(db, 'staff_zones', ['zone_id'], batch);
      }

      // Save categories
      await db.runAsync("DELETE FROM staff_categories");
      if (data.category_ids?.length > 0) {
        const batch = data.category_ids.map(catId => [catId]);
        await batchInsert(db, 'staff_categories', ['category_id'], batch);
      }

      // Save services
      await db.runAsync("DELETE FROM staff_services");
      if (data.service_ids?.length > 0) {
        const batch = data.service_ids.map(serviceId => [serviceId]);
        await batchInsert(db, 'staff_services', ['service_id'], batch);
      }

      // Save documents
      await db.runAsync("DELETE FROM documents");
      if (data.document) {
        await db.runAsync(
          `INSERT INTO documents (
            address_proof, driving_license, education, id_card_back,
            id_card_front, noc, other, passport
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

      // Save designations
      await db.runAsync("DELETE FROM designations");
      if (data.subTitles?.length > 0) {
        const batch = data.subTitles.map(designationId => [designationId]);
        await batchInsert(db, 'designations', ['designation_id'], batch);
      }

      // Save staff timeSlot
      await db.runAsync("DELETE FROM staff_timeSlots");
      if (data.timeSlots?.length > 0) {
        const batch = data.timeSlots.map(timeSlotId => [timeSlotId]);
        await batchInsert(db, 'staff_timeSlots', ['timeSlot_id'], batch);
      }

      // Save staff driver
      await db.runAsync("DELETE FROM staff_drivers");
      if (data.drivers?.length > 0) {
        const batch = data.drivers.map(driver => [
          driver.id,
          driver.staff_id,
          driver.driver_id,
          driver.day,
          driver.time_slot_id
        ]);
        await batchInsert(db, 'staff_drivers', 
          ['id', 'staff_id', 'driver_id', 'day', 'time_slot_id'], 
          batch
        );
      }

      await db.execAsync("COMMIT");
      console.log("[PROFILE] Profile saved successfully");
    } catch (error) {
      await db.execAsync("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("[PROFILE ERROR] Failed to save profile:", error);
    throw error;
  }
};

const setLastFetchDate = async (key) => {
  try {
    const response = await axios.get(BaseUrl + "storage/updatesDataVersion.json");
    const serverVersions = response.data;

    if (typeof serverVersions[key] === "undefined") {
      console.warn(`[SYNC WARNING] Key ${key} not found in server timestamps`);
      return;
    }

    const version = serverVersions[key];
    console.log("[SYNC] Setting last fetch version to:", version);

    const db = await getDatabase();
    await db.runAsync(
      "INSERT OR REPLACE INTO sync_metadata (key, value) VALUES (?, ?)",
      [key, version]
    );
    console.log("[SYNC] Last fetch version set successfully");
  } catch (error) {
    console.error("[SYNC ERROR] Failed to set last fetch version:", error);
    return;
  }
};

const shouldFetchToday = async (key) => {
  try {
    const db = await getDatabase();
    const localResult = await db.getFirstAsync(
      "SELECT value FROM sync_metadata WHERE key = ?",
      [key]
    );

    const response = await axios.get(BaseUrl + "storage/updatesDataVersion.json");
    const serverVersions = response.data;

    if (typeof serverVersions[key] === "undefined") {
      console.warn(`[SYNC WARNING] Key ${key} not found in server timestamps`);
      return true;
    }

    const serverVersion = Number(serverVersions[key]);
    const localVersion = localResult ? Number(localResult.value) : null;

    if (!localVersion || serverVersion > localVersion) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("[SYNC ERROR] Failed to check fetch status:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
      });
    }
    return true; // Default to fetching if there's an error
  }
};

const deleteSyncMetadataKey = async (key) => {
  try {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM sync_metadata WHERE key = ?", [key]);
    console.log(`[SYNC] Deleted sync_metadata row for key: ${key}`);
  } catch (error) {
    console.error(`[SYNC ERROR] Failed to delete sync_metadata row for key: ${key}`, error);
    throw error;
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
  deleteSyncMetadataKey
};