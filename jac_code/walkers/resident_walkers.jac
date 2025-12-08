# Resident Walkers
walker ResidentWalker {
    
    # ============ CREATE NEW WASTE PICKUP REQUEST ============
    can create_request {
        """
        Define "create_request" node/action
        Save request info (resident, waste_type, location, timestamp)
        Return confirmation response
        """
        resident_id = context.user_id;
        latitude = context.latitude;
        longitude = context.longitude;
        address = context.address;
        waste_photo_url = context.waste_photo_url, nullable;
        waste_description = context.description, nullable;
        
        # Validate required fields
        if not latitude or not longitude or not address:
            report {"success": false, "error": "Location and address are required"};
            disengage;
        
        # Create request ID
        request_id = std.uuid4();
        
        # Use AI to classify waste if photo provided
        waste_type = "mixed";  # Default
        if waste_photo_url:
            try {
                classification = WasteLinkTools.classify_waste_image(waste_photo_url);
                waste_type = classification.lower();
                print(f"AI Classification: {waste_type}");
            } catch error:
                waste_type = "mixed";
        
        # Create request node
        request = spawn node::Request(
            id=request_id,
            resident_id=resident_id,
            latitude=latitude,
            longitude=longitude,
            address=address,
            waste_photo_url=waste_photo_url,
            waste_type=waste_type,
            waste_description=waste_description,
            resident_payment=500,
            collector_earnings=300,
            requested_at=std.now(),
            status="pending"
        );
        
        # Update resident stats
        resident = node::Resident[user_id == resident_id];
        if resident:
            resident.total_requests += 1;
            
            # Update resident location if not set
            if not resident.latitude:
                resident.latitude = latitude;
                resident.longitude = longitude;
                resident.address = address;
        
        # Try auto-assign collector
        collector_id = "";
        if config.system.auto_assign_enabled:
            collector_id = WasteLinkTools.find_nearest_collector(latitude, longitude);
            
            if collector_id:
                # Update request status to accepted
                request.collector_id = collector_id;
                request.status = "accepted";
                request.accepted_at = std.now();
                
                # Update collector
                collector = node::Collector[user_id == collector_id];
                if collector:
                    collector.current_load += 1;
                    if collector.current_load >= collector.vehicle_capacity:
                        collector.is_available = false;
                
                # Send notification to collector
                WasteLinkTools.create_notification(
                    collector_id,
                    "New Pickup Request",
                    f"New waste pickup at {address}. Waste type: {waste_type}",
                    "new_request"
                );
        
        # Send notification to resident
        WasteLinkTools.create_notification(
            resident_id,
            "Request Created",
            f"Your waste pickup request has been created. Request ID: {request_id}",
            "request_created"
        );
        
        # Log status history
        request.status_history.append({
            "status": "pending",
            "timestamp": std.now(),
            "notes": "Request created"
        });
        
        # Return confirmation response
        report {
            "success": true,
            "request_id": request_id,
            "status": request.status,
            "waste_type": waste_type,
            "payment_amount": 500,
            "collector_assigned": collector_id if collector_id else "Pending assignment",
            "estimated_wait": "15-30 minutes" if collector_id else "30-60 minutes"
        };
    }
    
    # ============ GET REQUEST STATUS ============
    can get_status {
        """
        Add request status model (pending, accepted, completed)
        Build "get_status" action
        Add history logging
        """
        resident_id = context.user_id;
        request_id = context.request_id;
        
        # Find request
        request = node::Request[id == request_id and resident_id == resident_id];
        if not request:
            report {"success": false, "error": "Request not found"};
            disengage;
        
        # Get collector info if assigned
        collector_info = {};
        if request.collector_id:
            collector = node::Collector[user_id == request.collector_id];
            collector_user = node::User[id == request.collector_id];
            
            if collector and collector_user:
                collector_info = {
                    "id": request.collector_id,
                    "name": collector_user.full_name,
                    "phone": collector_user.phone,
                    "vehicle": collector.vehicle_type,
                    "rating": collector.rating,
                    "is_available": collector.is_available
                };
                
                # Get collector location for map
                if collector.latitude:
                    collector_info["location"] = {
                        "lat": collector.latitude,
                        "lng": collector.longitude
                    };
        
        # Generate map URL if locations available
        map_url = null;
        if request.collector_id and collector and collector.latitude:
            markers = [
                {
                    "lat": request.latitude,
                    "lng": request.longitude,
                    "label": "R",
                    "color": "red"
                },
                {
                    "lat": collector.latitude,
                    "lng": collector.longitude,
                    "label": "C",
                    "color": "blue"
                }
            ];
            
            # Generate static map (requires Google Maps API)
            # map_url = WasteLinkTools.generate_static_map(request.latitude, request.longitude, markers);
        
        # Return status with history
        report {
            "success": true,
            "request": {
                "id": request.id,
                "status": request.status,
                "waste_type": request.waste_type,
                "address": request.address,
                "payment_amount": 500,
                "payment_status": request.payment_status,
                "requested_at": request.requested_at,
                "accepted_at": request.accepted_at,
                "started_at": request.started_at,
                "completed_at": request.completed_at
            },
            "collector": collector_info,
            "status_history": request.status_history,
            "map": map_url
        };
    }
    
    # ============ GET REQUEST HISTORY ============
    can get_history {
        resident_id = context.user_id;
        limit = context.limit or 20;
        offset = context.offset or 0;
        
        # Get requests with pagination
        requests = node::Request[resident_id == resident_id]
                   .order_by(requested_at.desc())
                   .skip(offset)
                   .limit(limit);
        
        # Format history
        history = [];
        for request in requests:
            history.append({
                "id": request.id,
                "status": request.status,
                "waste_type": request.waste_type,
                "address": request.address,
                "payment_amount": 500,
                "payment_status": request.payment_status,
                "requested_at": request.requested_at,
                "completed_at": request.completed_at,
                "collector_assigned": request.collector_id != null
            });
        
        # Get resident stats
        resident = node::Resident[user_id == resident_id];
        
        report {
            "success": true,
            "history": history,
            "stats": {
                "total_requests": resident.total_requests if resident else 0,
                "completed_requests": resident.completed_requests if resident else 0,
                "total_payments": resident.total_payments if resident else 0
            },
            "pagination": {
                "limit": limit,
                "offset": offset,
                "total": node::Request[resident_id == resident_id].length
            }
        };
    }
    
    # ============ MAKE PAYMENT ============
    can make_payment {
        resident_id = context.user_id;
        request_id = context.request_id;
        
        # Find completed request
        request = node::Request[
            id == request_id and 
            resident_id == resident_id and
            status == "completed"
        ];
        
        if not request:
            report {"success": false, "error": "Request not found or not completed"};
            disengage;
        
        # Check if already paid
        existing_payment = node::Payment[request_id == request_id];
        if existing_payment:
            report {"success": false, "error": "Payment already made"};
            disengage;
        
        # Create payment record
        payment = spawn node::Payment(
            id=std.uuid4(),
            request_id=request_id,
            resident_id=resident_id,
            collector_id=request.collector_id,
            amount=500,
            collector_amount=300,
            system_fee=200,
            status="completed",
            created_at=std.now()
        );
        
        # Update request payment status
        request.payment_status = "paid";
        
        # Update collector earnings
        if request.collector_id:
            collector = node::Collector[user_id == request.collector_id];
            if collector:
                collector.total_earnings += 300;
                
                # Update waste history
                waste_type = request.waste_type;
                if waste_type in collector.waste_history:
                    collector.waste_history[waste_type] += 1;
                else:
                    collector.waste_history["mixed"] += 1;
        
        # Update resident payments
        resident = node::Resident[user_id == resident_id];
        if resident:
            resident.total_payments += 500;
            resident.completed_requests += 1;
        
        report {
            "success": true,
            "message": "Payment completed",
            "payment_id": payment.id,
            "amount": 500,
            "collector_earned": 300
        };
    }
}