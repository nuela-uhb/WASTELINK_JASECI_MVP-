import from datetime { datetime }

enum RequestStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    COMPLETED = "completed"
}

# Pickup request node
node PickupRequest {
    # Required fields
    has resident_name: str;
    has resident_phone: str;
    has latitude: float;
    has longitude: float;
    has address: str;
    has waste_type: str;

    # Optional fields with defaults
    has location_notes: str = "";
    has image_url: str | None = None;
    has status: RequestStatus = RequestStatus.PENDING;
    has assigned_collector_id: str = "";
    has assigned_at: str = "";
    has requested_at: str = str(datetime.now());
    has completed_at: str = "";
    has history: list[str] = [];
}

# Route node for optimized collector routing
node Route {
    has collector_id: str;
    has stops: list[dict];        # [{"request_id": str, "lat": float, "lon": float}]
    has distance_km: float = 0.0;
    has optimized_at: str = str(datetime.now());
}