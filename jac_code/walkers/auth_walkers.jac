import from nodes.user_nodes { Resident, Collector }

# Register Resident
walker register_resident {
    has name: str;
    has phone: str;
    has location: dict;

    can register with `root entry {
        existing = [root --> Resident](?phone == self.phone);
        if existing {
            report {"error": "Resident already exists"};
            return;
        }

        resident = Resident(
            name=self.name,
            phone=self.phone,
            location=self.location
        );

        root ++> resident;

        report {"status": "registered", "resident_id": resident.id};
    }
}

# Register Collector
walker register_collector {
    has name: str;
    has phone: str;
    has location: dict;

    can register with `root entry {
        existing = [root --> Collector](?phone == self.phone);
        if existing {
            report {"error": "Collector already exists"};
            return;
        }

        collector = Collector(
            name=self.name,
            phone=self.phone,
            location=self.location
        );

        root ++> collector;

        report {"status": "registered", "collector_id": collector.id};
    }
}

# Simple Login
walker login_user {
    has phone: str;

    can login with `root entry {
        resident = [root --> Resident](?phone == self.phone);
        if resident {
            report {"status": "resident_logged_in", "id": resident[0].id};
            return;
        }

        collector = [root --> Collector](?phone == self.phone);
        if collector {
            report {"status": "collector_logged_in", "id": collector[0].id};
            return;
        }

        report {"error": "User not found"};
    }
}
