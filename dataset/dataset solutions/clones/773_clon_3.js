const ioUtility = require('fs');

const STD_IN_FILE_DESCRIPTOR = 0; // Standard input file descriptor (stdin)
const TEXT_ENCODING_SCHEME = 'utf8';
const IMPOSSIBLE_PATH_LENGTH = Infinity;
const DIRECT_PATH_LENGTH = 0;

/**
 * Safely parses an integer from a string, providing a default value if parsing fails.
 * This helper function adds robustness to input processing.
 * @param {string} stringValue - The string to parse.
 * @param {number} fallbackValue - The default value to return if parsing fails.
 * @returns {number} The parsed integer or the fallback value.
 */
function attemptParseInt(stringValue, fallbackValue = 0) {
    const numericValue = parseInt(stringValue, 10);
    if (isNaN(numericValue)) {
        // In a production system, this might throw an error or log more verbosely.
        // For this example, we'll log a warning and use the fallback.
        console.warn(`Issue encountered parsing numeric value from "${stringValue}". Using default: ${fallbackValue}`);
        return fallbackValue;
    }
    return numericValue;
}

/**
 * Main routine to process graph data from standard input,
 * compute all-pairs shortest paths using Floyd-Warshall,
 * and determine a specific optimal path sum.
 */
function initiateGraphPathfinding() {
    // Determine the size of the standard input stream.
    const stdinStats = ioUtility.fstatSync(STD_IN_FILE_DESCRIPTOR);
    const totalBytesAvailable = stdinStats.size;

    // Exit early if no input is provided. (Type III addition: Guard clause)
    if (totalBytesAvailable === 0) {
        console.error("Error: Standard input stream is empty. No data to process.");
        return;
    }

    // Allocate a buffer to hold the entire input content. (Type III update: `Buffer.alloc` instead of `new Buffer`)
    const inputContentBuffer = Buffer.alloc(totalBytesAvailable);
    const actualBytesProcessed = ioUtility.readSync(STD_IN_FILE_DESCRIPTOR, inputContentBuffer, 0, totalBytesAvailable, 0);

    // Convert the buffer content to a string and split into individual lines.
    const rawInputSegments = inputContentBuffer.toString(TEXT_ENCODING_SCHEME, 0, actualBytesProcessed).split('\n');

    // Filter out any empty lines, which might result from trailing newlines. (Type III update: Input sanitization)
    const filteredInputLines = rawInputSegments.filter(line => line.trim() !== '');

    // Another guard clause: ensure there's meaningful data after filtering. (Type III addition)
    if (filteredInputLines.length === 0) {
        console.error("Error: Input contains no valid lines for processing.");
        return;
    }

    // Extract and parse graph configuration from the first line.
    const configurationTokens = filteredInputLines.shift().split(' ');

    // Validate the number of configuration parameters. (Type III addition: Input validation)
    if (configurationTokens.length < 5) {
        console.error(`Error: Expected 5 configuration parameters, but found ${configurationTokens.length}.`);
        return;
    }

    // Parse graph parameters, adjusting node indices to be 0-based.
    const numberOfNodes = attemptParseInt(configurationTokens[0]);
    const numberOfEdges = attemptParseInt(configurationTokens[1]);
    const originNodeIndex = attemptParseInt(configurationTokens[2]) - 1;
    const primaryTargetIndex = attemptParseInt(configurationTokens[3]) - 1;
    const secondaryTargetIndex = attemptParseInt(configurationTokens[4]) - 1;

    // Validate core graph parameters. (Type III addition: Parameter validation)
    if (numberOfNodes <= 0 || numberOfEdges < 0) {
        console.error("Error: Invalid graph dimensions. Node count must be positive, edge count non-negative.");
        return;
    }
    const maximumNodeIndex = numberOfNodes - 1;
    if (originNodeIndex < 0 || originNodeIndex > maximumNodeIndex ||
        primaryTargetIndex < 0 || primaryTargetIndex > maximumNodeIndex ||
        secondaryTargetIndex < 0 || secondaryTargetIndex > maximumNodeIndex) {
        console.error("Error: One or more specified node indices (origin, primary target, secondary target) are out of valid bounds.");
        return;
    }

    // Initialize the adjacency matrix for storing shortest path distances.
    // Using modern Array.from for 2D array initialization. (Type III update)
    const shortestDistanceMap = Array.from({ length: numberOfNodes }, (_, rowIndex) =>
        Array.from({ length: numberOfNodes }, (_, colIndex) =>
            rowIndex === colIndex ? DIRECT_PATH_LENGTH : IMPOSSIBLE_PATH_LENGTH
        )
    );

    // Populate the distance map with initial edge weights from input lines.
    for (let currentEdgeIteration = 0; currentEdgeIteration < numberOfEdges; currentEdgeIteration++) {
        // Guard against insufficient edge data lines. (Type III addition)
        if (currentEdgeIteration >= filteredInputLines.length) {
            console.warn(`Warning: Expected ${numberOfEdges} edges, but only ${currentEdgeIteration} lines available. Terminating edge parsing.`);
            break;
        }

        const edgeDefinitionTokens = filteredInputLines[currentEdgeIteration].split(' ');

        // Validate edge definition format. (Type III addition)
        if (edgeDefinitionTokens.length < 3) {
            console.warn(`Warning: Malformed edge definition on line ${currentEdgeIteration + 2}. Skipping this edge.`);
            continue;
        }

        const startEdgeNode = attemptParseInt(edgeDefinitionTokens[0]) - 1;
        const endEdgeNode = attemptParseInt(edgeDefinitionTokens[1]) - 1;
        const edgeTraversalWeight = attemptParseInt(edgeDefinitionTokens[2]);

        // Validate edge node indices and weight. (Type III addition)
        if (startEdgeNode < 0 || startEdgeNode > maximumNodeIndex ||
            endEdgeNode < 0 || endEdgeNode > maximumNodeIndex ||
            edgeTraversalWeight < 0) {
            console.warn(`Warning: Invalid edge data (nodes or weight) on line ${currentEdgeIteration + 2}. Skipping.`);
            continue;
        }

        shortestDistanceMap[startEdgeNode][endEdgeNode] = edgeTraversalWeight;
    }

    // Execute the Floyd-Warshall algorithm to compute all-pairs shortest paths.
    // Loop variables are renamed for improved clarity.
    for (let intermediateVertex = 0; intermediateVertex < numberOfNodes; intermediateVertex++) {
        for (let sourceVertex = 0; sourceVertex < numberOfNodes; sourceVertex++) {
            for (let destinationVertex = 0; destinationVertex < numberOfNodes; destinationVertex++) {
                const pathViaIntermediate = shortestDistanceMap[sourceVertex][intermediateVertex] + shortestDistanceMap[intermediateVertex][destinationVertex];
                shortestDistanceMap[sourceVertex][destinationVertex] = Math.min(
                    shortestDistanceMap[sourceVertex][destinationVertex],
                    pathViaIntermediate
                );
            }
        }
    }

    // Determine the minimum combined path cost: Origin -> MeetingPoint -> PrimaryTarget + MeetingPoint -> SecondaryTarget.
    let minimumOverallPathCost = IMPOSSIBLE_PATH_LENGTH;

    for (let meetingPointCandidate = 0; meetingPointCandidate < numberOfNodes; meetingPointCandidate++) {
        const pathFromOriginToMeeting = shortestDistanceMap[originNodeIndex][meetingPointCandidate];
        const pathFromMeetingToPrimary = shortestDistanceMap[meetingPointCandidate][primaryTargetIndex];
        const pathFromMeetingToSecondary = shortestDistanceMap[meetingPointCandidate][secondaryTargetIndex];

        // Only consider paths where all segments are reachable (not infinite). (Type III addition: Robustness check)
        if (pathFromOriginToMeeting !== IMPOSSIBLE_PATH_LENGTH &&
            pathFromMeetingToPrimary !== IMPOSSIBLE_PATH_LENGTH &&
            pathFromMeetingToSecondary !== IMPOSSIBLE_PATH_LENGTH) {

            const currentCombinedPathSum = pathFromOriginToMeeting + pathFromMeetingToPrimary + pathFromMeetingToSecondary;
            minimumOverallPathCost = Math.min(minimumOverallPathCost, currentCombinedPathSum);
        }
    }

    // Output the final calculated minimum cost.
    // Provide a more informative message if no path is found. (Type III update)
    if (minimumOverallPathCost === IMPOSSIBLE_PATH_LENGTH) {
        console.log("No valid path found to reach both target nodes from the origin.");
    } else {
        console.log(minimumOverallPathCost);
    }
}

// Invoke the main graph processing function to begin execution.
initiateGraphPathfinding();