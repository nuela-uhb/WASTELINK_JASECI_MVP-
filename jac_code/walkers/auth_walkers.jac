# Authentication Walkers
walker AuthWalker {
    
    # User Registration
    can register {
        email = context.email;
        password = context.password;
        full_name = context.full_name;
        role = context.role;
        phone = context.phone, nullable;
        
        # Check if exists
        existing = node::User[email == email];
        if existing.length > 0 {
            report {"success": false, "error": "Email already registered"};
            disengage;
        }
        
        # Create user
        user_id = std.uuid4();
        password_hash = std.bcrypt_hash(password);
        
        user = spawn node::User(
            id=user_id,
            email=email,
            password_hash=password_hash,
            full_name=full_name,
            phone=phone,
            role=role,
            created_at=std.now()
        );
        
        # Create role-specific node
        if role == "resident" {
            spawn node::Resident(user_id=user_id);
        } elif role == "collector" {
            spawn node::Collector(
                user_id=user_id,
                employee_id=f"COL{std.timestamp()}"
            );
        } elif role == "admin" {
            spawn node::Admin(user_id=user_id);
        }
        
        # Generate token
        token = std.jwt_encode({
            "user_id": user_id,
            "role": role,
            "exp": std.now() + std.hours(24)
        }, config.auth.jwt_secret);
        
        report {
            "success": true,
            "user_id": user_id,
            "token": token,
            "role": role
        };
    }
    
    # User Login
    can login {
        email = context.email;
        password = context.password;
        
        user = node::User[email == email];
        if user.length == 0 {
            report {"success": false, "error": "Invalid credentials"};
            disengage;
        }
        
        user = user[0];
        
        if not std.bcrypt_verify(password, user.password_hash) {
            report {"success": false, "error": "Invalid credentials"};
            disengage;
        }
        
        # Update last login
        user.last_login = std.now();
        
        # Generate token
        token = std.jwt_encode({
            "user_id": user.id,
            "role": user.role,
            "exp": std.now() + std.hours(24)
        }, config.auth.jwt_secret);
        
        report {
            "success": true,
            "token": token,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.full_name,
                "role": user.role
            }
        };
    }
    
    # Get User Profile
    can get_profile {
        user_id = context.user_id;
        
        user = node::User[id == user_id];
        if not user {
            report {"success": false, "error": "User not found"};
            disengage;
        }
        
        profile = {
            "id": user.id,
            "email": user.email,
            "name": user.full_name,
            "phone": user.phone,
            "role": user.role,
            "status": user.status
        };
        
        # Add role-specific data
        if user.role == "resident" {
            resident = node::Resident[user_id == user_id];
            if resident {
                profile["location"] = {
                    "lat": resident.latitude,
                    "lng": resident.longitude,
                    "address": resident.address
                };
                profile["stats"] = {
                    "total_requests": resident.total_requests,
                    "completed_requests": resident.completed_requests,
                    "total_payments": resident.total_payments,
                    "rating": resident.rating
                };
            }
        } elif user.role == "collector" {
            collector = node::Collector[user_id == user_id];
            if collector {
                profile["location"] = {
                    "lat": collector.latitude,
                    "lng": collector.longitude,
                    "address": collector.address
                };
                profile["status"] = {
                    "is_available": collector.is_available,
                    "work_status": collector.work_status
                };
                profile["stats"] = {
                    "total_earnings": collector.total_earnings,
                    "completed_pickups": collector.completed_pickups,
                    "rating": collector.rating,
                    "on_time_rate": collector.on_time_rate
                };
                profile["vehicle"] = {
                    "type": collector.vehicle_type,
                    "capacity": collector.vehicle_capacity,
                    "current_load": collector.current_load
                };
            }
        }
        
        report {"success": true, "profile": profile};
    }
}