walker AdminActions {
    can manage_users with Admin entry {
        print(f"{here.full_name} is managing users");
    }

    can get_system_overview with Admin entry {
        print(f"{here.full_name} is viewing system metrics");
    }
}
