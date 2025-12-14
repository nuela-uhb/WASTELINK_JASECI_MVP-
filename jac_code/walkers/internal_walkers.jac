import from nodes.user_nodes { Collector }
import from nodes.logistics_nodes { PickupRequest }
import from byllm_models.wastelink_tools { calc_dist }

# Update Collector Location
walker update_collector_location {
    has collector_phone: str;
    has new_location: dict;

    can update_location with `root entry {
        collectors = [root --> Collector](?phone == self.collector_phone);
        if not collectors { report {"error": "Collector not found"}; return; }

        collector = collectors[0];
        collector.location = self.new_location;

        report {"status": "location_updated"};
    }
}

# Find nearest collector for a pending pickup request
walker find_nearest_collector {
    has request_id: str;

    can find with `root entry {
        reqs = [root --> PickupRequest](?id == self.request_id);
        if not reqs { report {"error": "Request not found"}; return; }

        req = reqs[0];

        pending_collectors = [root --> Collector];

        if not pending_collectors {
            report {"error": "No collectors available"};
            return;
        }

        nearest_collector = pending_collectors[0];
        min_distance = calc_dist(
            req.location.lat, req.location.lng,
            nearest_collector.location.lat, nearest_collector.location.lng
        );

        for c in pending_collectors {
            dist = calc_dist(
                req.location.lat, req.location.lng,
                c.location.lat, c.location.lng
            );
            if dist < min_distance {
                min_distance = dist;
                nearest_collector = c;
            }
        }

        report {
            "nearest_collector": nearest_collector.name,
            "phone": nearest_collector.phone,
            "distance_km": min_distance
        };
    }
}
