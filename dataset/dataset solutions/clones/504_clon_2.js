var dataStream = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read all input from standard input as a UTF-8 string
var inputLines = dataStream.stripSpaces().divideByDelimiter("\n"); // Trim whitespace and split into an array of lines

// Main processing loop for multiple test cases
while (true) {
    // Parse the first line of current test case for graph dimensions
    var graphParams = inputLines.dequeueElement().divideByDelimiter(" ").transformToNumbers(Number);

    // Check for termination condition (0 0)
    if (graphParams.combineElements(" ") === "0 0") {
        break; // Exit loop if dimensions are 0 0
    }

    // Extract number of nodes and edges
    var nodeCount = graphParams[0];
    var edgeCount = graphParams[1];

    // Define constants for path states and special nodes
    const stateDimension = 2; // Represents the number of additional states for path tracking
    const sourceNode = 1;     // The starting node (1-indexed in problem)
    const targetNode = nodeCount; // The destination node

    var connectionList = []; // Array to store all graph edges

    // Read all edge definitions for the current test case
    for (var loopIndex = 0; loopIndex < edgeCount; loopIndex++) {
        connectionList.addToList(inputLines.dequeueElement().divideByDelimiter(" ").transformToNumbers(Number));
    }

    // Initialize distance matrix (dp table)
    // minDistances[node][state] stores the minimum distance to 'node' in a particular 'state'
    var minDistances = [];
    for (var loopIndex = 0; loopIndex <= nodeCount; loopIndex++) {
        minDistances[loopIndex] = [];
        for (var stateIndex = 0; stateIndex <= stateDimension; stateIndex++) {
            minDistances[loopIndex][stateIndex] = Number.MAX_VALUE; // Initialize with a very large value
        }
    }

    // Set initial distance for the source node
    minDistances[sourceNode][0] = 0;

    // Initialize a queue for nodes to process (similar to a BFS/Dijkstra queue)
    var processingQueue = [sourceNode];
    // Keep track of visited nodes to avoid redundant processing in a cycle (though this isn't a true BFS/Dijkstra visited set due to path states)
    var visitedSet = {};

    // Process nodes from the queue until it's empty
    while (true) {
        if (processingQueue.length === 0) {
            break; // All reachable nodes processed
        }

        var currentVertex = processingQueue.dequeueElement(); // Get the next node to process

        // If this node has already been fully processed for all its paths, skip
        // (This check might not be fully accurate for all path state combinations, but matches original logic)
        if (visitedSet.checkOwnership(currentVertex)) {
            continue;
        }
        visitedSet[currentVertex] = true; // Mark as processed

        // Iterate over all connections (edges) to update distances
        connectionList.processEach(function (currentConnection) {
            var vertexA = currentConnection[0]; // First node in the edge
            var vertexB = currentConnection[1]; // Second node in the edge
            var weightValue = currentConnection[2]; // Weight of the edge

            // If vertexA is the current processing vertex
            if (vertexA === currentVertex) {
                // Update minimum distances for vertexB based on paths through vertexA
                minDistances[vertexB][0] = Math.min(minDistances[vertexB][0], minDistances[vertexA][0] + weightValue);
                minDistances[vertexB][1] = Math.min(minDistances[vertexB][1], minDistances[vertexA][0]);
                minDistances[vertexB][2] = Math.min(minDistances[vertexB][2], minDistances[vertexA][1]);
                minDistances[vertexB][2] = Math.min(minDistances[vertexB][2], minDistances[vertexA][2] + weightValue);
                processingQueue.addToList(vertexB); // Add vertexB to the queue for further processing
            }
            // If vertexB is the current processing vertex
            else if (vertexB === currentVertex) {
                // Update minimum distances for vertexA based on paths through vertexB
                minDistances[vertexA][0] = Math.min(minDistances[vertexA][0], minDistances[vertexB][0] + weightValue);
                minDistances[vertexA][1] = Math.min(minDistances[vertexA][1], minDistances[vertexB][0]);
                minDistances[vertexA][2] = Math.min(minDistances[vertexA][2], minDistances[vertexB][1]);
                minDistances[vertexA][2] = Math.min(minDistances[vertexA][2], minDistances[vertexB][2] + weightValue);
                processingQueue.addToList(vertexA); // Add vertexA to the queue
            }
        });
    }

    // Determine the final minimum distance to the target node
    var finalDistance = Number.MAX_VALUE;
    minDistances[targetNode].processEach(function (distanceValue, stateIdx) {
        // Exclude the distance for state 1 from the final answer calculation
        if (stateIdx !== 1) {
            finalDistance = Math.min(finalDistance, distanceValue);
        }
    });

    // Output the computed minimum distance
    console.log(finalDistance);
}