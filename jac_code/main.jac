import nodes.base_nodes;
import nodes.user_nodes;
import nodes.logistics_nodes;

import walkers.auth_walkers;
import walkers.resident_walkers;
import walkers.collector_walkers;
import walkers.admin_walkers;
import walkers.internal_walkers;

import byllm_models.wastelink_tools;
import geo_client.map_client;

with entry {
    print("=== WasteLink Backend Initialized ===");

    # Initialize SQLite database
    import sqlite3;
    conn = sqlite3.connect("./data/wastelink.db");
    cursor = conn.cursor();

 # USERS table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        full_name TEXT NOT NULL,
        phone TEXT,
        profile_image TEXT,
        latitude REAL,
        longitude REAL,
        address TEXT,
        is_available BOOLEAN DEFAULT 1,
        total_earnings REAL DEFAULT 0.00,
        completed_pickups INTEGER DEFAULT 0,
        rating REAL DEFAULT 0.00,
        vehicle_type TEXT,
        capacity_kg REAL,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """);

    # PICKUP_REQUESTS table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pickup_requests (
        id TEXT PRIMARY KEY,
        resident_id TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        address TEXT NOT NULL,
        location_notes TEXT,
        status TEXT DEFAULT 'pending',
        assigned_collector_id TEXT,
        assigned_at TIMESTAMP,
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        FOREIGN KEY (resident_id) REFERENCES users(id),
        FOREIGN KEY (assigned_collector_id) REFERENCES users(id)
    );
    """);

    # COLLECTIONS table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS collections (
        id TEXT PRIMARY KEY,
        request_id TEXT NOT NULL,
        collector_id TEXT NOT NULL,
        waste_photo_url TEXT,
        categories TEXT,
        total_weight_kg REAL NOT NULL,
        earnings_amount REAL DEFAULT 300,
        payment_status TEXT DEFAULT 'pending',
        collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        FOREIGN KEY (request_id) REFERENCES pickup_requests(id),
        FOREIGN KEY (collector_id) REFERENCES users(id)
    );
    """);

    # NOTIFICATIONS table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        related_request_id TEXT,
        related_collection_id TEXT,
        is_read BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (related_request_id) REFERENCES pickup_requests(id),
        FOREIGN KEY (related_collection_id) REFERENCES collections(id)
    );
    """);

    conn.commit();
    conn.close();

    print("Database initialized with all tables (if not exist).");
}