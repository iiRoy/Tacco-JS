// Function to compute all-pairs shortest paths for cost and duration matrices
function determineMinimumDistances() {
    // Iterate through all possible intermediate nodes (k in standard Floyd-Warshall)
    for (var midPoint = 0; midPoint < graphConfig[1]; midPoint++) {
        // Iterate through all possible starting nodes (i in standard Floyd-Warshall)
        for (var startNode = 0; startNode < graphConfig[1]; startNode++) {
            // Iterate through all possible ending nodes (j in standard Floyd-Warshall)
            for (var endNode = 0; endNode < graphConfig[1]; endNode++) {
                // Update the minimum cost path between startNode and endNode
                // considering midPoint as an intermediate stop
                distanceMatrix[startNode][endNode] = Math.min(
                    distanceMatrix[startNode][endNode],
                    distanceMatrix[startNode][midPoint] + distanceMatrix[midPoint][endNode]
                );

                // Similarly, update the minimum duration path
                durationMatrix[startNode][endNode] = Math.min(
                    durationMatrix[startNode][endNode],
                    durationMatrix[startNode][midPoint] + durationMatrix[midPoint][endNode]
                );
            }
        }
    }
}

// Utilize Node.js 'fs' module to synchronously read standard input
var rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Pre-process the input string: remove leading/trailing whitespace and split into an array of lines
var parsedInputLines = rawInputData.trim().split("\n");

// Main loop for processing multiple test cases or graph configurations
while (true) {
    // Extract the first line of the current configuration, which contains graph dimensions
    // The first element is the number of initial edges, the second is the number of vertices
    var graphConfig = parsedInputLines.shift().split(" ").map(Number);

    // Check for the termination condition (0 0 for both edges and vertices)
    if (graphConfig[0] === 0 && graphConfig[1] === 0) {
        break; // Exit the processing loop
    }

    // Initialize two 2D arrays (matrices) to store path costs and travel durations
    var distanceMatrix = [];
    var durationMatrix = [];

    // Populate the matrices with initial values
    // Assuming a maximum of 101 nodes based on typical problem constraints
    for (var rowIdx = 0; rowIdx < 101; rowIdx++) {
        distanceMatrix[rowIdx] = [];
        durationMatrix[rowIdx] = [];
        for (var colIdx = 0; colIdx < 101; colIdx++) {
            // Set diagonal elements to 0 (cost/duration to self is zero)
            // Other elements are set to Infinity, indicating no direct path initially
            distanceMatrix[rowIdx][colIdx] = (rowIdx === colIdx) ? 0 : Infinity;
            durationMatrix[rowIdx][colIdx] = (rowIdx === colIdx) ? 0 : Infinity;
        }
    }

    // Process the initial set of direct edge connections
    // The number of direct connections is specified by graphConfig[0]
    for (var connectionIdx = 0; connectionIdx < graphConfig[0]; connectionIdx++) {
        // Parse the details for each edge: source, destination, cost, and time
        var edgeConnectionData = parsedInputLines.shift().split(" ").map(Number);

        // Adjust node indices to be 0-based for array access
        var sourceNode = edgeConnectionData[0] - 1;
        var destinationNode = edgeConnectionData[1] - 1;
        var edgeCost = edgeConnectionData[2];
        var edgeTime = edgeConnectionData[3];

        // Update the matrices with the given direct edge values
        distanceMatrix[sourceNode][destinationNode] = edgeCost;
        durationMatrix[sourceNode][destinationNode] = edgeTime;
    }

    // Execute the Floyd-Warshall algorithm to compute all-pairs shortest paths
    determineMinimumDistances();

    // Read the number of queries for the current graph configuration
    var numberOfQueries = parseInt(parsedInputLines.shift(), 10);

    // Process each individual query
    for (var queryIdx = 0; queryIdx < numberOfQueries; queryIdx++) {
        // Parse query parameters: source, destination, and query type (0 for cost, 1 for time)
        var currentQueryInfo = parsedInputLines.shift().split(" ").map(Number);

        // Adjust query node indices to be 0-based
        var querySourceNode = currentQueryInfo[0] - 1;
        var queryDestinationNode = currentQueryInfo[1] - 1;
        var queryMetricType = currentQueryInfo[2];

        // Output the result based on the specified query type
        if (queryMetricType === 0) {
            console.log(distanceMatrix[querySourceNode][queryDestinationNode]);
        }
        if (queryMetricType === 1) {
            console.log(durationMatrix[querySourceNode][queryDestinationNode]);
        }
    }
}