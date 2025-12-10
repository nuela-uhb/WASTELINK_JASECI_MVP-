import from byllm.lib { Model }

glob llm = Model(model_name="gpt-4o");

# LLM Waste Classification
def classify_waste_image(url: str) -> str by llm();

# Optimal route calculation using LLM (remove return type annotation)
def calc_optimal_route(stops: list) by llm();

# Pure Jac Haversine distance to replace LLM
def calc_dist(lat1: float, lon1: float, lat2: float, lon2: float) -> float {
    import math;
    R = 6371.0;  # km
    lat1_rad = math.radians(lat1);
    lon1_rad = math.radians(lon1);
    lat2_rad = math.radians(lat2);
    lon2_rad = math.radians(lon2);
    dlat = lat2_rad - lat1_rad;
    dlon = lon2_rad - lon1_rad;
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2;
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a));
    return R * c;
}
