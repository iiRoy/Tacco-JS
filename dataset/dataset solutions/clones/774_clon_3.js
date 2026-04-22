const fileSystemModule = require('fs'); // Alias for the file system utility module.

// Symbolic constants for common values and delimiters.
const STDIN_FILE_DESCRIPTOR = process.stdin.fd; // Reference to standard input file descriptor.
const LINE_BREAK_DELIMITER = '\n'; // Delimiter for splitting input into lines.
const WHITESPACE_DELIMITER = ' '; // Delimiter for splitting line elements.
const NO_PATH_VALUE = Number.POSITIVE_INFINITY; // Represents an unreachable path or infinite distance.

/**
 * Initializes a square matrix where diagonal elements are 0 (self-loops)
 * and all other elements are set to a value indicating no path (infinity).
 * This matrix will serve as the adjacency list for graph distances.
 *
 * @param {number} graphSize - The total number of nodes in the graph.
 * @returns {Array<Array<number>>} A newly created and initialized distance matrix.
 */
function createAndInitializeDistanceMatrix(graphSize) {
    // Defensive programming: Validate the input graph size.
    if (typeof graphSize !== 'number' || !Number.isInteger(graphSize) || graphSize < 0) {
        console.error("Runtime Error: Invalid graph size provided for matrix initialization. Must be a non-negative integer.");
        process.exit(1); // Terminate execution due to critical error.
    }

    const distanceMapping = [];
    for (let currentSourceNode = 0; currentSourceNode < graphSize; ++currentSourceNode) {
        distanceMapping[currentSourceNode] = []; // Initialize inner array for each row.
        for (let currentDestinationNode = 0; currentDestinationNode < graphSize; ++currentDestinationNode) {
            // A node's distance to itself is always zero.
            if (currentSourceNode === currentDestinationNode) {
                distanceMapping[currentSourceNode][currentDestinationNode] = 0;
            } else {
                // Initially, all other distances are considered infinite.
                distanceMapping[currentSourceNode][currentDestinationNode] = NO_PATH_VALUE;
            }
        }
    }
    return distanceMapping;
}

/**
 * Implements the Floyd-Warshall algorithm to compute the shortest paths
 * between all pairs of nodes in a graph. It modifies the provided distance matrix in place.
 *
 * @param {Array<Array<number>>} pathDistances - The adjacency matrix containing initial edge weights.
 * @param {number} totalGraphNodes - The total count of nodes in the graph.
 */
function executeFloydWarshallAlgorithm(pathDistances, totalGraphNodes) {
    // Iterate through all possible intermediate nodes (k).
    for (let intermediateNode = 0; intermediateNode < totalGraphNodes; ++intermediateNode) {
        // Iterate through all possible source nodes (i).
        for (let sourceNode = 0; sourceNode < totalGraphNodes; ++sourceNode) {
            // Iterate through all possible destination nodes (j).
            for (let destinationNode = 0; destinationNode < totalGraphNodes; ++destinationNode) {
                // If there's a path from source to intermediate AND from intermediate to destination,
                // then consider if this new path is shorter than the current direct path.
                if (pathDistances[sourceNode][intermediateNode] !== NO_PATH_VALUE &&
                    pathDistances[intermediateNode][destinationNode] !== NO_PATH_VALUE) {

                    const potentialNewPathLength = pathDistances[sourceNode][intermediateNode] + pathDistances[intermediateNode][destinationNode];
                    // Update the shortest path if a shorter route is found.
                    pathDistances[sourceNode][destinationNode] = Math.min(pathDistances[sourceNode][destinationNode], potentialNewPathLength);
                }
            }
        }
    }
}

