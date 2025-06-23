// profile.js
import { getDatabase } from "./database";

export const loadProfileLocalData = async () => {
  console.log("[DATA] Loading local profile data...");
  try {
    const db = await getDatabase();

    // Load user data
    const user = await db.getAllAsync(`
      SELECT * FROM users 
      LIMIT 1
    `);

    if (!user) {
      console.log("[PROFILE] No profile data found");
      return null;
    }

    // Load related data
    const [
      images,
      videos,
      zones,
      categories,
      services,
      documents,
      designations,
      timeSlots,
      assignedDrivers,
    ] = await Promise.all([
      db.getAllAsync("SELECT image FROM images"),
      db.getAllAsync("SELECT video FROM youtube_videos"),
      db.getAllAsync("SELECT zone_id FROM staff_zones"),
      db.getAllAsync("SELECT category_id FROM staff_categories"),
      db.getAllAsync("SELECT service_id FROM staff_services"),
      db.getAllAsync("SELECT * FROM documents LIMIT 1"),
      db.getAllAsync("SELECT designation_id FROM designations"),
      db.getAllAsync("SELECT timeSlot_id FROM staff_timeSlots"),
      db.getAllAsync("SELECT * FROM staff_drivers"),
    ]);

    function transformAssignedDrivers(assignedDrivers) {
      const weekDays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      const assignments = weekDays.reduce((acc, day) => {
        acc[day] = [];
        return acc;
      }, {});
      assignedDrivers.forEach((item) => {
        const day = item.day;
        if (assignments[day]) {
          assignments[day].push({
            driverId: item.driver_id,
            staffId: item.staff_id,
            timeSlotId: item.time_slot_id,
          });
        }
      });
      // Ensure at least one row per day
      weekDays.forEach((day) => {
        if (assignments[day].length === 0) {
          assignments[day].push({
            driverId: null,
            staffId: null,
            timeSlotId: null,
          });
        }
      });
      return assignments;
    }

    // Transform the data into a structure similar to your API response
    const profileData = {
      user_id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      phone: user[0].phone,
      whatsapp: user[0].whatsapp,
      get_quote: user[0].get_quote,
      status: user[0].status,
      image: user[0].image,
      location: user[0].location,
      nationality: user[0].nationality,
      about: user[0].about,
      staffImages: images.map((img) => img.image),
      staffYoutubeVideo: videos.map((vid) => vid.video),
      staffZones: zones.map((g) => g.zone_id),
      category_ids: categories.map((c) => c.category_id),
      service_ids: services.map((s) => s.service_id),
      document: documents || {},
      subTitles: designations.map((d) => d.designation_id),
      timeSlots: timeSlots.map((d) => d.timeSlot_id),
      driverAssignments: transformAssignedDrivers(assignedDrivers),
    };

    console.log("[PROFILE] Profile data loaded successfully");
    return profileData;
  } catch (error) {
    console.error("[PROFILE ERROR] Failed to load profile data:", error);
    return null;
  }
};
