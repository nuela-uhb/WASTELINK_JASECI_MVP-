import from byllm.lib { Model }


glob llm = Model(model_name="gpt-4o");


def classify_waste_image(url: str) -> str by llm();


def calc_optimal_route(stops: list[dict]) -> Route by llm(method="Reason");