/* This main program orchestrates the processing of graph constraints
 * to find a specific path distance. */
function executeProgram() {
    // Read the total number of nodes in the graph.
    var nodeCount = retrieveInput();
    // Read the total number of constraints or edges.
    var constraintCount = retrieveInput();

    // Initialize an array to store fixed directed edges.
    var fixedConstraints = [];
    // Initialize an array to store pairs of alternative directed edges.
    var alternativeConstraints = [];

    // Process each constraint provided as input.
    iterateRange(constraintCount, function() {
        // Read the constraint as a string.
        var constraintString = retrieveInput('string');

        // Parse the string to extract node indices and weight.
        // The regex splits by '<=', '>=', '*', '+', or '-'.
        var parsedParts = constraintString.split(/<=|>=|\*|\+|-/);
        // Adjust the first node index to be 0-based.
        parsedParts[0] = +parsedParts[0] - 1;
        // Adjust the second node index to be 0-based.
        parsedParts[1] = +parsedParts[1] - 1;
        // Convert the weight to a number.
        parsedParts[2] = +parsedParts[2];

        // Determine the type of relation based on operators.
        var constraintType;
        if (constraintString.indexOf('*') !== -1) {
            // If '*' is present, it's a special type.
            constraintType = 2;
        } else {
            // If '<=' is not present, it implies '>=' or similar, map to 1, else 0.
            constraintType = +(constraintString.indexOf('<=') === -1);
        }

        // Determine if a specific operator ('+') is absent.
        var operatorPresence = +(constraintString.indexOf('+') === -1);

        // Apply rules based on the identified constraint type and operator presence.
        if (constraintType === 0) { // e.g., representing '<='
            if (operatorPresence === 0) { // e.g., implies '+' was present
                // Add an edge: from node 2 to node 1 with negative weight.
                fixedConstraints[fixedConstraints.length] = [parsedParts[1], parsedParts[0], -parsedParts[2]];
            } else { // e.g., implies '+' was absent
                // Add two edges: one with zero weight, another with positive weight.
                fixedConstraints[fixedConstraints.length] = [parsedParts[1], parsedParts[0], 0];
                fixedConstraints[fixedConstraints.length] = [parsedParts[0], parsedParts[1], parsedParts[2]];
            }
        } else if (constraintType === 1) { // e.g., representing '>='
            if (operatorPresence === 0) { // e.g., implies '+' was present
                // Add an edge: from node 1 to node 2 with negative weight.
                fixedConstraints[fixedConstraints.length] = [parsedParts[0], parsedParts[1], -parsedParts[2]];
            } else { // e.g., implies '+' was absent
                // Add two edges: one with positive weight, another with zero weight.
                fixedConstraints[fixedConstraints.length] = [parsedParts[1], parsedParts[0], parsedParts[2]];
                fixedConstraints[fixedConstraints.length] = [parsedParts[0], parsedParts[1], 0];
            }
        } else { // e.g., representing '*'
            if (operatorPresence === 0) { // e.g., implies '+' was present
                // This constraint results in a choice between two alternative edges.
                alternativeConstraints[alternativeConstraints.length] = [
                    [parsedParts[0], parsedParts[1], -parsedParts[2]],
                    [parsedParts[1], parsedParts[0], -parsedParts[2]]
                ];
            } else { // e.g., implies '+' was absent
                // Add two fixed edges with positive weights.
                fixedConstraints[fixedConstraints.length] = [parsedParts[1], parsedParts[0], parsedParts[2]];
                fixedConstraints[fixedConstraints.length] = [parsedParts[0], parsedParts[1], parsedParts[2]];
            }
        }
    });

    // Initialize the final outcome to negative infinity for maximization.
    let finalOutcome = -Infinity;

    // Iterate through all possible combinations of alternative constraints.
    // Each 'alternativeConstraint' can be chosen in one of two ways.
    iterateRange(1 << alternativeConstraints.length, function(selectionPattern) {
        // Create a temporary graph by copying the fixed constraints.
        let currentGraphEdges = [].concat(fixedConstraints);
        // Add selected alternative edges to the temporary graph.
        iterateRange(alternativeConstraints.length, function(outerLoopVar) {
            // Use bitwise operation to select one of the two alternatives.
            currentGraphEdges[currentGraphEdges.length] = alternativeConstraints[outerLoopVar][(selectionPattern >> outerLoopVar) & 1];
        });

        // Initialize distance array for Bellman-Ford algorithm.
        let distanceArray = [];
        // Set all distances to infinity, except the source.
        iterateRange(nodeCount, function(outerLoopVar) {
            distanceArray[outerLoopVar] = Infinity;
        });
        // Source node (node 0) has a distance of 0.
        distanceArray[0] = 0;

        // Run Bellman-Ford algorithm to find shortest paths.
        // It runs 'nodeCount' times to ensure all paths are relaxed,
        // and to detect negative cycles if an additional iteration changes distances.
        iterateRange(nodeCount, function(outerLoopVar) {
            iterateRange(currentGraphEdges.length, function(innerLoopVar) {
                let graphEdge = currentGraphEdges[innerLoopVar];
                // Relax the edge: update distance if a shorter path is found.
                distanceArray[graphEdge[1]] = Math.min(distanceArray[graphEdge[0]] + graphEdge[2], distanceArray[graphEdge[1]]);
            });
        });

        // Check for negative cycles reachable from the source node 0.
        // If distance from node 0 to itself is non-negative, it means no negative cycle
        // affects node 0, or no negative cycle is reachable from node 0 that affects
        // the path to 0.
        if (distanceArray[0] >= 0) {
            // Update the maximum distance to the last node (nodeCount - 1).
            finalOutcome = Math.max(finalOutcome, distanceArray[nodeCount - 1]);
        }
    });

    // Output the final result.
    if (finalOutcome === Infinity) {
        displayResult('inf'); // Indicates that nodeCount-1 is reachable with infinitely large distance.
    } else if (finalOutcome === -Infinity) {
        displayResult(-1); // Indicates that nodeCount-1 was never reached with a valid path.
    } else {
        displayResult(finalOutcome); // Output the calculated maximum shortest path.
    }
}

