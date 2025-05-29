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
      groups,
      categories,
      services,
      documents,
      designations,
    ] = await Promise.all([
      db.getAllAsync("SELECT image FROM images"),
      db.getAllAsync("SELECT video FROM youtube_videos"),
      db.getAllAsync("SELECT group_id FROM staff_groups"),
      db.getAllAsync("SELECT category_id FROM staff_categories"),
      db.getAllAsync("SELECT service_id FROM staff_services"),
      db.getAllAsync("SELECT * FROM documents LIMIT 1"),
      db.getAllAsync("SELECT designation_id FROM designations"),
    ]);

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
      staffGroups: groups.map((g) => g.group_id),
      category_ids: categories.map((c) => c.category_id),
      service_ids: services.map((s) => s.service_id),
      document: documents || {},
      subTitles: designations.map((d) => d.designation_id),
    };

    console.log("[PROFILE] Profile data loaded successfully");
    return profileData;
  } catch (error) {
    console.error("[PROFILE ERROR] Failed to load profile data:", error);
    return null;
  }
};
