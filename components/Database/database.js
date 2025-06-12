import * as SQLite from "expo-sqlite";

// Database instance
let databaseInstance = null;

// Initialize and get database
const getDatabase = async () => {
  if (!databaseInstance) {
    databaseInstance = await SQLite.openDatabaseAsync("lipslay.db");

    // Initialize tables if they don't exist
    await databaseInstance.execAsync(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        parent_id INTEGER
      );

      CREATE TABLE IF NOT EXISTS service_categories (
        service_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        PRIMARY KEY (service_id, category_id),
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS sync_metadata (
        key TEXT PRIMARY KEY,
        value TEXT
      );
      
      CREATE TABLE IF NOT EXISTS sub_titles (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS group_zone_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_id INTEGER,
        group_name TEXT,
        zone_name TEXT
      );

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        status INTEGER DEFAULT 1,
        get_quote INTEGER DEFAULT 1,
        image TEXT, -- path or URL to profile image
        phone TEXT,
        about TEXT,
        whatsapp TEXT,
        location TEXT,
        nationality TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS images (
        image TEXT
      );

      CREATE TABLE IF NOT EXISTS youtube_videos (
        video TEXT
      );

      CREATE TABLE IF NOT EXISTS staff_groups (
        group_id INTEGER
      );

      CREATE TABLE IF NOT EXISTS staff_categories (
          category_id INTEGER
      );

      CREATE TABLE IF NOT EXISTS staff_services (
        service_id INTEGER
      );

      CREATE TABLE IF NOT EXISTS documents (
        address_proof TEXT,
        noc TEXT,
        id_card_front TEXT,
        id_card_back TEXT,
        passport TEXT,
        driving_license TEXT,
        education TEXT,
        other TEXT
      );

      CREATE TABLE IF NOT EXISTS designations (
        designation_id INTEGER
      );
    `);
  }
  return databaseInstance;
};

export { getDatabase };