/* This utility function provides a flexible way to iterate over a range.
 * It can be called with (end, callback) or (start, end, callback). */
function iterateRange(startIndex, endIndex, callbackFunction) {
    // Check if the first argument is the end index and start is implied 0.
    if (callbackFunction === null || callbackFunction === undefined) {
        // If only two arguments, assume start is 0.
        callbackFunction = endIndex;
        endIndex = startIndex;
        startIndex = 0;
    }
    // Loop from startIndex (inclusive) up to endIndex (exclusive).
    for (var currentIdx = startIndex; currentIdx < endIndex; ++currentIdx) {
        callbackFunction(currentIdx); // Execute the callback for each index.
    }
}

// Prepare to read input from standard input.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Global buffer to accumulate raw input.
var rawInputBuffer = '';
// Pointer to the current position in the parsed input array.
var bufferPosition = 0;

/* Reads a piece of input from the pre-parsed buffer. */
function retrieveInput(dataTypeHint) {
    // If 'string' type is requested, return the raw string.
    if (dataTypeHint === 'string') {
        return rawInputBuffer[bufferPosition++];
    } else {
        // Otherwise, convert the string to a number and return.
        return +rawInputBuffer[bufferPosition++];
    }
}

/* Displays a value to the standard output. */
function displayResult(outputValue) {
    console.log(outputValue);
}

// Event listener for incoming data chunks.
process.stdin.on('data', function(chunk) {
    rawInputBuffer += chunk; // Append new data to the buffer.
});

// Event listener for the end of input stream.
process.stdin.on('end', function() {
    // Split the accumulated input by whitespace to create an array of tokens.
    rawInputBuffer = rawInputBuffer.split(/\s+/);
    // Call the main program execution function.
    executeProgram();
});