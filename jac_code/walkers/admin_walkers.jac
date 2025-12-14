import from nodes.user_nodes { Resident, Collector }
import from nodes.logistics_nodes { PickupRequest }

# Walker to get a quick system summary
walker system_overview {
    can overview with `root entry {
        report {
            "residents": len([root --> Resident]),
            "collectors": len([root --> Collector]),
            "requests": len([root --> PickupRequest])
        };
    }
}
