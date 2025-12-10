walker CollectorActions {
    can get_nearest_tasks with Collector entry {
        print(f"Finding nearest tasks for {here.full_name}");
    }

    can accept_request with Collector entry {
        print(f"{here.full_name} accepted request {visitor.cur_request.id}");
    }

    can update_location with Collector entry {
        print(f"{here.full_name} updated location to {here.latitude}, {here.longitude}");
    }

    can record_collection with Collector entry {
        print(f"{here.full_name} recorded collection {visitor.cur_request.id}");
    }
}
