function processNetworkData(inputLines) {
    const totalPoints = Number(inputLines[0]);
    const pointConnections = {}; // Adjacency list represented as a plain object

    // Parse edge definitions and build the graph
    for (let currentEdgeIndex = 1; currentEdgeIndex < totalPoints; ++currentEdgeIndex) {
        const [sourceIdentifier, destinationIdentifier, travelCost] = inputLines[currentEdgeIndex]
            .split(' ')
            .map(Number);

        const adjustedSource = sourceIdentifier - 1; // Convert to 0-indexed
        const adjustedDestination = destinationIdentifier - 1; // Convert to 0-indexed

        // Initialize arrays for new nodes if they don't exist
        if (!pointConnections[adjustedSource]) pointConnections[adjustedSource] = [];
        if (!pointConnections[adjustedDestination]) pointConnections[adjustedDestination] = [];

        // Add bidirectional connections
        pointConnections[adjustedSource].push({ target: adjustedDestination, expense: travelCost });
        pointConnections[adjustedDestination].push({ target: adjustedSource, expense: travelCost });
    }

    const controlParameters = inputLines[totalPoints].split(' ').map(Number);
    const queryCount = controlParameters[0];
    const initialDiscoveryPoint = controlParameters[1] - 1; // Starting node for distance calculation (0-indexed)

    // Calculate path costs from the initial discovery point to all other nodes using a BFS-like traversal
    const pathCostsFromDiscovery = new Array(totalPoints).fill(-1); // -1 signifies unvisited
    const discoveryQueue = [];

    // Begin traversal from the initial point with zero cost
    discoveryQueue.push({ currentVertex: initialDiscoveryPoint, cumulativeExpense: 0 });
    pathCostsFromDiscovery[initialDiscoveryPoint] = 0; // Mark start as visited with 0 cost

    while (discoveryQueue.length > 0) {
        const { currentVertex, cumulativeExpense } = discoveryQueue.shift(); // Dequeue the next vertex

        const connectedVertices = pointConnections[currentVertex] || []; // Get neighbors
        for (const connection of connectedVertices) {
            // If the neighbor hasn't been visited yet
            if (pathCostsFromDiscovery[connection.target] === -1) {
                pathCostsFromDiscovery[connection.target] = cumulativeExpense + connection.expense;
                discoveryQueue.push({
                    currentVertex: connection.target,
                    cumulativeExpense: cumulativeExpense + connection.expense
                });
            }
        }
    }

    // Process each inquiry and output the combined path costs
    const finalResults = [];
    for (let inquiryIndex = 0; inquiryIndex < queryCount; ++inquiryIndex) {
        const inquiryLine = inputLines[totalPoints + 1 + inquiryIndex];
        const [firstQueryPoint, secondQueryPoint] = inquiryLine.split(' ').map(Number);

        const adjustedFirst = firstQueryPoint - 1; // 0-indexed
        const adjustedSecond = secondQueryPoint - 1; // 0-indexed

        const totalJourneyCost = pathCostsFromDiscovery[adjustedFirst] + pathCostsFromDiscovery[adjustedSecond];
        finalResults.push(totalJourneyCost);
    }

    // Print all computed results
    finalResults.forEach(outputValue => console.log(outputValue));
}