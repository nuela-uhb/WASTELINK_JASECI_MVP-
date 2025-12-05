# WASTELINK_JASECI_MVP-
WasteLink is the 'Bolt for Waste' MVP! ♻️


#​Project Overview#
​WasteLink is the 'Bolt for Waste' MVP!We use the Jaseci OSP stack (Jaclang/Jack Client) to power AI-driven waste logistics. The system focuses on digitized pickups, featuring LLM-based waste classification and Geo-optimized routing for collectors.

#​Technology Stack:
▪︎ ​Backend & Logic: Jaclang (Object-Spatial Programming, Walkers)
▪︎ ​AI/Tools: Jaclang's built-in byLLM for Waste Classification and external Geo APIs for Route Optimization.
▪︎ ​Frontend: Jack Client (React-based) for mobile-first user interfaces.
▪︎ ​Data Persistence: Jaseci Graph Persistence (SQLite/PostgreSQL)
​
#Architecture and File Structure#
​The architecture is built on the Jaseci OSP paradigm, where data and logic are separated into Nodes, Walkers, and Tools.

Wastelink/
├── jac_code/                    # The JAC Backend Code
│   ├── nodes/                  # Data Models (Nodes: User, Request, Route)
│   ├── walkers/                # Business Logic (Walkers: API Endpoints/Orchestrators)
│   └── main.jac                # Entry Point
├── byllm_models/               # LLM and Geo Tools (The Specialized Functions/Agents)
│   └── wastelink_tools.jac     # Contains classify_waste_image (by llm) and calc_optimal_route
├── jac_client/                 # Frontend UI and API integration logic
├── config/
└── data/

#Roles and Responsibilities#
Role Contributor Core Focus & Jaclang Deliverables
° Project Manager (PM) ->Hawi 
>Integration & Resources. 
>Secure API Keys, manage commits, and validate Tool outputs.

° Backend Specialist (T1) [Neville] 
>Jaclang Back-End.
> All files in jac_code/nodes/, jac_code/walkers/, and byllm_models/wastelink_tools.jac.

° Frontend Specialist (T2) [Eric] 
>Jack Client. 
>All files in jac_client/.
> Focus on UI/UX, map rendering, and consuming T1's Walker APIs.


​🔒 Copyright and Licensing
​This source code is the proprietary intellectual property of ECOROUTE GROUP. All rights reserved. No reuse, redistribution, or modification is permitted without explicit written permission from the authors.
