# Base Graph Structure
graph WasteLinkBase {
    
    # Root node - system anchor
    node Root {
        has name: str = "WasteLink";
        has version: str = "1.0.0";
        has created_at: datetime = std.now();
    }
    
    # Audit Log for history tracking
    node AuditLog {
        has id: str;
        has action: str;
        has user_id: str;
        has details: str;
        has timestamp: datetime;
    }
}