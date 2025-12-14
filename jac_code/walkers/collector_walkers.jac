import from nodes.logistics_nodes { PickupRequest, RequestStatus }

# Walker for collectors to fetch all pending pickups
walker get_available_pickups {
    can fetch with `root entry {
        pending = [root --> PickupRequest](?status == RequestStatus.PENDING);
        report pending;
    }
}

# Walker for collectors to accept a pickup request
walker accept_request {
    has collector_name: str;
    has request_id: str;

    can accept with `root entry {
        req = [root --> PickupRequest](?id == self.request_id);
        if not req { 
            report {"error": "Not found"}; 
            return; 
        }

        req[0].status = RequestStatus.ACCEPTED;
        req[0].assigned_collector = self.collector_name;
        req[0].history.append("Accepted by " + self.collector_name);

        report {"status": "accepted"};
    }
}

# Walker for collectors to mark a pickup as completed
walker complete_pickup {
    has request_id: str;

    can complete with `root entry {
        req = [root --> PickupRequest](?id == self.request_id);
        if not req { 
            report {"error": "Not found"}; 
            return; 
        }

        req[0].status = RequestStatus.COMPLETED;
        req[0].history.append("Completed");

        report {"status": "completed"};
    }
}