// --- Main Program Execution Block ---
try {
    // 1. Read input from standard input.
    // Obtain statistics about the standard input stream to get its size.
    const standardInputStats = fileSystemModule.fstatSync(STDIN_FILE_DESCRIPTOR);
    const totalInputDataSize = standardInputStats.size;

    // Guard against empty input.
    if (totalInputDataSize === 0) {
        console.error("Input Processing Error: No data received via standard input. Please provide graph data.");
        process.exit(1);
    }

    // Allocate a buffer to store the raw byte data read from stdin.
    const rawInputBuffer = Buffer.alloc(totalInputDataSize);

    // Read the entire content of standard input into the allocated buffer.
    const bytesSuccessfullyRead = fileSystemModule.readSync(STDIN_FILE_DESCRIPTOR, rawInputBuffer, 0, totalInputDataSize, 0);

    // Convert the read buffer content to a UTF-8 string and split it into an array of lines.
    const processedInputLines = rawInputBuffer.toString('utf8', 0, bytesSuccessfullyRead).split(LINE_BREAK_DELIMITER);

    // 2. Parse initial configuration line.
    const graphConfigurationLine = processedInputLines.shift(); // Remove and get the first line.
    if (!graphConfigurationLine) {
        console.error("Input Parsing Error: The first configuration line is missing or empty.");
        process.exit(1);
    }
    const configurationTokens = graphConfigurationLine.split(WHITESPACE_DELIMITER);

    // Extract numerical parameters, adjusting 1-based indices to 0-based.
    const numberOfNodes = parseInt(configurationTokens[0], 10);
    const numberOfEdges = parseInt(configurationTokens[1], 10);
    const initialStartingNodeIndex = parseInt(configurationTokens[2], 10) - 1;
    const primaryGoalNodeIndex = parseInt(configurationTokens[3], 10) - 1;
    const secondaryGoalNodeIndex = parseInt(configurationTokens[4], 10) - 1;

    // 3. Validate parsed initial parameters.
    const areConfigParametersValid = !isNaN(numberOfNodes) && numberOfNodes > 0 &&
                                     !isNaN(numberOfEdges) && numberOfEdges >= 0 &&
                                     !isNaN(initialStartingNodeIndex) && initialStartingNodeIndex >= 0 && initialStartingNodeIndex < numberOfNodes &&
                                     !isNaN(primaryGoalNodeIndex) && primaryGoalNodeIndex >= 0 && primaryGoalNodeIndex < numberOfNodes &&
                                     !isNaN(secondaryGoalNodeIndex) && secondaryGoalNodeIndex >= 0 && secondaryGoalNodeIndex < numberOfNodes;

    if (!areConfigParametersValid) {
        console.error("Input Validation Error: Malformed or out-of-bounds parameters detected in the first line of input.");
        process.exit(1);
    }
    if (processedInputLines.length < numberOfEdges) {
        console.error(`Input Validation Error: Expected ${numberOfEdges} edge definitions, but only found ${processedInputLines.length} lines.`);
        process.exit(1);
    }

    // 4. Initialize the graph's distance matrix.
    const graphShortestPaths = createAndInitializeDistanceMatrix(numberOfNodes);

    // 5. Populate the distance matrix with edge weights from subsequent input lines.
    for (let edgeIteration = 0; edgeIteration < numberOfEdges; ++edgeIteration) {
        const edgeDefinitionText = processedInputLines.shift(); // Get the next edge line.
        if (!edgeDefinitionText) { // Guard against premature end of input lines.
            console.error(`Input Parsing Error: Missing edge definition for edge number ${edgeIteration + 1}.`);
            process.exit(1);
        }
        const edgeTokens = edgeDefinitionText.split(WHITESPACE_DELIMITER);

        const edgeSource = parseInt(edgeTokens[0], 10) - 1;
        const edgeDestination = parseInt(edgeTokens[1], 10) - 1;
        const edgeWeight = parseInt(edgeTokens[2], 10);

        // Validate individual edge components.
        const isEdgeValid = !isNaN(edgeSource) && edgeSource >= 0 && edgeSource < numberOfNodes &&
                            !isNaN(edgeDestination) && edgeDestination >= 0 && edgeDestination < numberOfNodes &&
                            !isNaN(edgeWeight) && edgeWeight >= 0; // Assuming non-negative weights for simplicity.

        if (!isEdgeValid) {
            console.error(`Input Validation Error: Invalid edge definition in line ${edgeIteration + 2}: "${edgeDefinitionText}".`);
            process.exit(1);
        }

        // Assign the edge weight. If duplicate edges are provided, the last one defined takes precedence.
        graphShortestPaths[edgeSource][edgeDestination] = edgeWeight;
    }

    // 6. Compute all-pairs shortest paths using Floyd-Warshall.
    executeFloydWarshallAlgorithm(graphShortestPaths, numberOfNodes);

    // 7. Calculate the minimum combined path through an intermediate waypoint.
    // The target is to find min( S -> i + i -> G1 + i -> G2 ) for all possible i.
    let overallMinimumPathSum = NO_PATH_VALUE;

    for (let intermediateWaypoint = 0; intermediateWaypoint < numberOfNodes; ++intermediateWaypoint) {
        const pathSegment1 = graphShortestPaths[initialStartingNodeIndex][intermediateWaypoint];
        const pathSegment2 = graphShortestPaths[intermediateWaypoint][primaryGoalNodeIndex];
        const pathSegment3 = graphShortestPaths[intermediateWaypoint][secondaryGoalNodeIndex];

        // Only consider paths where all three segments are reachable.
        if (pathSegment1 !== NO_PATH_VALUE &&
            pathSegment2 !== NO_PATH_VALUE &&
            pathSegment3 !== NO_PATH_VALUE) {

            const currentCombinedPathSum = pathSegment1 + pathSegment2 + pathSegment3;
            overallMinimumPathSum = Math.min(overallMinimumPathSum, currentCombinedPathSum);
        }
    }

    // 8. Output the final result.
    if (overallMinimumPathSum === NO_PATH_VALUE) {
        console.log("-1"); // Output -1 if no valid path combination was found.
    } else {
        console.log(overallMinimumPathSum);
    }

} catch (runtimeException) {
    // Catch any unexpected exceptions during the execution.
    console.error("An unhandled exception occurred during program execution:", runtimeException.message);
    // Optionally, log the full stack trace for debugging.
    // console.error(runtimeException.stack);
    process.exit(1); // Indicate an error exit.
}