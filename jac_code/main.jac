# WasteLink Main Application
# Using your SQL schema with fixed pricing (Resident: 500, Collector: 300)

import "./nodes/base_nodes.jac" as Base;
import "./nodes/user_nodes.jac" as Users;
import "./nodes/logistics_nodes.jac" as Logistics;

import "./walkers/auth_walkers.jac";
import "./walkers/resident_walkers.jac";
import "./walkers/collector_walkers.jac";
import "./walkers/admin_walkers.jac";
import "./walkers/internal_walkers.jac";

import "../byllm_models/wastelink_tools.jac" as Tools;

walker WasteLinkSystem {
    
    # ============ DATABASE INITIALIZATION ============
    can initialize_database {
        """
        Create all database tables using your provided schema.
        Removed weight-based earnings - using fixed pricing instead.
        """
        print("🗄️ Initializing WasteLink Database...");
        
        # Connect to SQLite database
        db = std.db_connect(
            driver="sqlite",
            database=config.database.path
        );
        
        # Enable foreign keys and WAL mode
        db.execute("PRAGMA foreign_keys = ON");
        db.execute("PRAGMA journal_mode = WAL");
        
        # ============ CREATE TABLES ============
        
        # 1. Users table (combined for all roles)
        db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('resident', 'collector', 'admin')),
                full_name TEXT NOT NULL,
                phone TEXT,
                profile_image TEXT,
                
                -- Location
                latitude REAL,
                longitude REAL,
                address TEXT,
                
                -- Collector-specific fields
                is_available BOOLEAN DEFAULT TRUE,
                total_earnings REAL DEFAULT 0.00,
                completed_pickups INTEGER DEFAULT 0,
                rating REAL DEFAULT 5.00,
                vehicle_type TEXT,
                capacity_kg REAL,
                
                status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'pending')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """);
        print("✅ Created users table");
        
        # 2. Pickup requests table
        db.execute("""
            CREATE TABLE IF NOT EXISTS pickup_requests (
                id TEXT PRIMARY KEY,
                resident_id TEXT NOT NULL,
                
                -- Location
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                address TEXT NOT NULL,
                location_notes TEXT,
                
                -- Waste details
                waste_photo_url TEXT,
                waste_type TEXT DEFAULT 'mixed',
                ai_classification TEXT,
                
                -- Status: pending, assigned, arrived, completed, cancelled
                status TEXT DEFAULT 'pending',
                
                -- Assignment
                assigned_collector_id TEXT,
                assigned_at TIMESTAMP,
                
                -- Timing
                requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                arrived_at TIMESTAMP,
                completed_at TIMESTAMP,
                cancelled_at TIMESTAMP,
                
                -- Fixed pricing: Resident pays 500, Collector earns 300
                resident_payment REAL DEFAULT 500.00,
                collector_earnings REAL DEFAULT 300.00,
                payment_status TEXT DEFAULT 'pending',
                
                FOREIGN KEY (resident_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (assigned_collector_id) REFERENCES users(id) ON DELETE SET NULL
            )
        """);
        print("✅ Created pickup_requests table");
        
        # 3. Collections table (simplified - no weight-based earnings)
        db.execute("""
            CREATE TABLE IF NOT EXISTS collections (
                id TEXT PRIMARY KEY,
                request_id TEXT NOT NULL,
                collector_id TEXT NOT NULL,
                
                -- Photo and AI data
                waste_photo_url TEXT,
                ai_classification_data TEXT,  -- JSON stored as TEXT
                
                -- Waste data (for analytics only, not for pricing)
                total_weight_kg REAL DEFAULT 0.0,
                categories TEXT,  -- JSON stored as TEXT
                
                -- Fixed earnings: Always 300 per collection
                earnings_amount REAL DEFAULT 300.00,
                payment_status TEXT DEFAULT 'pending',
                
                collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                notes TEXT,
                
                FOREIGN KEY (request_id) REFERENCES pickup_requests(id) ON DELETE CASCADE,
                FOREIGN KEY (collector_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """);
        print("✅ Created collections table");
        
        # 4. Notifications table
        db.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                type TEXT NOT NULL,
                
                related_request_id TEXT,
                related_collection_id TEXT,
                
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (related_request_id) REFERENCES pickup_requests(id) ON DELETE SET NULL,
                FOREIGN KEY (related_collection_id) REFERENCES collections(id) ON DELETE SET NULL
            )
        """);
        print("✅ Created notifications table");
        
        # 5. Earnings table (simplified - fixed amount per collection)
        db.execute("""
            CREATE TABLE IF NOT EXISTS earnings (
                id TEXT PRIMARY KEY,
                collector_id TEXT NOT NULL,
                collection_id TEXT NOT NULL,
                
                -- Fixed earnings: Always 300 per collection
                amount REAL DEFAULT 300.00,
                
                -- Payment tracking
                payment_date DATE,
                status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'paid')),
                
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                FOREIGN KEY (collector_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
            )
        """);
        print("✅ Created earnings table");
        
        # 6. Waste pricing table (for reference only, not used for pricing)
        db.execute("""
            CREATE TABLE IF NOT EXISTS waste_pricing (
                id TEXT PRIMARY KEY,
                waste_type TEXT UNIQUE NOT NULL,
                price_per_kg REAL NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """);
        print("✅ Created waste_pricing table");
        
        # 7. Daily metrics table
        db.execute("""
            CREATE TABLE IF NOT EXISTS daily_metrics (
                id TEXT PRIMARY KEY,
                metric_date DATE UNIQUE NOT NULL,
                
                -- Daily totals
                total_requests INTEGER DEFAULT 0,
                total_collections INTEGER DEFAULT 0,
                total_weight_kg REAL DEFAULT 0.00,
                total_earnings REAL DEFAULT 0.00,
                
                -- Active users
                active_collectors INTEGER DEFAULT 0,
                active_residents INTEGER DEFAULT 0,
                
                -- Efficiency metrics
                avg_collection_time_minutes REAL DEFAULT 0.00,
                completion_rate REAL DEFAULT 0.00,
                
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """);
        print("✅ Created daily_metrics table");
        
        # ============ CREATE INDEXES ============
        print("📊 Creating indexes for performance...");
        
        # Users table indexes
        db.execute("CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)");
        db.execute("CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude)");
        db.execute("CREATE INDEX IF NOT EXISTS idx_users_availability ON users(is_available) WHERE role = 'collector'");
        db.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)");
        
        # Pickup requests indexes
        db.execute("CREATE INDEX IF NOT EXISTS idx_pickup_status ON pickup_requests(status)");
        db.execute("CREATE INDEX IF NOT EXISTS idx_pickup_location ON pickup_requests(latitude, longitude)");
        db.execute("CREATE INDEX IF NOT EXISTS idx_pickup_assigned ON pickup_requests(assigned_collector_id) WHERE assigned_collector_id IS NOT NULL");
        db.execute("CREATE INDEX IF NOT EXISTS idx_pickup_requested ON pickup_requests(requested_at)");
        db.execute("CREATE INDEX IF NOT EXISTS idx_pickup_resident ON pickup_requests(resident_id)");
        
        # Collections indexes
        db.execute("CREATE INDEX IF NOT EXISTS idx_collections_collector ON collections(collector_id, collected_at)");
        db.execute("CREATE INDEX IF NOT EXISTS idx_collections_payment ON collections(payment_status)");
        
        # Notifications indexes
        db.execute("CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read)");
        db.execute("CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at)");
        
        # Earnings indexes
        db.execute("CREATE INDEX IF NOT EXISTS idx_earnings_collector ON earnings(collector_id, payment_date)");
        db.execute("CREATE INDEX IF NOT EXISTS idx_earnings_status ON earnings(status)");
        
        # Daily metrics index
        db.execute("CREATE INDEX IF NOT EXISTS idx_metrics_date ON daily_metrics(metric_date)");
        
        # ============ INSERT DEFAULT DATA ============
        print("📝 Inserting default data...");
        
        # Insert default waste pricing (for reference only)
        default_waste_types = [
            ("plastic", 0.40),
            ("paper", 0.20),
            ("metal", 0.50),
            ("glass", 0.10),
            ("organic", 0.05),
            ("e_waste", 1.00),
            ("hazardous", 0.80),
            ("mixed", 0.15)
        ];
        
        for waste_type, price in default_waste_types:
            # Check if exists
            check_sql = "SELECT id FROM waste_pricing WHERE waste_type = ?";
            existing = db.query(check_sql, [waste_type]);
            
            if existing.length == 0:
                insert_sql = """
                    INSERT INTO waste_pricing (id, waste_type, price_per_kg, is_active)
                    VALUES (?, ?, ?, TRUE)
                """;
                db.execute(insert_sql, [std.uuid4(), waste_type, price]);
                print(f"  Added waste type: {waste_type} @ KES {price}/kg");
        
        print("✅ Default data inserted");
        
        # ============ VERIFY DATABASE ============
        print("🔍 Verifying database setup...");
        
        # Get table counts
        tables = ["users", "pickup_requests", "collections", "notifications", "earnings", "waste_pricing", "daily_metrics"];
        
        for table in tables:
            try:
                count = db.query(f"SELECT COUNT(*) as cnt FROM {table}")[0].cnt;
                print(f"  {table}: {count} rows");
            } catch error:
                print(f"  ⚠️ {table}: Error - {error}");
        
        print("✅ Database initialization complete!");
        
        return {
            "success": true,
            "database": config.database.path,
            "tables_created": tables.length,
            "timestamp": std.now()
        };
    }
    
    # ============ CREATE DEFAULT ADMIN ============
    can create_default_admin {
        """
        Create default admin user if none exists.
        """
        # Check if any admin exists
        admin_check = std.db_query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
        
        if admin_check and admin_check.length > 0:
            print("✅ Admin user already exists");
            return {"success": true, "message": "Admin exists"};
        
        # Create default admin
        admin_id = std.uuid4();
        admin_email = "admin@wastelink.com";
        admin_password = "Admin123!";  # In production, use environment variable
        
        # Hash password
        password_hash = std.bcrypt_hash(admin_password);
        
        insert_sql = """
            INSERT INTO users (id, email, password_hash, role, full_name, status)
            VALUES (?, ?, ?, 'admin', 'System Administrator', 'active')
        """;
        
        try {
            std.db_execute(insert_sql, [admin_id, admin_email, password_hash]);
            print("✅ Created default admin user");
            print(f"   Email: {admin_email}");
            print(f"   Password: {admin_password}");
            print("⚠️  CHANGE THIS PASSWORD IN PRODUCTION!");
            
            return {
                "success": true,
                "admin_id": admin_id,
                "email": admin_email
            };
        } catch error {
            print(f"❌ Failed to create admin: {error}");
            return {"success": false, "error": str(error)};
        }
    }
    
    # ============ SYSTEM HEALTH CHECK ============
    can health_check {
        """
        Check system health and database connectivity.
        """
        checks = {
            "database_file": false,
            "database_tables": false,
            "ai_service": false,
            "api_server": false
        };
        
        messages = [];
        
        # 1. Check database file
        if std.file_exists(config.database.path):
            checks.database_file = true;
            messages.append("✅ Database file exists");
        else:
            messages.append("❌ Database file not found");
        
        # 2. Check database tables
        try {
            db = std.db_connect(driver="sqlite", database=config.database.path);
            tables = db.query("SELECT name FROM sqlite_master WHERE type='table'");
            
            required_tables = ["users", "pickup_requests", "collections", "notifications"];
            missing_tables = [];
            
            for table in required_tables:
                found = false;
                for t in tables:
                    if t.name == table:
                        found = true;
                        break;
                
                if not found:
                    missing_tables.append(table);
            
            if missing_tables.length == 0:
                checks.database_tables = true;
                messages.append(f"✅ All {tables.length} database tables found");
            else:
                messages.append(f"❌ Missing tables: {missing_tables}");
        } catch error:
            messages.append(f"❌ Database connection failed: {error}");
        
        # 3. Check AI service (BYLLM)
        try {
            # Simple test of AI classification
            test_result = Tools.classify_waste_image("test.jpg");
            checks.ai_service = true;
            messages.append("✅ AI service is reachable");
        } catch error:
            messages.append("⚠️ AI service not available (some features disabled)");
        
        # 4. Calculate overall health
        all_healthy = checks.database_file and checks.database_tables;
        
        return {
            "healthy": all_healthy,
            "checks": checks,
            "messages": messages,
            "timestamp": std.now(),
            "version": "1.0.0",
            "pricing_model": {
                "resident_payment": 500,
                "collector_earnings": 300,
                "system_fee": 200
            }
        };
    }
    
    # ============ MAIN ENTRY POINT ============
    can start with entry {
        print("\n" + "="*60);
        print("🚀 WASTELINK WASTE MANAGEMENT SYSTEM");
        print("="*60);
        print("💰 Fixed Pricing Model:");
        print("   Resident pays: 500 KES per collection");
        print("   Collector earns: 300 KES per collection");
        print("   System fee: 200 KES per collection");
        print("="*60 + "\n");
        
        # Step 1: Health check
        print("🔍 Running system health check...");
        health = ::health_check();
        
        if not health.healthy:
            print("❌ System health check failed!");
            for msg in health.messages:
                print(f"   {msg}");
            print("\n⚠️ Attempting to repair...");
        else:
            print("✅ System health: GOOD");
            for msg in health.messages:
                print(f"   {msg}");
        
        # Step 2: Initialize database (if needed)
        print("\n🗄️ Initializing database...");
        db_result = ::initialize_database();
        
        if not db_result.success:
            print("❌ Database initialization failed!");
            print("   Please check database configuration");
            disengage;
        
        print(f"✅ Database ready: {db_result.database}");
        
        # Step 3: Create default admin
        print("\n👑 Setting up admin user...");
        admin_result = ::create_default_admin();
        
        if not admin_result.success:
            print("⚠️ Could not create admin user");
        
        # Step 4: Setup API endpoints
        print("\n🌐 Setting up API server...");
        
        # Authentication endpoints
        api.set_route("/api/auth/register", "POST", walker::AuthWalker.register);
        api.set_route("/api/auth/login", "POST", walker::AuthWalker.login);
        api.set_route("/api/auth/profile", "GET", walker::AuthWalker.get_profile);
        
        # Resident endpoints
        api.set_route("/api/resident/request", "POST", walker::ResidentWalker.create_request);
        api.set_route("/api/resident/status", "GET", walker::ResidentWalker.get_status);
        api.set_route("/api/resident/history", "GET", walker::ResidentWalker.get_history);
        api.set_route("/api/resident/pay", "POST", walker::ResidentWalker.make_payment);
        
        # Collector endpoints
        api.set_route("/api/collector/pickups", "GET", walker::CollectorWalker.get_available_pickups);
        api.set_route("/api/collector/accept", "POST", walker::CollectorWalker.accept_request);
        api.set_route("/api/collector/start", "POST", walker::CollectorWalker.start_pickup);
        api.set_route("/api/collector/complete", "POST", walker::CollectorWalker.complete_pickup);
        api.set_route("/api/collector/location", "POST", walker::CollectorWalker.update_location);
        api.set_route("/api/collector/optimize", "POST", walker::CollectorWalker.optimize_route);
        api.set_route("/api/collector/availability", "POST", walker::CollectorWalker.toggle_availability);
        
        # Admin endpoints
        api.set_route("/api/admin/overview", "GET", walker::AdminWalker.get_system_overview);
        api.set_route("/api/admin/manage", "POST", walker::AdminWalker.manage_users);
        
        # System endpoints
        api.set_route("/api/health", "GET", ::health_check);
        api.set_route("/api/system/auto-assign", "POST", walker::InternalWalker.auto_assign_requests);
        
        print("✅ API endpoints configured");
        print(f"📡 Server running on: http://localhost:{config.server.port}");
        
        # Step 5: Start background services
        print("\n🔄 Starting background services...");
        
        # Start auto-assignment service if enabled
        if config.system.auto_assign_enabled:
            spawn walker::InternalWalker().auto_assign_requests();
            print("✅ Auto-assignment service started");
        
        # Schedule daily tasks
        std.schedule("0 6 * * *", spawn ::update_daily_metrics);  # 6 AM daily
        std.schedule("0 */30 * * * *", spawn walker::InternalWalker().auto_assign_requests);  # Every 30 minutes
        
        print("✅ Background services started");
        
        # Step 6: Display system info
        print("\n" + "="*60);
        print("✅ WASTELINK SYSTEM READY");
        print("="*60);
        print("\n📋 Available API Endpoints:");
        print("   POST /api/auth/register     - Register new user");
        print("   POST /api/auth/login        - User login");
        print("   GET  /api/auth/profile      - Get user profile");
        print("");
        print("   POST /api/resident/request  - Create pickup request");
        print("   GET  /api/resident/status   - Check request status");
        print("   GET  /api/resident/history  - Get request history");
        print("   POST /api/resident/pay      - Make payment (500 KES)");
        print("");
        print("   GET  /api/collector/pickups - Get available pickups");
        print("   POST /api/collector/accept  - Accept pickup request");
        print("   POST /api/collector/start   - Start pickup");
        print("   POST /api/collector/complete - Complete pickup");
        print("   POST /api/collector/location - Update location");
        print("   POST /api/collector/optimize - Optimize route (AI)");
        print("");
        print("   GET  /api/admin/overview    - System overview");
        print("   GET  /api/health            - System health check");
        print("="*60 + "\n");
        
        # Step 7: Keep system running
        print("🔄 System is running. Press Ctrl+C to stop.\n");
        
        # Main loop
        while true:
            # Perform periodic checks
            current_minute = std.now().minute;
            
            # Every hour, update metrics
            if current_minute == 0:
                spawn ::update_daily_metrics();
            
            # Sleep for 60 seconds
            std.sleep(60);
    }
    
    # ============ DAILY METRICS UPDATE ============
    can update_daily_metrics {
        """
        Update daily metrics table with today's statistics.
        """
        today = std.today();
        
        print(f"📊 Updating daily metrics for {today}...");
        
        try {
            db = std.db_connect(driver="sqlite", database=config.database.path);
            
            # Check if today's metrics already exist
            check_sql = "SELECT id FROM daily_metrics WHERE metric_date = ?";
            existing = db.query(check_sql, [today]);
            
            if existing.length > 0:
                print("✅ Today's metrics already updated");
                return {"success": true, "message": "Already updated"};
            
            # Calculate today's statistics
            stats_sql = """
                SELECT 
                    COUNT(DISTINCT CASE WHEN role = 'collector' AND is_available = TRUE THEN id END) as active_collectors,
                    COUNT(DISTINCT CASE WHEN role = 'resident' THEN id END) as active_residents,
                    COUNT(DISTINCT pr.id) as total_requests,
                    COUNT(DISTINCT CASE WHEN pr.status = 'completed' THEN pr.id END) as total_collections,
                    COALESCE(SUM(c.total_weight_kg), 0) as total_weight_kg,
                    COALESCE(SUM(c.earnings_amount), 0) as total_earnings,
                    COALESCE(AVG(
                        CASE 
                            WHEN pr.completed_at IS NOT NULL AND pr.assigned_at IS NOT NULL 
                            THEN (julianday(pr.completed_at) - julianday(pr.assigned_at)) * 1440
                            ELSE NULL
                        END
                    ), 0) as avg_collection_time_minutes,
                    CASE 
                        WHEN COUNT(DISTINCT pr.id) > 0 
                        THEN ROUND(
                            COUNT(DISTINCT CASE WHEN pr.status = 'completed' THEN pr.id END) * 100.0 / 
                            COUNT(DISTINCT pr.id), 
                            2
                        )
                        ELSE 0
                    END as completion_rate
                FROM users u
                LEFT JOIN pickup_requests pr ON DATE(pr.requested_at) = ? 
                LEFT JOIN collections c ON c.request_id = pr.id
                WHERE u.status = 'active'
            """;
            
            stats = db.query(stats_sql, [today]);
            
            if stats and stats.length > 0:
                stat = stats[0];
                
                insert_sql = """
                    INSERT INTO daily_metrics (
                        id, metric_date, total_requests, total_collections, 
                        total_weight_kg, total_earnings, active_collectors, 
                        active_residents, avg_collection_time_minutes, completion_rate
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
                
                db.execute(insert_sql, [
                    std.uuid4(),
                    today,
                    stat.total_requests or 0,
                    stat.total_collections or 0,
                    stat.total_weight_kg or 0.0,
                    stat.total_earnings or 0.0,
                    stat.active_collectors or 0,
                    stat.active_residents or 0,
                    stat.avg_collection_time_minutes or 0.0,
                    stat.completion_rate or 0.0
                ]);
                
                print(f"✅ Daily metrics updated: {stat.total_requests} requests, {stat.total_collections} collections");
                
                return {
                    "success": true,
                    "date": today,
                    "metrics": {
                        "requests": stat.total_requests,
                        "collections": stat.total_collections,
                        "earnings": stat.total_earnings
                    }
                };
            }
            
            return {"success": false, "error": "No statistics calculated"};
            
        } catch error:
            print(f"❌ Error updating daily metrics: {error}");
            return {"success": false, "error": str(error)};
    }
    
    # ============ SYSTEM RESET (DEVELOPMENT ONLY) ============
    can reset_system {
        """
        Reset the entire system (for development/testing only).
        WARNING: This will delete all data!
        """
        confirmation = context.confirmation;
        
        if confirmation != "YES_DELETE_ALL_DATA":
            report {
                "error": "Confirmation required",
                "message": "Send confirmation='YES_DELETE_ALL_DATA' to proceed"
            };
            disengage;
        
        print("⚠️ WARNING: Resetting entire system!");
        print("   This will delete ALL data!");
        
        try {
            db = std.db_connect(driver="sqlite", database=config.database.path);
            
            # Disable foreign keys temporarily
            db.execute("PRAGMA foreign_keys = OFF");
            
            # Delete all data (in correct order due to foreign keys)
            tables = [
                "earnings",
                "collections", 
                "notifications",
                "pickup_requests",
                "daily_metrics",
                "waste_pricing",
                "users"
            ];
            
            for table in tables:
                try {
                    db.execute(f"DELETE FROM {table}");
                    print(f"🗑️  Cleared table: {table}");
                } catch error:
                    print(f"⚠️  Could not clear {table}: {error}");
            
            # Re-enable foreign keys
            db.execute("PRAGMA foreign_keys = ON");
            
            # Recreate default data
            ::initialize_database();
            ::create_default_admin();
            
            print("✅ System reset complete!");
            print("   Database reinitialized with default data");
            
            return {
                "success": true,
                "message": "System reset complete",
                "timestamp": std.now()
            };
            
        } catch error:
            print(f"❌ System reset failed: {error}");
            return {"success": false, "error": str(error)};
    }
}

# ============ EXPORT MAIN WALKER ============
walker main = walker::WasteLinkSystem;

# ============ QUICK START HELPER ============
walker quickstart {
    """
    Quick start helper for first-time setup.
    """
    can setup with entry {
        print("🚀 WasteLink Quick Setup");
        print("="*50);
        
        # 1. Check configuration
        if not config:
            print("❌ Configuration not loaded");
            print("   Make sure config/jaseci.yaml exists");
            disengage;
        
        print(f"📁 Database: {config.database.path}");
        print(f"🌐 API Port: {config.server.port}");
        
        # 2. Initialize database
        print("\n🗄️ Initializing database...");
        db_result = spawn walker::WasteLinkSystem().initialize_database();
        
        if not db_result.success:
            print("❌ Database initialization failed!");
            disengage;
        
        # 3. Health check
        print("\n🔍 Running health check...");
        health = spawn walker::WasteLinkSystem().health_check();
        
        if health.healthy:
            print("✅ System is healthy!");
        else:
            print("⚠️ System has issues:");
            for msg in health.messages:
                print(f"   {msg}");
        
        # 4. Start the system
        print("\n🎬 Starting WasteLink system...");
        print("   Use: jac run jac_code/main.jac");
        print("\n💰 Pricing Model:");
        print("   Resident pays: 500 KES per collection");
        print("   Collector earns: 300 KES per collection");
        
        report {
            "success": true,
            "database_initialized": db_result.success,
            "system_healthy": health.healthy,
            "next_step": "Run: jac run jac_code/main.jac"
        };
    }
}