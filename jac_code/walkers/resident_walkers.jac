import from nodes.user_nodes { Resident }
import from nodes.logistics_nodes { PickupRequest }
import from byllm_models.wastelink_tools { classify_waste_image }

walker request_pickup {
    has name: str;
    has phone: str;
    has location: dict;
    has image_url: str | None;

    can request with `root entry {
        # Classify waste using byLLM if image is provided
        waste = "unknown";
        if self.image_url {
            waste = classify_waste_image(self.image_url);
        }

        # Create a new pickup request node
        root ++> PickupRequest(
            resident_name=self.name,
            resident_phone=self.phone,
            location=self.location,
            waste_type=waste,
            image_url=self.image_url
        );

        report {
            "status": "pending",
            "waste_type": waste
        };
    }
}

walker get_pickup_status {
    has phone: str;

    can status with `root entry {
        # Fetch all pickup requests for this resident phone number
        reqs = [root --> PickupRequest](?resident_phone == self.phone);
        report reqs;
    }
}
