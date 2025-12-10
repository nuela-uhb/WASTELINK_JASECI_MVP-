node Request {
    # Required fields
    has resident_id: str;
    has latitude: float;
    has longitude: float;
    has address: str;

    # Optional fields with defaults
    has location_notes: str = "";
    has status: str = "pending";          # pending, assigned, arrived, completed, cancelled
    has assigned_collector_id: str = "";  # default empty string instead of None
    has assigned_at: str = "";
    has requested_at: str = "";
    has completed_at: str = "";
}

node Collection {
    # Required fields
    has request_id: str;
    has collector_id: str;
    has total_weight_kg: float;

    # Optional fields with defaults
    has waste_photo_url: str = "";
    has categories: dict = {};            # e.g., {"plastic": 5.2, "metal": 2.1}
    has earnings_amount: float = 300;     # default as per your spec
    has payment_status: str = "pending";  # pending, paid
    has collected_at: str = "";
    has notes: str = "";
}
