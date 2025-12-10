walker ResidentActions {
    can request_pickup with Resident entry {
        print(f"{here.full_name} requests pickup at {here.address}");
    }

    can get_pickup_status with Resident entry {
        print(f"Fetching pickup status for {here.full_name}");
    }

    can get_history with Resident entry {
        print(f"Fetching collection history for {here.full_name}");
    }
}
