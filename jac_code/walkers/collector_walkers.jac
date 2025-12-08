# Collector Walkers
walker CollectorWalker {
    
    # ============ GET AVAILABLE PICKUPS ============
    can get_available_pickups {
        """
        Fetch pending pickup requests
        Create "accept_request" node/action
        Update status: "pending → accepted"
        """
        collector_id = context.user_id;
        
        # Get collector location
        collector = node::Collector[user_id == collector_id];
        if not collector:
            report {"success": false, "error": "Collector not found"};
            disengage;
        
        # Get pending requests
        pending_requests = node::Request[status == "pending"];
        
        # Filter by distance if collector has location
        nearby_requests = [];
        if collector.latitude:
            for request in pending_requests:
                distance = WasteLinkTools.calc_dist(
                    collector.latitude, collector.longitude,
                    request.latitude, request.longitude
                );
                
                if distance <= config.system.max_distance_km:
                    request_data = {
                        "id": request.id,
                        "address": request.address,
                        "distance_km": round(distance, 2),
                        "waste_type": request.waste_type,
                        "requested_at": request.requested_at,
                        "resident_id": request.resident_id
                    };
                    nearby_requests.append(request_data);
            
            # Sort by distance
            nearby_requests = sorted(nearby_requests, key=lambda x: x["distance_km"]);
        else:
            # Return all pending if no location
            for request in pending_requests:
                nearby_requests.append({
                    "id": request.id,
                    "address": request.address,
                    "waste_type": request.waste_type,
                    "requested_at": request.requested_at
                });
        
        # Get assigned requests
        assigned_requests = node::Request[
            collector_id == collector_id and
            status in ["accepted", "in_progress"]
        ];
        
        # Format assigned requests
        formatted_assigned = [];
        for request in assigned_requests:
            formatted_assigned.append({
                "id": request.id,
                "address": request.address,
                "status": request.status,
                "waste_type": request.waste_type,
                "earnings": 300,
                "requested_at": request.requested_at,
                "accepted_at": request.accepted_at
            });
        
        report {
            "success": true,
            "available_pickups": {
                "nearby": nearby_requests,
                "count": nearby_requests.length
            },
            "assigned_pickups": {
                "list": formatted_assigned,
                "count": assigned_requests.length
            },
            "collector_status": {
                "is_available": collector.is_available,
                "current_load": collector.current_load,
                "capacity": collector.vehicle_capacity,
                "total_earnings": collector.total_earnings
            }
        };
    }
    
    # ============ ACCEPT REQUEST ============
    can accept_request {
        collector_id = context.user_id;
        request_id = context.request_id;
        
        # Find pending request
        request = node::Request[id == request_id and status == "pending"];
        if not request:
            report {"success": false, "error": "Request not available"};
            disengage;
        
        # Check collector availability
        collector = node::Collector[user_id == collector_id];
        if not collector or not collector.is_available:
            report {"success": false, "error": "Collector not available"};
            disengage;
        
        # Check capacity
        if collector.current_load >= collector.vehicle_capacity:
            report {"success": false, "error": "Collector at full capacity"};
            disengage;
        
        # Calculate distance
        distance = 0;
        if collector.latitude:
            distance = WasteLinkTools.calc_dist(
                collector.latitude, collector.longitude,
                request.latitude, request.longitude
            );
        
        # Update request status to accepted
        request.collector_id = collector_id;
        request.status = "accepted";
        request.accepted_at = std.now();
        
        # Log status history
        request.status_history.append({
            "status": "accepted",
            "timestamp": std.now(),
            "notes": f"Accepted by collector {collector_id}",
            "distance_km": distance
        });
        
        # Update collector
        collector.current_load += 1;
        if collector.current_load >= collector.vehicle_capacity:
            collector.is_available = false;
        
        # Send notifications
        WasteLinkTools.create_notification(
            collector_id,
            "Request Accepted",
            f"You accepted pickup at {request.address}. Earnings: 300 KES",
            "request_accepted"
        );
        
        WasteLinkTools.create_notification(
            request.resident_id,
            "Collector Assigned",
            f"A collector has accepted your pickup request at {request.address}",
            "collector_assigned"
        );
        
        report {
            "success": true,
            "message": "Request accepted",
            "request_id": request_id,
            "earnings": 300,
            "distance_km": round(distance, 2),
            "collector_load": collector.current_load
        };
    }
    
    # ============ START PICKUP ============
    can start_pickup {
        collector_id = context.user_id;
        request_id = context.request_id;
        
        request = node::Request[
            id == request_id and 
            collector_id == collector_id and
            status == "accepted"
        ];
        
        if not request:
            report {"success": false, "error": "Request not found or not accepted"};
            disengage;
        
        # Update status to in_progress
        request.status = "in_progress";
        request.started_at = std.now();
        
        # Log status history
        request.status_history.append({
            "status": "in_progress",
            "timestamp": std.now(),
            "notes": "Collection started"
        });
        
        # Send notification to resident
        collector_user = node::User[id == collector_id];
        if collector_user:
            WasteLinkTools.create_notification(
                request.resident_id,
                "Collection Started",
                f"Collector {collector_user.full_name} has started your waste collection",
                "collection_started"
            );
        
        report {
            "success": true,
            "message": "Pickup started",
            "request_id": request_id,
            "started_at": request.started_at
        };
    }
    
    # ============ COMPLETE PICKUP ============
    can complete_pickup {
        collector_id = context.user_id;
        request_id = context.request_id;
        
        request = node::Request[
            id == request_id and 
            collector_id == collector_id and
            status == "in_progress"
        ];
        
        if not request:
            report {"success": false, "error": "Request not found or not in progress"};
            disengage;
        
        # Update status to completed
        request.status = "completed";
        request.completed_at = std.now();
        
        # Log status history
        request.status_history.append({
            "status": "completed",
            "timestamp": std.now(),
            "notes": "Collection completed"
        });
        
        # Update collector
        collector = node::Collector[user_id == collector_id];
        if collector:
            collector.completed_pickups += 1;
            collector.current_load -= 1;
            
            # Make available if under capacity
            if collector.current_load < collector.vehicle_capacity:
                collector.is_available = true;
            
            # Update on-time rate (simple calculation)
            if request.accepted_at:
                hours_to_complete = (request.completed_at - request.accepted_at).total_hours();
                was_on_time = hours_to_complete <= 2;
                
                # Update rating
                total_completed = collector.completed_pickups;
                current_rate = collector.on_time_rate;
                new_rate = ((current_rate * (total_completed - 1)) + (100 if was_on_time else 0)) / total_completed;
                collector.on_time_rate = round(new_rate, 1);
        
        # Update resident
        resident = node::Resident[user_id == request.resident_id];
        if resident:
            resident.completed_requests += 1;
        
        # Send notifications
        WasteLinkTools.create_notification(
            request.resident_id,
            "Pickup Completed",
            "Your waste collection is complete. Please make payment of 500 KES.",
            "pickup_completed"
        );
        
        report {
            "success": true,
            "message": "Pickup completed",
            "request_id": request_id,
            "earnings_pending": 300,
            "completed_at": request.completed_at
        };
    }
    
    # ============ UPDATE LOCATION ============
    can update_location {
        collector_id = context.user_id;
        latitude = context.latitude;
        longitude = context.longitude;
        address = context.address, nullable;
        
        # Validate coordinates
        if not (-90 <= latitude <= 90) or not (-180 <= longitude <= 180):
            report {"success": false, "error": "Invalid coordinates"};
            disengage;
        
        collector = node::Collector[user_id == collector_id];
        if collector:
            collector.latitude = latitude;
            collector.longitude = longitude;
            collector.last_location_update = std.now();
            
            if address:
                collector.address = address;
        
        report {
            "success": true,
            "message": "Location updated",
            "location": {
                "lat": latitude,
                "lng": longitude
            },
            "timestamp": std.now()
        };
    }
    
    # ============ OPTIMIZE ROUTE (AI) ============
    can optimize_route {
        collector_id = context.user_id;
        
        # Get assigned requests
        assigned_requests = node::Request[
            collector_id == collector_id and
            status in ["accepted", "in_progress"]
        ];
        
        if assigned_requests.length == 0:
            report {"success": false, "message": "No assigned tasks to optimize"};
            disengage;
        
        # Get collector location
        collector = node::Collector[user_id == collector_id];
        if not collector or not collector.latitude:
            report {"success": false, "error": "Collector location not set"};
            disengage;
        
        # Prepare stops for AI optimization
        stops = [];
        for request in assigned_requests:
            stops.append({
                "id": request.id,
                "lat": request.latitude,
                "lng": request.longitude,
                "address": request.address,
                "status": request.status
            });
        
        # Use AI to optimize route
        optimized_result = {};
        try {
            optimized_result = WasteLinkTools.calc_optimal_route(stops);
            print(f"AI Route Optimization: {optimized_result}");
        } catch error:
            print(f"AI optimization failed: {error}");
            # Fallback: sort by distance
            for stop in stops:
                stop.distance = WasteLinkTools.calc_dist(
                    collector.latitude, collector.longitude,
                    stop.lat, stop.lng
                );
            
            stops = sorted(stops, key=lambda x: x.distance);
            optimized_result = {
                "sequence": [stop["id"] for stop in stops],
                "total_distance_km": sum([stop["distance"] for stop in stops]),
                "estimated_minutes": len(stops) * 15
            };
        
        # Create or update route
        route_id = std.uuid4();
        route = spawn node::Route(
            id=route_id,
            collector_id=collector_id,
            date=std.today(),
            request_ids=[r.id for r in assigned_requests],
            optimized_sequence=optimized_result.sequence,
            total_distance_km=optimized_result.total_distance_km,
            estimated_minutes=optimized_result.estimated_minutes,
            status="planned"
        );
        
        report {
            "success": true,
            "route_id": route_id,
            "optimization": {
                "total_stops": len(optimized_result.sequence),
                "total_distance_km": optimized_result.total_distance_km,
                "estimated_minutes": optimized_result.estimated_minutes
            },
            "stops": optimized_result.sequence
        };
    }
    
    # ============ TOGGLE AVAILABILITY ============
    can toggle_availability {
        collector_id = context.user_id;
        is_available = context.is_available;
        
        collector = node::Collector[user_id == collector_id];
        if collector:
            collector.is_available = is_available;
            collector.work_status = "available" if is_available else "busy";
        
        report {
            "success": true,
            "is_available": is_available,
            "work_status": collector.work_status if collector else "unknown"
        };
    }
}