walker Auth {
    can register with User entry {
        print(f"Registering user: {here.full_name}");
        # In real case, insert into SQLite
    }

    can login with User entry {
        print(f"Logging in user: {here.email}");
        # Validate password hash
    }
}
