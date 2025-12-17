import {__jacJsx, __jacSpawn} from "@jac-client/utils";
import { useState, useEffect } from "react";
function loadGoogleMaps(cb) {
  if (window.google) {
    cb();
    return;
  }
  let script = document.createElement("script");
  script.src = "https://maps.googleapis.com/maps/api/js?key=" + window.GMAP_KEY;
  script.onload = cb;
  document.body.appendChild(script);
}
function MapView(requests) {
  useEffect(() => {
    function __init__() {
      let map = google.maps.Map(document.getElementById("map"), {"center": {"lat": -1.2921, "lng": 36.8219}, "zoom": 12});
      let directionsService = google.maps.DirectionsService();
      let directionsRenderer = google.maps.DirectionsRenderer({"map": map});
      if (requests.length < 2) {
        return;
      }
      let origin = {"lat": requests[0].lat, "lng": requests[0].lng};
      let destination = {"lat": requests[requests.length - 1].lat, "lng": requests[requests.length - 1].lng};
      let waypoints = requests.slice(1, requests.length - 1).map(r => {
        return {"location": {"lat": r.lat, "lng": r.lng}, "stopover": true};
      });
      directionsService.route({"origin": origin, "destination": destination, "waypoints": waypoints, "optimizeWaypoints": true, "travelMode": google.maps.TravelMode.DRIVING}, (result, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(result);
        }
      });
      requests.map(r => {
        google.maps.Marker({"position": {"lat": r.lat, "lng": r.lng}, "map": map, "title": r.name});
      });
    }
    loadGoogleMaps(__init__);
  }, [requests]);
  return __jacJsx("div", {"id": "map", "style": {"height": "450px"}}, []);
}
function ResidentUI() {
  async function send() {
    await __jacSpawn("request_pickup", "", {"name": "Resident " + func(Math.random()), "phone": "0700", "lat": -1.2921 + Math.random() / 100, "lng": 36.8219 + Math.random() / 100});
    alert("Pickup added");
  }
  return __jacJsx("div", {}, [__jacJsx("h2", {}, ["Resident"]), __jacJsx("button", {"onClick": send}, ["Request Pickup"])]);
}
function CollectorUI() {
  let [requests, setRequests] = useState([]);
  useEffect(() => {
    async function poll() {
      let w = await __jacSpawn("CollectorAPI", "", {});
      let r = w.list();
      setRequests(r.reports ? r.reports : []);
    }
    poll();
    let timer = setInterval(poll, 3000);
    return () => {
      clearInterval(timer);
    };
  }, []);
  async function upload(reqId, file) {
    let reader = FileReader();
    reader.onload = e => {
      let w = await __jacSpawn("CollectorAPI", "", {"request_id": reqId, "image_b64": e.target.result});
      w.upload_image();
    };
    reader.readAsDataURL(file);
  }
  return __jacJsx("div", {}, [__jacJsx("h2", {}, ["Collector Dashboard"]), requests.map(r => {
    return __jacJsx("div", {"key": r._jac_id}, [__jacJsx("b", {}, [r.name]), " \u2013 ", r.waste_type, __jacJsx("input", {"type": "file", "onChange": e => {
      upload(r._jac_id, e.target.files[0]);
    }}, [])]);
  }), __jacJsx(MapView, {"requests": requests}, [])]);
}
function app() {
  let [role, setRole] = useState("");
  window.GMAP_KEY = "<YOUR_GOOGLE_MAPS_API_KEY>";
  if (!role) {
    return __jacJsx("div", {}, [__jacJsx("h1", {}, ["WasteLink"]), __jacJsx("button", {"onClick": () => {
      setRole("resident");
    }}, ["Resident"]), __jacJsx("button", {"onClick": () => {
      setRole("collector");
    }}, ["Collector"])]);
  }
  if (role === "resident") {
    return __jacJsx(ResidentUI, {}, []);
  }
  if (role === "collector") {
    return __jacJsx(CollectorUI, {}, []);
  }
  return __jacJsx("div", {}, ["Invalid role"]);
}
export { CollectorUI, MapView, ResidentUI, app, loadGoogleMaps };
