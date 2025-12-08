# ---------- Node Definitions ----------
graph TestGraph {
    node TestNode {
        has name: str = "Test";
        has value: int = 42;
    }
}

# ---------- Walker ----------
walker test_system {
    can test with entry {
        print("✅ Jac is working!");
        print(f"Current time: {std.now()}");

        # Test ID
        test_id = std.uuid4();
        print(f"Generated UUID: {test_id}");

        # Math test (NO try/catch in Jac)
        import math;
        distance = math.sqrt(25);
        print(f"Math test: sqrt(25) = {distance}");

        # Final report
        report {
            "success": true,
            "message": "Jac system test passed",
            "timestamp": std.now().isoformat(),
            "test_id": test_id
        };
    }
}

# ---------- Entry ----------
with entry {
    print("🚀 Starting minimal test...");

    # Create a test node chain (same style as your reference)
    test_node = root ++> TestNode(name="WasteLink Test", value=42);
    print(f"✅ Created node: {test_node.name} with value {test_node.value}");

    # Spawn the walker (same pattern as your reference!)
    test_node[0] spawn test_system;

    print("🎉 All tests passed!");

    # NOTE: In this spawn style, nothing is returned
    report {
        "done": true,
        "message": "Walker executed successfully"
    };
}
