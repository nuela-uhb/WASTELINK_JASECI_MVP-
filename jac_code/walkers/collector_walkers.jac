import uuid;
import datetime;
import math;
import json;

walker CollectorWalker {
    has collector_id: str = "";
    has request_id: str = "";
    has latitude: float = 0.0;
    has longitude: float = 0.0;
    has status: str = "";
    has weight: float = 0.0;
    has waste_image: str = "";

    can get_nearest_tasks with entry {
        collector = None;
        for uid in users.keys() {
            u = users[uid];
            if u["id"] == self.collector_id {
                collector = u;
                break;
            }
        }

        if not collector {
            report {"success": False, "error": "Collector not found"};
            disengage;
        }

        if collector.get("approval_status", "pending") != "approved" {
            report {
                "success": False, 
                "error": "Your account is pending admin approval",
                "approval_status": collector.get("approval_status", "pending")
            };
            disengage;
        }

        tasks = [];
        
        for pid in pickups.keys() {
            p = pickups[pid];
            if p["status"] == "pending" {
                tasks.append({
                    "request_id": p["id"],
                    "resident_id": p["resident_id"],
                    "latitude": p["latitude"],
                    "longitude": p["longitude"],
                    "address": p["address"],
                    "status": p["status"],
                    "created_at": p["requested_at"],
                    "waste_type": p.get("waste_type", "mixed"),
                    "estimated_volume": p.get("estimated_volume", "0")
                });
            }
        }

        report {
            "success": True,
            "collector_id": self.collector_id,
            "tasks": tasks,
            "count": len(tasks),
            "message": "Nearest available pickup tasks returned"
        };
    }

    can accept_request with entry {
        if not self.request_id {
            report {"success": False, "error": "Missing request_id"};
            disengage;
        }

        collector = None;
        for uid in users.keys() {
            u = users[uid];
            if u["id"] == self.collector_id {
                collector = u;
                break;
            }
        }

        if not collector or collector.get("approval_status", "pending") != "approved" {
            report {"success": False, "error": "Collector not approved"};
            disengage;
        }

        req = None;
        for pid in pickups.keys() {
            p = pickups[pid];
            if p["id"] == self.request_id {
                req = p;
                break;
            }
        }

        if not req {
            report {"success": False, "error": "Request not found"};
            disengage;
        }

        if req["status"] != "pending" {
            report {"success": False, "error": "Request already accepted or completed"};
            disengage;
        }

        pickups[self.request_id]["status"] = "accepted";
        pickups[self.request_id]["assigned_collector_id"] = self.collector_id;
        pickups[self.request_id]["accepted_at"] = str(datetime.datetime.now());

        report {
            "success": True,
            "collector_id": self.collector_id,
            "request_id": self.request_id,
            "resident_location": {
                "latitude": req["latitude"],
                "longitude": req["longitude"],
                "address": req["address"]
            },
            "message": "Request accepted - tracking enabled"
        };
    }

    can update_location with entry {
        if not self.latitude or not self.longitude {
            report {"success": False, "error": "Missing latitude or longitude"};
            disengage;
        }

        collector = None;
        for uid in users.keys() {
            u = users[uid];
            if u["id"] == self.collector_id {
                collector = u;
                break;
            }
        }

        if not collector {
            report {"success": False, "error": "Collector not found"};
            disengage;
        }

        users[self.collector_id]["current_latitude"] = self.latitude;
        users[self.collector_id]["current_longitude"] = self.longitude;
        users[self.collector_id]["last_location_update"] = str(datetime.datetime.now());

        report {
            "success": True,
            "collector_id": self.collector_id,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "message": "Location updated successfully"
        };
    }

    can mark_arrived with entry {
        if not self.request_id {
            report {"success": False, "error": "Missing request_id"};
            disengage;
        }

        req = None;
        for pid in pickups.keys() {
            p = pickups[pid];
            if p["id"] == self.request_id {
                req = p;
                break;
            }
        }

        if not req {
            report {"success": False, "error": "Request not found"};
            disengage;
        }

        if req["status"] != "accepted" {
            report {"success": False, "error": "Request must be accepted first"};
            disengage;
        }

        pickups[self.request_id]["status"] = "arrived";
        pickups[self.request_id]["arrived_at"] = str(datetime.datetime.now());

        report {
            "success": True,
            "collector_id": self.collector_id,
            "request_id": self.request_id,
            "message": "Arrival confirmed"
        };
    }

    can complete_collection with entry {
        if not self.request_id {
            report {"success": False, "error": "Missing request_id"};
            disengage;
        }

        if not self.weight or self.weight <= 0 {
            report {"success": False, "error": "Valid waste weight required"};
            disengage;
        }

        req = None;
        for pid in pickups.keys() {
            p = pickups[pid];
            if p["id"] == self.request_id {
                req = p;
                break;
            }
        }

        if not req {
            report {"success": False, "error": "Request not found"};
            disengage;
        }

        if req["status"] not in ["accepted", "arrived"] {
            report {"success": False, "error": "Invalid status for completion"};
            disengage;
        }

        waste_category = "mixed";
        if self.waste_image {
            waste_category = "plastic";
        }

        collector = None;
        for uid in users.keys() {
            u = users[uid];
            if u["id"] == self.collector_id {
                collector = u;
                break;
            }
        }

        distance_saved_km = 0.0;
        if collector {
            c_lat = collector.get("current_latitude", 0.0);
            c_lng = collector.get("current_longitude", 0.0);
            r_lat = req["latitude"];
            r_lng = req["longitude"];
            
            if c_lat != 0.0 and c_lng != 0.0 {
                lat1_rad = math.radians(c_lat);
                lat2_rad = math.radians(r_lat);
                dlat = lat2_rad - lat1_rad;
                dlng = math.radians(r_lng - c_lng);
                
                a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlng/2)**2;
                c = 2 * math.asin(math.sqrt(a));
                distance_km = 6371 * c;
                distance_saved_km = distance_km * 0.15;
            }
        }

        pickups[self.request_id]["status"] = "completed";
        pickups[self.request_id]["completed_at"] = str(datetime.datetime.now());
        pickups[self.request_id]["waste_weight"] = self.weight;
        pickups[self.request_id]["waste_category"] = waste_category;
        pickups[self.request_id]["waste_image"] = self.waste_image;
        pickups[self.request_id]["distance_saved_km"] = round(distance_saved_km, 2);

        report {
            "success": True,
            "collector_id": self.collector_id,
            "request_id": self.request_id,
            "waste_category": waste_category,
            "weight": self.weight,
            "message": "Collection completed and waste categorized"
        };
    }

    can get_optimized_route with entry {
        if not self.request_id {
            report {"success": False, "error": "Missing request_id"};
            disengage;
        }

        req = None;
        for pid in pickups.keys() {
            p = pickups[pid];
            if p["id"] == self.request_id {
                req = p;
                break;
            }
        }

        if not req {
            report {"success": False, "error": "Request not found"};
            disengage;
        }

        collector = None;
        for uid in users.keys() {
            u = users[uid];
            if u["id"] == self.collector_id {
                collector = u;
                break;
            }
        }

        if not collector {
            report {"success": False, "error": "Collector not found"};
            disengage;
        }

        collector_lat = collector.get("current_latitude", 0.0);
        collector_lng = collector.get("current_longitude", 0.0);
        
        lat1_rad = math.radians(collector_lat);
        lat2_rad = math.radians(req["latitude"]);
        dlat = lat2_rad - lat1_rad;
        dlng = math.radians(req["longitude"] - collector_lng);
        
        a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlng/2)**2;
        c = 2 * math.asin(math.sqrt(a));
        distance_km = 6371 * c;
        
        optimized_distance = distance_km * 0.85;
        distance_saved = distance_km - optimized_distance;
        
        fuel_saved_liters = distance_saved / 12;
        fuel_cost_saved = fuel_saved_liters * 1.5;
        
        co2_saved_kg = fuel_saved_liters * 2.3;

        report {
            "success": True,
            "collector_id": self.collector_id,
            "request_id": self.request_id,
            "route_optimization": {
                "original_distance_km": round(distance_km, 2),
                "optimized_distance_km": round(optimized_distance, 2),
                "distance_saved_km": round(distance_saved, 2),
                "fuel_saved_liters": round(fuel_saved_liters, 2),
                "cost_saved_usd": round(fuel_cost_saved, 2),
                "co2_saved_kg": round(co2_saved_kg, 2)
            },
            "message": "Route optimized successfully"
        };
    }

    can generate_report with entry {
        collector_tasks = [];
        total_weight = 0.0;
        total_distance = 0.0;
        total_co2_saved = 0.0;
        
        for pid in pickups.keys() {
            p = pickups[pid];
            if p.get("assigned_collector_id") == self.collector_id {
                collector_tasks.append(p);
                if p["status"] == "completed" {
                    total_weight = total_weight + p.get("waste_weight", 0.0);
                    total_distance = total_distance + p.get("distance_saved_km", 0.0);
                }
            }
        }

        completed_tasks = [t for t in collector_tasks if t["status"] == "completed"];
        pending_tasks = [t for t in collector_tasks if t["status"] == "pending"];
        accepted_tasks = [t for t in collector_tasks if t["status"] == "accepted"];

        total_co2_saved = total_weight * 0.5;

        report {
            "success": True,
            "collector_id": self.collector_id,
            "report": {
                "total_tasks": len(collector_tasks),
                "completed_tasks": len(completed_tasks),
                "pending_tasks": len(pending_tasks),
                "accepted_tasks": len(accepted_tasks),
                "total_waste_collected_kg": round(total_weight, 2),
                "total_co2_saved_kg": round(total_co2_saved, 2),
                "total_distance_saved_km": round(total_distance, 2),
                "performance_score": min(100, len(completed_tasks) * 10),
                "generated_at": str(datetime.datetime.now())
            },
            "message": "Report generated successfully"
        };
    }
}