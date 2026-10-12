function executeProgram() {
    // Read the number of nodes (nodeCount) and the number of constraints (edgeCount) from input.
    let nodeCount = readInput();
    let edgeCount = readInput();

    // Initialize arrays to store different types of graph edges (constraints).
    // simpleConstraints will hold direct edges [source, destination, weight].
    let simpleConstraints = [];
    // complexConstraints will hold pairs of potential edges, where one must be chosen.
    let complexConstraints = [];

    // Iterate through each of the 'edgeCount' constraints provided in the input.
    iterateRange(edgeCount, function() {
        let constraintString = readInput('string'); // Read the current constraint as a string.

        // Parse the numerical values from the constraint string.
        // The regex splits the string by any of the operators: <=, >=, *, +, -.
        let parsedValues = constraintString.split(/<=|>=|\*|\+|-/);
        parsedValues[0] = +parsedValues[0] - 1; // Convert first number to 0-indexed node ID.
        parsedValues[1] = +parsedValues[1] - 1; // Convert second number to 0-indexed node ID.
        parsedValues[2] = +parsedValues[2];     // Convert third number to a numeric weight.

        // Determine the comparison operator type (comparisonType).
        // 2 for '*', 0 for '<=', 1 for '>='.
        let comparisonType;
        if (constraintString.indexOf('*') !== -1) {
            comparisonType = 2; // Operator is '*'.
        } else {
            // If not '*', check if it's '<=' (results in 0) or '>=' (results in 1).
            comparisonType = +(constraintString.indexOf('<=') === -1);
        }

        // Determine the arithmetic sign type (signType).
        // 0 for '+', 1 for '-' (if '+' is not found).
        let signType = +(constraintString.indexOf('+') === -1);

        // Based on the determined comparisonType and signType, populate the constraint arrays.
        if (comparisonType === 0) { // Corresponds to '<=' (e.g., x <= y + k)
            if (signType === 0) { // Corresponds to '+' (e.g., x <= y + k)
                // This translates to y - x >= -k, which is a path from x to y with weight -k.
                simpleConstraints[simpleConstraints.length] = [parsedValues[1], parsedValues[0], -parsedValues[2]];
            } else { // Corresponds to '-' (e.g., x <= y - k)
                // This translates to two inequalities: x <= y and x - y <= k.
                simpleConstraints[simpleConstraints.length] = [parsedValues[1], parsedValues[0], 0];
                simpleConstraints[simpleConstraints.length] = [parsedValues[0], parsedValues[1], parsedValues[2]];
            }
        } else if (comparisonType === 1) { // Corresponds to '>=' (e.g., x >= y + k)
            if (signType === 0) { // Corresponds to '+' (e.g., x >= y + k)
                // This translates to x - y >= k, which is a path from y to x with weight -k.
                simpleConstraints[simpleConstraints.length] = [parsedValues[0], parsedValues[1], -parsedValues[2]];
            } else { // Corresponds to '-' (e.g., x >= y - k)
                // This translates to two inequalities: x >= y and x - y >= -k.
                simpleConstraints[simpleConstraints.length] = [parsedValues[1], parsedValues[0], parsedValues[2]];
                simpleConstraints[simpleConstraints.length] = [parsedValues[0], parsedValues[1], 0];
            }
        } else { // Corresponds to '*' (equality, e.g., x = y + k or x = y - k)
            if (signType === 0) { // Corresponds to '+' (e.g., x = y + k)
                // This implies x - y = k, which means x - y <= k AND y - x <= -k.
                // These are two mutually exclusive options for the Bellman-Ford algorithm.
                complexConstraints[complexConstraints.length] = [
                    [parsedValues[0], parsedValues[1], -parsedValues[2]], // x - y <= -k
                    [parsedValues[1], parsedValues[0], -parsedValues[2]]  // y - x <= -k
                ];
            } else { // Corresponds to '-' (e.g., x = y - k)
                // This implies x - y = -k, which means x - y <= -k AND y - x <= k.
                simpleConstraints[simpleConstraints.length] = [parsedValues[1], parsedValues[0], parsedValues[2]];
                simpleConstraints[simpleConstraints.length] = [parsedValues[0], parsedValues[1], parsedValues[2]];
            }
        }
    });

    // Initialize the final result to negative infinity, as we are looking for a maximum.
    let finalResult = -Infinity;

    // Iterate through all possible combinations for the complex constraints.
    // There are 2^complexConstraints.length combinations, as each complex constraint has two options.
    iterateRange(1 << complexConstraints.length, function(combinationIndex) {
        // Create a new list of edges for the current combination.
        // Start by including all simple constraints.
        let currentGraphEdges = [].concat(simpleConstraints);

        // For each complex constraint, select one of its two options based on the current combinationIndex.
        iterateRange(complexConstraints.length, function(loopIndex) {
            // The bit at 'loopIndex' in 'combinationIndex' determines which option to pick (0 or 1).
            currentGraphEdges[currentGraphEdges.length] = complexConstraints[loopIndex][(combinationIndex >> loopIndex) & 1];
        });

        // Initialize distances for the Bellman-Ford algorithm.
        let distances = [];
        iterateRange(nodeCount, function(loopIndex) {
            distances[loopIndex] = Infinity; // All distances are initially infinite.
        });
        distances[0] = 0; // The distance from the source node (node 0) to itself is 0.

        // Run the Bellman-Ford algorithm for 'nodeCount' iterations.
        // This ensures all shortest paths are found and can detect negative cycles.
        iterateRange(nodeCount, function(loopIndex) { // Outer loop for 'nodeCount' relaxation passes.
            iterateRange(currentGraphEdges.length, function(innerLoopIndex) { // Inner loop to process each edge.
                let currentEdge = currentGraphEdges[innerLoopIndex];
                // Relax the edge: if a shorter path to currentEdge[1] is found via currentEdge[0], update it.
                distances[currentEdge[1]] = Math.min(distances[currentEdge[0]] + currentEdge[2], distances[currentEdge[1]]);
            });
        });

        // After 'nodeCount' iterations, check if a negative cycle reachable from node 0 exists.
        // If distances[0] is less than 0, it indicates a negative cycle, making the solution unbounded or inconsistent.
        // If distances[0] is non-negative, a valid solution might exist for this combination.
        if (distances[0] >= 0) {
            // Update the maximum result found so far for the distance to the last node (nodeCount - 1).
            finalResult = Math.max(finalResult, distances[nodeCount - 1]);
        }
    });

    // Output the final computed result.
    if (finalResult === Infinity) {
        outputValue('inf'); // If the target node is reachable with an infinitely large distance (unbounded).
    } else if (finalResult === -Infinity) {
        outputValue(-1); // If no valid path was found for any combination (unreachable or inconsistent).
    } else {
        outputValue(finalResult); // The calculated maximum shortest path to the target node.
    }
}

