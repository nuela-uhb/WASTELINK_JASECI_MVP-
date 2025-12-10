node MapClient {

    has api_key: str = None;  # Will be loaded from environment

    # Initialize API key from environment variable
    can load_api_key with entry {
        import jac_python;
        self.api_key = jac_python.eval('import os; os.environ.get("GOOGLE_MAPS_API_KEY")');
        if self.api_key == None {
            print("[MapClient] ERROR: Environment variable GOOGLE_MAPS_API_KEY not set!");
        } else {
            print("[MapClient] API key loaded successfully.");
        }
    }

    # distance_matrix takes origin and destination coordinates
    def distance_matrix(orig_lat: float, orig_lng: float, dest_lat: float, dest_lng: float) -> dict {
        import jac_python;

        if self.api_key == None {
            print("[MapClient] ERROR: API key not loaded!");
            return {};
        }

        py_code = f'''
import requests
url = "https://maps.googleapis.com/maps/api/distancematrix/json"
params = {{
    "origins": f"{orig_lat},{orig_lng}",
    "destinations": f"{dest_lat},{dest_lng}",
    "key": "{self.api_key}"
}}
response = requests.get(url, params=params)
data = response.json()
data
''';
        result = jac_python.eval(py_code);
        return result;
    }

    can test_request with entry {
        # Example coordinates
        orig_lat = 1.2921;
        orig_lng = 36.8219;
        dest_lat = 1.3000;
        dest_lng = 36.8300;

        visit self.load_api_key;
        result = self.distance_matrix(orig_lat, orig_lng, dest_lat, dest_lng);
        print("[MapClient] Parsed response:", result);
    }
}
