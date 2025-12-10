# Base User node
node User {
    has email: str;
    has password_hash: str;
    has full_name: str;
    has role: str = "";
    has phone: str = "";
    has profile_image: str = "";
    has latitude: float = 0.0;
    has longitude: float = 0.0;
    has address: str = "";
    has status: str = "active";
}

# Resident node (wraps a User)
node Resident {
    has base_user: User;
    has role: str = "resident";
}

# Collector node (wraps a User)
node Collector {
    has base_user: User;
    has role: str = "collector";
    has is_available: bool = true;
    has total_earnings: float = 0.0;
    has completed_pickups: int = 0;
    has rating: float = 0.0;
    has vehicle_type: str = "";
    has capacity_kg: float = 0.0;
}

# Admin node (wraps a User)
node Admin {
    has base_user: User;
    has role: str = "admin";
}
