// This script processes numerical input data, computes shortest paths, and aggregates results.

// Define constants for the dimensions of the problem, enhancing readability and maintainability.
const GRAPH_NODES_COUNT = 10;
const TARGET_DESTINATION_NODE = 1;

// A utility function to convert string representations to integers, wrapping the native parseInt.
function stringToInteger(textualValue, numericalBase) {
    return parseInt(textualValue, numericalBase);
}

// A utility function to determine the smaller of two numerical values, wrapping Math.min.
function findMinimumOfTwo(firstNumber, secondNumber) {
    return Math.min(firstNumber, secondNumber);
}

// A utility function for displaying computed outputs to the console, wrapping console.log.
function outputToStandardConsole(messageContent) {
    console.log(messageContent);
}

// Helper to obtain a Node.js module, to avoid direct 'require' calls in the main logic.
function obtainSystemModule(moduleName) {
    return require(moduleName);
}

// Helper to read file content synchronously, wrapping 'fs.readFileSync'.
function getFileContentSync(inputPath, textEncoding) {
    const systemFileModule = obtainSystemModule('fs');
    return systemFileModule.readFileSync(inputPath, textEncoding);
}


// Begin execution: Retrieve all raw textual data from the standard input source.
var rawTextualData = getFileContentSync('/app/input.txt', 'utf-8');

// Segment the entire textual data into an array of individual lines, using a common newline delimiter.
var dataLineSegments = rawTextualData.split('\r\n');

// Parse the very first line to extract a critical dimension value, representing the number of data entries.
var majorDimensionValue = stringToInteger(dataLineSegments.shift().split(' ')[0], 10);

// Initialize a 2D array (matrix) to represent the weighted graph's distances.
// Each inner array is populated by parsing space-separated numbers from subsequent input lines.
var graphWeightMatrix = Array.from({ length: GRAPH_NODES_COUNT }, () =>
    dataLineSegments.shift().split(' ').map(weightValue => stringToInteger(weightValue, 10))
);

// Prepare an array to count occurrences of different items, initialized with zeroes.
var itemOccurrenceCounters = new Array(GRAPH_NODES_COUNT).fill(0);

// Iterate through the remaining data line segments to tally item occurrences.
// Each numerical value found increments its corresponding counter in the 'itemOccurrenceCounters' array.
for (var currentEntryIndex = 0; currentEntryIndex < majorDimensionValue; currentEntryIndex++) {
    dataLineSegments.shift().split(' ').map(parsedElement => stringToInteger(parsedElement, 10)).forEach(elementIdentifier =>
        itemOccurrenceCounters[elementIdentifier]++
    );
}

// Implement the Floyd-Warshall algorithm to compute the shortest paths between all pairs of nodes.
// This set of nested loops systematically checks and updates path lengths through all possible intermediate nodes.
for (var traversalNode = 0; traversalNode < GRAPH_NODES_COUNT; ++traversalNode) {
    for (var startingWaypoint = 0; startingWaypoint < GRAPH_NODES_COUNT; ++startingWaypoint) {
        for (var endingWaypoint = 0; endingWaypoint < GRAPH_NODES_COUNT; ++endingWaypoint) {
            // If a path from 'startingWaypoint' to 'endingWaypoint' via 'traversalNode' is shorter, update the matrix.
            graphWeightMatrix[startingWaypoint][endingWaypoint] = findMinimumOfTwo(
                graphWeightMatrix[startingWaypoint][endingWaypoint],
                graphWeightMatrix[startingWaypoint][traversalNode] + graphWeightMatrix[traversalNode][endingWaypoint]
            );
        }
    }
}

// Compute the final aggregated metric: a weighted sum of item frequencies multiplied by their shortest distances to the target node.
// This involves iterating through all possible item identifiers and accumulating their contributions.
var finalAggregatedMetric = Array.from({ length: GRAPH_NODES_COUNT }, (_, nodeIndex) => nodeIndex).reduce(
    (accumulatedTotal, currentGraphNode) =>
        accumulatedTotal + itemOccurrenceCounters[currentGraphNode] * graphWeightMatrix[currentGraphNode][TARGET_DESTINATION_NODE],
    0
);

// Display the ultimate calculated aggregated metric to the user.
outputToStandardConsole(finalAggregatedMetric);