const analyzeNetworkConfiguration = (rawInputString) => {
    // This function evaluates a graph's structure to determine if it meets
    // a basic condition for containing an Eulerian circuit, specifically
    // by checking the parity of each vertex's degree.

    // --- Data Preparation and Initial Parsing ---
    // Normalize line endings, trim whitespace from each line, and discard any empty lines.
    const normalizedInputLines = rawInputString
        .split(/\r?\n/)
        .map(currentLine => currentLine.trim())
        .filter(trimmedLine => trimmedLine.length > 0);

    // If no valid input lines remain, report an error and exit.
    if (normalizedInputLines.length === 0) {
        console.log("Input processing error: No substantial data detected.");
        return;
    }

    // Extract graph dimensions (number of vertices and edges) from the very first line.
    const dimensionTokens = normalizedInputLines[0].split(/\s+/).map(Number);

    // Validate the header line format.
    if (dimensionTokens.length < 2 || isNaN(dimensionTokens[0]) || isNaN(dimensionTokens[1])) {
        console.log("Configuration error: Malformed graph dimension declaration (expected 'N M').");
        return;
    }

    // Assign parsed values to descriptive constants.
    const totalVertices = dimensionTokens[0]; // Corresponds to 'N' in the original problem statement.
    const declaredEdges = dimensionTokens[1]; // Corresponds to 'M' in the original problem statement.

    // Remove the header line, leaving only the edge definitions.
    const edgeDescriptionLines = normalizedInputLines.slice(1);

    // Perform basic sanity checks on graph dimensions.
    if (totalVertices <= 0 || declaredEdges < 0) {
        console.log("Validation failure: Vertex count must be positive, edge count non-negative.");
        return;
    }
    // Issue a warning if the number of actual edge lines doesn't match the declared count.
    if (edgeDescriptionLines.length !== declaredEdges) {
        console.log(`Input discrepancy: Declared edges (${declaredEdges}) differ from actual edge lines (${edgeDescriptionLines.length}). Processing available lines.`);
    }

    // --- Graph Representation Initialization (Adjacency Map) ---
    // Utilize a Map object to store the adjacency list for each vertex.
    // Keys will be numeric vertex IDs, values will be arrays of connected vertex IDs.
    const graphConnections = new Map(); // An enhanced replacement for the original 'list' object.

    // Pre-populate the map with an empty array for each vertex, from 1 to totalVertices.
    for (let currentVertexId = 1; currentVertexId <= totalVertices; ++currentVertexId) {
        graphConnections.set(currentVertexId, []);
    }

    // --- Edge Data Population ---
    // Iterate through each line describing an edge to build the graph's adjacency structure.
    for (let edgeLineIndex = 0; edgeLineIndex < edgeDescriptionLines.length; ++edgeLineIndex) {
        const currentEdgeText = edgeDescriptionLines[edgeLineIndex];

        // Skip if an edge line is unexpectedly missing (e.g., M > actual lines).
        if (!currentEdgeText) {
            continue;
        }

        const connectedVertexIds = currentEdgeText.split(/\s+/).map(Number);

        // Validate the format of the current edge definition.
        if (connectedVertexIds.length < 2 || isNaN(connectedVertexIds[0]) || isNaN(connectedVertexIds[1])) {
            console.log(`Skipping invalid edge definition: "${currentEdgeText}" at line ${edgeLineIndex + 2}.`); // +2 for header and 0-indexing
            continue;
        }

        const firstEndpoint = connectedVertexIds[0];  // Represents 'tmp1'
        const secondEndpoint = connectedVertexIds[1]; // Represents 'tmp2'

        // Ensure both endpoints are within the valid range of vertex IDs.
        const isFirstEndpointValid = firstEndpoint >= 1 && firstEndpoint <= totalVertices;
        const isSecondEndpointValid = secondEndpoint >= 1 && secondEndpoint <= totalVertices;

        if (!isFirstEndpointValid || !isSecondEndpointValid) {
            console.log(`Warning: Edge (${firstEndpoint}, ${secondEndpoint}) refers to out-of-bounds vertex ID. Ignored.`);
            continue;
        }

        // For an undirected graph, add each vertex to the other's adjacency list.
        graphConnections.get(firstEndpoint).push(secondEndpoint);
        graphConnections.get(secondEndpoint).push(firstEndpoint);
    }

    // --- Eulerian Circuit Pre-Check (Degree Parity) ---
    let isEulerianConditionViolated = false; // Flag to indicate if any vertex has an odd degree.

    // Examine each vertex's degree (number of connections).
    for (let vertexToCheck = 1; vertexToCheck <= totalVertices; ++vertexToCheck) {
        const currentVertexNeighbors = graphConnections.get(vertexToCheck);

        // This check should theoretically always pass if initialization was correct,
        // but it adds robustness.
        if (!currentVertexNeighbors) {
            console.error(`Internal error: Adjacency list entry missing for vertex ${vertexToCheck}.`);
            isEulerianConditionViolated = true;
            break;
        }

        const degreeOfVertex = currentVertexNeighbors.length;

        // An Eulerian circuit requires all vertices to have an even degree.
        // Use a bitwise AND for a concise check for oddness.
        if ((degreeOfVertex & 1) !== 0) { // Equivalent to degreeOfVertex % 2 === 1
            isEulerianConditionViolated = true;
            break; // Found an odd-degree vertex, no need to check further.
        }
    }

    // --- Final Output Based on Analysis ---
    if (isEulerianConditionViolated) {
        console.log("-1"); // Output indicating that an Eulerian circuit is not possible.
    } else {
        // If all degrees are even, an Eulerian circuit is possible (assuming the graph is connected).
        // The original code had an empty loop here. This is a placeholder for potential
        // further algorithms like finding the actual Eulerian path/circuit.
        console.log("Graph exhibits even degrees for all vertices, suggesting potential for an Eulerian circuit.");
    }
};

// --- Execution Context ---
// This block reads input from standard input stream and invokes the main analysis function.
try {
    const stdinContent = require("node:fs").readFileSync("/dev/stdin", "utf8");
    analyzeNetworkConfiguration(stdinContent);
} catch (ioError) {
    console.error("Failed to read input from standard input:", ioError.message);
    // In a production environment, one might log the full error or attempt a fallback.
    // For demonstration, we could provide a sample input here:
    // analyzeNetworkConfiguration("4 4\n1 2\n2 3\n3 4\n4 1"); // Example of an Eulerian graph
}