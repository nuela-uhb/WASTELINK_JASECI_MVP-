walker InternalTools {
    can find_nearest_collector with Request entry {
        print(f"Finding nearest available collector for request at {here.latitude}, {here.longitude}");
    }

    can update_location with Collector entry {
        print(f"Updating collector location: {here.full_name}");
    }
}
