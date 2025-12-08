# User Management Nodes
graph WasteLinkUsers {
    
    # ============ BASE USER CLASS ============
    node User {
        has id: str;
        has email: str;
        has password_hash: str;
        has full_name: str;
        has phone: str, nullable;
        has role: str;  # resident, collector, admin
        has status: str = "active";
        has created_at: datetime;
        has last_login: datetime, nullable;
    }
    
    # ============ RESIDENT CLASS ============
    node Resident {
        has user_id: str;
        has apartment_id: str, nullable;
        
        # Location
        has latitude: float, nullable;
        has longitude: float, nullable;
        has address: str, nullable;
        
        # Waste History
        has total_requests: int = 0;
        has completed_requests: int = 0;
        has total_payments: float = 0.00;
        has rating: float = 5.0;
        
        # Status
        has account_status: str = "active";  # active, suspended, inactive
        
        # Preferences
        has preferences: dict = {
            "notification_email": true,
            "notification_sms": false
        };
    }
    
    # ============ COLLECTOR CLASS ============
    node Collector {
        has user_id: str;
        has employee_id: str, unique;
        
        # Location (for real-time tracking)
        has latitude: float, nullable;
        has longitude: float, nullable;
        has last_location_update: datetime, nullable;
        has address: str, nullable;
        
        # Status
        has is_available: bool = true;
        has work_status: str = "available";  # available, busy, off_duty
        has account_status: str = "active";
        
        # Performance Metrics
        has total_earnings: float = 0.00;
        has completed_pickups: int = 0;
        has rating: float = 5.0;
        has on_time_rate: float = 100.0;
        
        # Vehicle Details
        has vehicle_type: str = "truck";
        has vehicle_capacity: float = 100.0;
        has current_load: float = 0.0;
        
        # Waste History (track types collected)
        has waste_history: dict = {
            "plastic": 0,
            "paper": 0,
            "metal": 0,
            "glass": 0,
            "organic": 0,
            "mixed": 0
        };
    }
    
    # ============ ADMIN CLASS ============
    node Admin {
        has user_id: str;
        has permissions: list = ["view_reports", "manage_users"];
        has department: str, nullable;
    }
    
    # ============ APARTMENT CLASS ============
    node Apartment {
        has id: str;
        has name: str;
        has address: str;
        has latitude: float;
        has longitude: float;
        has manager_name: str, nullable;
        has manager_phone: str, nullable;
        has total_units: int;
    }
    
    # ============ EDGES ============
    edge lives_in {
        has unit_number: str;
        has floor: int;
        has moved_in: datetime = std.now();
    }
    
    edge manages {
        has role: str = "manager";
        has since: datetime = std.now();
    }
    
    edge employed_by {
        has employee_id: str;
        hired_date: datetime = std.now();
    }
}