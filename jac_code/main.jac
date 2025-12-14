import from nodes.base_nodes { Root }
import from nodes.user_nodes { Resident, Collector }
import from nodes.logistics_nodes { PickupRequest, RequestStatus }

import from walkers.resident_walkers {
    request_pickup,
    get_pickup_status
}

import from walkers.collector_walkers {
    get_available_pickups,
    accept_request,
    complete_pickup
}

import from walkers.admin_walkers {
    system_overview
}

with entry {
    print("=== WasteLink Backend Initialized ===");
}