/**
 * A flexible utility function for iterating a numerical range.
 * Can be called with (end, callback) or (start, end, callback).
 * @param {number} startVal - The starting value of the loop (inclusive).
 * @param {number} endVal - The ending value of the loop (exclusive) if two arguments, or the callback function if three arguments.
 * @param {Function} [callbackFn] - The function to execute for each iteration, receiving the current loop index.
 */
function iterateRange(startVal, endVal, callbackFn) {
    if (callbackFn == null) {
        callbackFn = endVal;
        endVal = startVal;
        startVal = 0;
    }
    for (let loopIndex = startVal; loopIndex < endVal; ++loopIndex) {
        callbackFn(loopIndex);
    }
}

// --- Standard Input/Output Handling for Node.js ---

// Resume stdin to begin listening for input.
process.stdin.resume();
// Set the encoding for stdin to UTF-8.
process.stdin.setEncoding('utf8');

let rawData = ''; // Accumulates all incoming input data chunks.
let dataPointer = 0; // Pointer to the current token in the parsed input array.

/**
 * Reads the next token from the accumulated input data.
 * @param {string} [dataType] - Optional. If 'string', returns the token as a string. Otherwise, attempts to convert to a number.
 * @returns {string|number} The next input token, parsed according to dataType.
 */
function readInput(dataType) {
    if (dataType === 'string') {
        return rawData[dataPointer++];
    } else {
        return +rawData[dataPointer++]; // Convert to number using unary plus operator.
    }
}

/**
 * Prints a given value to the console, followed by a newline.
 * This function wraps console.log for consistent output.
 * @param {*} outputData - The value to be printed.
 */
function outputValue(outputData) {
    console.log(outputData);
}

// Event listener for 'data' event on stdin.
// Appends each incoming chunk of data to the 'rawData' string.
process.stdin.on('data', function(inputChunk) {
    rawData += inputChunk;
});

// Event listener for 'end' event on stdin.
// This signifies that all input has been received.
process.stdin.on('end', function() {
    // Split the accumulated rawData string by any whitespace characters
    // to create an array of individual input tokens.
    rawData = rawData.split(/\s+/);
    // Once all input is processed, execute the main program logic.
    executeProgram();
});
