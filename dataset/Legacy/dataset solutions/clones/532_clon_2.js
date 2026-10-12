function executeProgram() {
    // Read the total number of nodes (vertices) from input.
    var nodeCount = readInputToken();
    // Read the total number of constraints (edges) from input.
    var edgeCount = readInputToken();

    // This array stores simple inequality constraints, which directly translate to graph edges.
    var simpleConstraints = [];
    // This array stores complex constraints (e.g., absolute value), which each represent two possible edges.
    var complexConstraints = [];

    // Iterate 'edgeCount' times to process each constraint provided in the input.
    iterateRange(edgeCount, function() {
        // Read the constraint string (e.g., "1 <= 2 + 5").
        var inputString = readInputToken('string');

        // Parse the input string to extract the two node indices and the constant value.
        var parsedValues = inputString.split(/<=|>=|\*|\+|-/);
        // Convert the first node index to a 0-based integer.
        parsedValues[0] = +parsedValues[0] - 1;
        // Convert the second node index to a 0-based integer.
        parsedValues[1] = +parsedValues[1] - 1;
        // Convert the constant value to a number.
        parsedValues[2] = +parsedValues[2];

        // Determine the type of the constraint: 0 for '<=', 1 for '>=', 2 for absolute value ('*').
        var constraintType;
        if (inputString.indexOf('*') !== -1) {
            constraintType = 2; // Represents |X - Y| <= C
        } else {
            // If '*' is not present, check for '<='. If not found, it must be '>='.
            constraintType = +(inputString.indexOf('<=') === -1); // 0 for X <= Y + C, 1 for X >= Y + C
        }

        // Determine the sign of the constant in the constraint.
        // 0 if '+' is present (e.g., X <= Y + C), 1 if '-' is present or no sign (e.g., X <= Y - C).
        var operatorSign = +(inputString.indexOf('+') === -1);

        // Process constraints based on their type.
        if (constraintType === 0) { // Constraint is of the form X <= Y + C
            if (operatorSign === 0) { // X <= Y + C
                // This translates to a single edge: Y -> X with weight -C.
                // (distance[X] <= distance[Y] - C)
                simpleConstraints[simpleConstraints.length] = [parsedValues[1], parsedValues[0], -parsedValues[2]];
            } else { // X <= Y - C
                // This translates to two edges: Y -> X with weight 0, and X -> Y with weight C.
                // (distance[X] <= distance[Y] and distance[Y] <= distance[X] + C)
                simpleConstraints[simpleConstraints.length] = [parsedValues[1], parsedValues[0], 0];
                simpleConstraints[simpleConstraints.length] = [parsedValues[0], parsedValues[1], parsedValues[2]];
            }
        } else if (constraintType === 1) { // Constraint is of the form X >= Y + C (equivalent to Y <= X - C)
            if (operatorSign === 0) { // X >= Y + C
                // This translates to a single edge: X -> Y with weight -C.
                // (distance[Y] <= distance[X] - C)
                simpleConstraints[simpleConstraints.length] = [parsedValues[0], parsedValues[1], -parsedValues[2]];
            } else { // X >= Y - C
                // This translates to two edges: Y -> X with weight C, and X -> Y with weight 0.
                // (distance[X] <= distance[Y] + C and distance[Y] <= distance[X])
                simpleConstraints[simpleConstraints.length] = [parsedValues[1], parsedValues[0], parsedValues[2]];
                simpleConstraints[simpleConstraints.length] = [parsedValues[0], parsedValues[1], 0];
            }
        } else { // Constraint is of the form |X - Y| <= C
            if (operatorSign === 0) { // |X - Y| <= C
                // This constraint splits into two options: (X - Y <= C) AND (Y - X <= C).
                // Each option is added to 'complexConstraints' to be chosen later.
                complexConstraints[complexConstraints.length] = [
                    [parsedValues[0], parsedValues[1], -parsedValues[2]], // Option 1: X -> Y with weight -C
                    [parsedValues[1], parsedValues[0], -parsedValues[2]]  // Option 2: Y -> X with weight -C
                ];
            } else { // |X - Y| <= -C (This case is generally impossible for positive C, but handled)
                // This translates to two simple edges: Y -> X with weight C, and X -> Y with weight C.
                simpleConstraints[simpleConstraints.length] = [parsedValues[1], parsedValues[0], parsedValues[2]];
                simpleConstraints[simpleConstraints.length] = [parsedValues[0], parsedValues[1], parsedValues[2]];
            }
        }
    });

    // Add implicit constraints: distance[i] >= distance[0] for all nodes 'i'.
    // This is modeled by adding an edge from node 'i' to node '0' with weight 0.
    iterateRange(nodeCount, function(idx) {
        simpleConstraints[simpleConstraints.length] = [idx, 0, 0];
    });

    // Initialize the maximum possible distance found across all valid combinations.
    var finalResult = Number.NEGATIVE_INFINITY;

    // Iterate through all possible combinations for the complex constraints.
    // If there are 'k' complex constraints, there are 2^k combinations.
    iterateRange(1 << complexConstraints.length, function(combinationIndex) {
        // Create a new set of edges for the current combination.
        // Start with all simple constraints.
        var currentGraphEdges = Array.prototype.concat.call([], simpleConstraints);
        // For each complex constraint, add one of its two options based on the current 'combinationIndex'.
        iterateRange(complexConstraints.length, function(idx) {
            currentGraphEdges[currentGraphEdges.length] = complexConstraints[idx][(combinationIndex >> idx) & 1];
        });

        // Initialize distances for the Bellman-Ford algorithm.
        var distances = [];
        // Set all distances to positive infinity initially.
        iterateRange(nodeCount, function(idx) {
            distances[idx] = Number.POSITIVE_INFINITY;
        });
        // The distance from the source node (node 0) to itself is 0.
        distances[0] = 0;

        // Run the Bellman-Ford algorithm for 'nodeCount' iterations.
        // This ensures all shortest paths are found if no negative cycles exist.
        iterateRange(nodeCount, function() {
            // Iterate through all edges in the current graph configuration.
            iterateRange(currentGraphEdges.length, function(edgeIdx) {
                var currentEdge = currentGraphEdges[edgeIdx];
                // Relax the edge: if a shorter path to 'currentEdge[1]' is found, update its distance.
                distances[currentEdge[1]] = Math.min(distances[currentEdge[0]] + currentEdge[2], distances[currentEdge[1]]);
            });
        });

        // After 'nodeCount' iterations, check for negative cycles.
        // If 'distances[0]' is still 0, it means no negative cycle reachable from 0 was detected.
        if (distances[0] === 0) {
            // If no negative cycle, update the overall maximum distance found.
            // We are interested in the maximum value among all 'distances[i]'.
            finalResult = Math.max(finalResult, Math.max.apply(null, distances));
        }
    });

    // Output the final result based on the calculated 'finalResult'.
    if (finalResult === Number.POSITIVE_INFINITY) {
        outputValue('inf'); // If the maximum distance is infinite, print 'inf'.
    } else if (finalResult === Number.NEGATIVE_INFINITY) {
        outputValue(-1); // If no valid combination was found (e.g., all led to negative cycles), print -1.
    } else {
        outputValue(finalResult); // Otherwise, print the calculated maximum distance.
    }
}

