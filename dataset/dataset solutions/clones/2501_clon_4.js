const fileSystem = require('fs');

// Reads the entire standard input, splits it into tokens, and maintains an index.
const inputSource = (() => {
    const completeText = fileSystem.readFileSync(0, 'utf8'); // 0 represents stdin
    const dataSegments = completeText.trim().split(/\s+/g);
    let currentPosition = 0;

    // Provides the next numerical token from the input.
    const extractNumericValue = () => parseInt(dataSegments[currentPosition++], 10);
    // Provides the next raw string token from the input (not strictly needed here but for completeness).
    const extractStringValue = () => dataSegments[currentPosition++];

    return { extractNumericValue, extractStringValue };
})();

// --- Utility for calculating all-pairs shortest paths using Floyd-Warshall ---
// Takes an adjacency matrix and returns a new matrix with shortest path distances.
const determineAllConnections = (initialGraphMap) => {
    const pointCount = initialGraphMap.length;
    // Create a distinct copy of the input matrix.
    const pathwayDistances = initialGraphMap.map(row => [...row]);

    // The Floyd-Warshall iteration logic.
    for (let pivotNode = 0; pivotNode < pointCount; pivotNode++) { // Intermediate node
        for (let startPoint = 0; startPoint < pointCount; startPoint++) {    // Origin node
            for (let endPoint = 0; endPoint < pointCount; endPoint++) {  // Destination node
                if (pathwayDistances[startPoint][endPoint] > pathwayDistances[startPoint][pivotNode] + pathwayDistances[pivotNode][endPoint]) {
                    pathwayDistances[startPoint][endPoint] = pathwayDistances[startPoint][pivotNode] + pathwayDistances[pivotNode][endPoint];
                }
            }
        }
    }
    return pathwayDistances;
};

// --- Main program execution flow ---
const manageNetworkQueries = () => {
    // Read graph parameters: number of nodes, number of initial edges, and distance threshold.
    const totalNodes = inputSource.extractNumericValue();
    const initialEdgeCount = inputSource.extractNumericValue();
    const maxLinkDistance = inputSource.extractNumericValue();

    // Initialize the primary graph's adjacency matrix.
    // Use Infinity for unreachable paths and 0 for self-loops.
    const primaryGraphStructure = Array.from({ length: totalNodes }, (_, idx) =>
        Array(totalNodes).fill(Infinity).map((val, colIdx) => (idx === colIdx ? 0 : val))
    );

    // Populate the primary graph with given edges.
    for (let k = 0; k < initialEdgeCount; k++) {
        const initialA = inputSource.extractNumericValue() - 1; // Convert to 0-indexed
        const initialB = inputSource.extractNumericValue() - 1;   // Convert to 0-indexed
        const edgeValue = inputSource.extractNumericValue();
        primaryGraphStructure[initialA][initialB] = edgeValue;
        primaryGraphStructure[initialB][initialA] = edgeValue; // Graph is undirected
    }

    // Compute all-pairs shortest paths for the primary graph.
    const primaryShortestPaths = determineAllConnections(primaryGraphStructure);

    // Construct a secondary graph based on the threshold.
    // If a path in the primary graph is within 'maxLinkDistance', it becomes a direct link of cost 1 in the secondary graph.
    const secondaryGraphStructure = Array.from({ length: totalNodes }, (_, idx) =>
        Array(totalNodes).fill(Infinity).map((val, colIdx) => (idx === colIdx ? 0 : val))
    );

    for (let rowIdx = 0; rowIdx < totalNodes; rowIdx++) {
        for (let colIdx = 0; colIdx < totalNodes; colIdx++) {
            if (primaryShortestPaths[rowIdx][colIdx] <= maxLinkDistance) {
                secondaryGraphStructure[rowIdx][colIdx] = 1;
            }
        }
    }

    // Compute all-pairs shortest paths for the secondary graph.
    const finalShortestPaths = determineAllConnections(secondaryGraphStructure);

    // Process all incoming queries.
    const queryQuantity = inputSource.extractNumericValue();
    for (let qry = 0; qry < queryQuantity; qry++) {
        const queryOrigin = inputSource.extractNumericValue() - 1; // Convert to 0-indexed
        const queryDestination = inputSource.extractNumericValue() - 1;   // Convert to 0-indexed

        const computedPathLength = finalShortestPaths[queryOrigin][queryDestination];

        if (computedPathLength === Infinity) {
            console.log(-1); // Indicate no valid path
        } else {
            console.log(computedPathLength - 1); // Output the path length adjusted by one
        }
    }
};

// Initiate the solution process.
manageNetworkQueries();