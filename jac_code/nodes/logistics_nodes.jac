# Waste Logistics Nodes
graph WasteLinkLogistics {
    
    # ============ REQUEST STATUS ENUM ============
    # Status model: pending → accepted → in_progress → completed → cancelled
    
    # ============ PICKUP REQUEST CLASS ============
    node Request {
        has id: str;
        has resident_id: str;
        has collector_id: str, nullable;
        
        # Waste Details
        has waste_photo_url: str, nullable;
        has waste_type: str = "mixed";
        has waste_description: str, nullable;
        
        # Location
        has latitude: float;
        has longitude: float;
        has address: str;
        has location_notes: str, nullable;
        
        # Status (pending, accepted, in_progress, completed, cancelled)
        has status: str = "pending";
        
        # Fixed Pricing
        has resident_payment: float = 500;
        has collector_earnings: float = 300;
        has payment_status: str = "pending";  # pending, paid
        
        # Timing
        has requested_at: datetime;
        has accepted_at: datetime, nullable;
        has started_at: datetime, nullable;
        has completed_at: datetime, nullable;
        has cancelled_at: datetime, nullable;
        
        # History Logging
        has status_history: list = [];
        
        index idx_status on [status];
        index idx_resident on [resident_id];
        index idx_collector on [collector_id];
    }
    
    # ============ ROUTE CLASS ============
    node Route {
        has id: str;
        has collector_id: str;
        has date: date;
        
        # AI-Optimized Sequence
        has request_ids: list;  # IDs in optimized order
        has optimized_sequence: list;
        
        # Map Data
        has map_url: str, nullable;
        has static_map_url: str, nullable;
        has polyline: str, nullable;
        
        # Metrics
        has total_distance_km: float;
        has estimated_minutes: float;
        has actual_minutes: float, nullable;
        
        # Status
        has status: str = "planned";  # planned, active, completed
        
        index idx_collector_date on [collector_id, date];
    }
    
    # ============ NOTIFICATION CLASS ============
    node Notification {
        has id: str;
        has user_id: str;
        has title: str;
        has message: str;
        has type: str;  # new_request, request_accepted, pickup_completed
        has is_read: bool = false;
        has created_at: datetime;
        
        index idx_user on [user_id, is_read];
    }
    
    # ============ PAYMENT CLASS ============
    node Payment {
        has id: str;
        has request_id: str;
        has resident_id: str;
        has collector_id: str;
        has amount: float = 500;
        has collector_amount: float = 300;
        has system_fee: float = 200;
        has status: str = "pending";
        has created_at: datetime;
        
        index idx_request on [request_id];
    }
    
    # ============ EDGES ============
    edge creates {
        has priority: int = 1;
    }
    
    edge assigned_to {
        has distance_km: float;
    }
    
    edge completed {
        has rating: int, nullable;
    }
}