// A utility function to iterate a specified range and execute a callback.
// Can be called with (endVal, callbackFn) or (startVal, endVal, callbackFn).
function iterateRange(startVal, endVal, callbackFn) {
    if (callbackFn == null) {
        callbackFn = endVal;
        endVal = startVal;
        startVal = 0;
    }
    for (var idx = startVal; idx < endVal; ++idx) {
        callbackFn(idx);
    }
}

// Standard input stream setup.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Buffer to store all incoming raw input data.
var rawInputBuffer = '';
// Pointer to keep track of the current token being read from the parsed input.
var inputTokenPointer = 0;

// Function to read the next token from the processed input array.
function readInputToken(tokenType) {
    if (tokenType === 'string') {
        // Return the token as a string.
        return rawInputBuffer[inputTokenPointer++];
    } else {
        // Return the token converted to a number.
        return +rawInputBuffer[inputTokenPointer++];
    }
}

// Function to output a value to the console.
function outputValue(val) {
    console.log(val);
}

// Event listener for when data chunks are received from stdin.
process.stdin.on('data', function(dataChunk) {
    rawInputBuffer += dataChunk; // Append the new chunk to the input buffer.
});

// Event listener for when the stdin stream ends.
process.stdin.on('end', function() {
    // Split the accumulated input buffer into an array of tokens, using whitespace as delimiters.
    rawInputBuffer = rawInputBuffer.split(/\s+/);
    // Once all input is processed, execute the main program logic.
    executeProgram();
});
