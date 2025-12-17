# =========================================================
# GLOBAL IMPORTS & AI
# =========================================================
import from datetime { datetime }
import from byllm.lib { Model }

glob llm = Model(model_name="gpt-4o");

def classify_waste_image(image_b64: str) -> str by llm();

# =========================================================
# DATA MODELS
# =========================================================
node Root {
    has created_at: str = str(datetime.now());
}

enum RequestStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    COMPLETED = "completed"
}

node PickupRequest {
    has name: str;
    has phone: str;
    has lat: float;
    has lng: float;
    has waste_type: str = "unknown";
    has image_b64: str | None = None;
    has status: RequestStatus = RequestStatus.PENDING;
    has created_at: str = str(datetime.now());
}

# =========================================================
# BACKEND WALKERS
# =========================================================

walker request_pickup {
    has name: str;
    has phone: str;
    has lat: float;
    has lng: float;

    can run with `root entry {
        root ++> PickupRequest(
            name=self.name,
            phone=self.phone,
            lat=self.lat,
            lng=self.lng
        );

        report {"success": True};
    }
}

walker CollectorAPI {
    has request_id: str | None = None;
    has image_b64: str | None = None;

    can list with `root entry {
        report [root --> PickupRequest](?status == RequestStatus.PENDING);
    }

    can upload_image with `root entry {
        reqs = [root --> PickupRequest](?_jac_id == self.request_id)[0];
        reqs.image_b64 = self.image_b64;
        reqs.waste_type = classify_waste_image(self.image_b64);
        report {"classified": reqs.waste_type};
    }
}

# =========================================================
# FRONTEND (CLIENT)
# =========================================================
cl import from react {
    useState,
    useEffect
}

cl {

    def loadGoogleMaps(cb: any) -> None {
        if window.google {
            cb();
            return;
        }

        script = document.createElement("script");
        script.src =
            "https://maps.googleapis.com/maps/api/js?key=" +
            window.GMAP_KEY;
        script.onload = cb;
        document.body.appendChild(script);
    }

    def MapView(requests: list) -> any {

        useEffect(
            lambda -> None {
                def init() -> None {

                    map = google.maps.Map(
                        document.getElementById("map"),
                        {
                            "center": {"lat": -1.2921, "lng": 36.8219},
                            "zoom": 12
                        }
                    );

                    directionsService =
                        google.maps.DirectionsService();
                    directionsRenderer =
                        google.maps.DirectionsRenderer(
                            {"map": map}
                        );

                    if requests.length < 2 {
                        return;
                    }

                    origin = {
                        "lat": requests[0].lat,
                        "lng": requests[0].lng
                    };

                    destination = {
                        "lat":
                            requests[requests.length - 1].lat,
                        "lng":
                            requests[requests.length - 1].lng
                    };

                    waypoints =
                        requests
                            .slice(1, requests.length - 1)
                            .map(
                                lambda r: any -> any {
                                    return {
                                        "location": {
                                            "lat": r.lat,
                                            "lng": r.lng
                                        },
                                        "stopover": true
                                    };
                                }
                            );

                    directionsService.route(
                        {
                            "origin": origin,
                            "destination": destination,
                            "waypoints": waypoints,
                            "optimizeWaypoints": true,
                            "travelMode":
                                google.maps.TravelMode.DRIVING
                        },
                        lambda result: any,
                               status: any -> None {
                            if status == "OK" {
                                directionsRenderer
                                    .setDirections(result);
                            }
                        }
                    );

                    requests.map(
                        lambda r: any -> any {
                            google.maps.Marker(
                                {
                                    "position": {
                                        "lat": r.lat,
                                        "lng": r.lng
                                    },
                                    "map": map,
                                    "title": r.name
                                }
                            );
                        }
                    );
                }

                loadGoogleMaps(init);
            },
            [requests]
        );

        return <div
            id="map"
            style={{"height": "450px"}}
        ></div>;
    }

    def ResidentUI() -> any {

        async def send() -> None {
            await root spawn request_pickup(
                name="Resident " + str(Math.random()),
                phone="0700",
                lat=-1.2921 + (Math.random() / 100),
                lng=36.8219 + (Math.random() / 100)
            );
            alert("Pickup added");
        }

        return <div>
            <h2>Resident</h2>
            <button onClick={send}>
                Request Pickup
            </button>
        </div>;
    }

    def CollectorUI() -> any {

        [requests, setRequests] = useState([]);

        useEffect(
            lambda -> None {
                async def poll() -> None {
                    w = root spawn CollectorAPI();
                    r = w.list();
                    setRequests(
                        r.reports
                        if r.reports
                        else []
                    );
                }


                poll();
                timer = setInterval(poll, 3000);

                return lambda -> None {
                    clearInterval(timer);
                };
            },
            []
        );

        async def upload(reqId: str, file: any) -> None {
            reader = FileReader();
            reader.onload =
                lambda e: any -> None {
                    w = root spawn CollectorAPI(
                        request_id=reqId,
                        image_b64=e.target.result
                    );
                    w.upload_image();
                };

            reader.readAsDataURL(file);
        }

        return <div>
            <h2>Collector Dashboard</h2>

            {requests.map(
                lambda r: any -> any {
                    return <div key={r._jac_id}>
                        <b>{r.name}</b>
                        {" – "}
                        {r.waste_type}
                        <input
                            type="file"
                            onChange={
                                lambda e: any -> None {
                                    upload(
                                        r._jac_id,
                                        e.target.files[0]
                                    );
                                }
                            }
                        />
                    </div>;
                }
            )}

            <MapView requests={requests} />
        </div>;
    }

    def app() -> any {

        [role, setRole] = useState("");

        window.GMAP_KEY =
            "<YOUR_GOOGLE_MAPS_API_KEY>";

        if not role {
            return <div>
                <h1>WasteLink</h1>
                <button
                    onClick={
                        lambda -> None {
                            setRole("resident");
                        }
                    }
                >
                    Resident
                </button>
                <button
                    onClick={
                        lambda -> None {
                            setRole("collector");
                        }
                    }
                >
                    Collector
                </button>
            </div>;
        }

        if role == "resident" {
            return <ResidentUI />;
        }

        if role == "collector" {
            return <CollectorUI />;
        }

        return <div>Invalid role</div>;
    }
}
