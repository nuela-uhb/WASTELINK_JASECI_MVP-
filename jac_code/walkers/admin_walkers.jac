# Admin Walkers
walker AdminWalker {
    
    # ============ GET SYSTEM OVERVIEW ============
    can get_system_overview {
        admin_id = context.user_id;
        
        # Verify admin
        admin = node::Admin[user_id == admin_id];
        if not admin:
            report {"success": false, "error": "Admin access required"};
            disengage;
        
        # Get counts
        total_users = node::User[].length;
        residents = node::User[role == "resident"].length;
        collectors = node::User[role == "collector"].length;
        admins = node::User[role == "admin"].length;
        
        # Get request counts
        total_requests = node::Request[].length;
        pending = node::Request[status == "pending"].length;
        accepted = node::Request[status == "accepted"].length;
        in_progress = node::Request[status == "in_progress"].length;
        completed = node::Request[status == "completed"].length;
        
        # Calculate financials
        total_payments = node::Payment[status == "completed"].length * 500;
        total_collector_earnings = node::Payment[status == "completed"].length * 300;
        total_system_revenue = node::Payment[status == "completed"].length * 200;
        
        # Today's stats
        today = std.today();
        today_requests = node::Request[date(requested_at) == today].length;
        today_completed = node::Request[
            status == "completed" and 
            date(completed_at) == today
        ].length;
        
        # Active collectors
        active_collectors = node::Collector[is_available == true].length;
        
        report {
            "success": true,
            "overview": {
                "users": {
                    "total": total_users,
                    "residents": residents,
                    "collectors": collectors,
                    "admins": admins,
                    "active_collectors": active_collectors
                },
                "requests": {
                    "total": total_requests,
                    "pending": pending,
                    "accepted": accepted,
                    "in_progress": in_progress,
                    "completed": completed,
                    "completion_rate": round((completed / total_requests * 100) if total_requests > 0 else 0, 1)
                },
                "financials": {
                    "total_payments": total_payments,
                    "collector_earnings": total_collector_earnings,
                    "system_revenue": total_system_revenue
                },
                "today": {
                    "requests": today_requests,
                    "completed": today_completed
                }
            }
        };
    }
    
    # ============ MANAGE USERS ============
    can manage_users {
        admin_id = context.user_id;
        action = context.action;  # "activate", "deactivate", "suspend"
        user_id = context.user_id;
        
        # Verify admin
        admin = node::Admin[user_id == admin_id];
        if not admin:
            report {"success": false, "error": "Admin access required"};
            disengage;
        
        user = node::User[id == user_id];
        if not user:
            report {"success": false, "error": "User not found"};
            disengage;
        
        if action == "activate":
            user.status = "active";
            message = "User activated";
        elif action == "deactivate":
            user.status = "inactive";
            message = "User deactivated";
        elif action == "suspend":
            user.status = "suspended";
            message = "User suspended";
        else:
            report {"success": false, "error": "Invalid action"};
            disengage;
        
        # Update role-specific status
        if user.role == "resident":
            resident = node::Resident[user_id == user_id];
            if resident:
                resident.account_status = user.status;
        elif user.role == "collector":
            collector = node::Collector[user_id == user_id];
            if collector:
                collector.account_status = user.status;
                if user.status != "active":
                    collector.is_available = false;
        
        report {
            "success": true,
            "message": message,
            "user_id": user_id,
            "status": user.status
        };
    }
}