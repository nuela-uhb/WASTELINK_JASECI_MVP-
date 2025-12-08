# Internal Utility Walkers
walker InternalWalker {
    
    # ============ AUTO-ASSIGN PENDING REQUESTS ============
    can auto_assign_requests {
        # Get all pending requests
        pending_requests = node::Request[status == "pending"];
        
        assigned_count = 0;
        for request in pending_requests:
            # Find nearest available collector
            collector_id = WasteLinkTools.find_nearest_collector(
                request.latitude,
                request.longitude
            );
            
            if collector_id:
                # Assign request
                request.collector_id = collector_id;
                request.status = "accepted";
                request.accepted_at = std.now();
                
                # Update collector
                collector = node::Collector[user_id == collector_id];
                if collector:
                    collector.current_load += 1;
                    if collector.current_load >= collector.vehicle_capacity:
                        collector.is_available = false;
                
                # Log status history
                request.status_history.append({
                    "status": "accepted",
                    "timestamp": std.now(),
                    "notes": "Auto-assigned by system"
                });
                
                assigned_count += 1;
                
                # Send notifications
                WasteLinkTools.create_notification(
                    collector_id,
                    "Auto-Assigned Task",
                    f"New pickup auto-assigned at {request.address}",
                    "task_assigned"
                );
                
                WasteLinkTools.create_notification(
                    request.resident_id,
                    "Collector Assigned",
                    "A collector has been auto-assigned to your request",
                    "collector_assigned"
                );
        
        report {
            "success": true,
            "assigned": assigned_count,
            "remaining_pending": pending_requests.length - assigned_count
        };
    }
    
    # ============ FIND NEAREST COLLECTOR ============
    can find_nearest_collector {
        lat = context.latitude;
        lng = context.longitude;
        
        nearest_id = WasteLinkTools.find_nearest_collector(lat, lng);
        
        if nearest_id:
            collector = node::Collector[user_id == nearest_id];
            collector_user = node::User[id == nearest_id];
            
            report {
                "success": true,
                "collector_id": nearest_id,
                "name": collector_user.full_name if collector_user else "Unknown",
                "distance": WasteLinkTools.calc_dist(lat, lng, collector.latitude, collector.longitude) if collector else 0,
                "is_available": collector.is_available if collector else false
            };
        else:
            report {
                "success": false,
                "message": "No available collectors found"
            };
    }
    
    # ============ SYSTEM HEALTH CHECK ============
    can health_check {
        # Check database
        db_ok = true;
        try {
            test = node::User[].length;
        } catch error:
            db_ok = false;
        
        # Check BYLLM
        llm_ok = true;
        try {
            test = WasteLinkTools.classify_waste_image("test");
        } catch error:
            llm_ok = false;
        
        # Get system stats
        total_users = node::User[].length;
        active_requests = node::Request[status in ["pending", "accepted", "in_progress"]].length;
        
        report {
            "success": true,
            "health": {
                "database": db_ok,
                "ai_service": llm_ok,
                "total_users": total_users,
                "active_requests": active_requests
            },
            "healthy": db_ok and llm_ok
        };
    }
}