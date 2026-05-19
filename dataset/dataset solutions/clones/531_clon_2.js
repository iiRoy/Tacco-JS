function primaryExecution() {
    // Read the number of nodes and edges from input
    var nodeCount = readInputToken();
    var edgeCount = readInputToken();

    // Initialize arrays to store different types of constraints
    var fixedConstraints = []; // Stores direct edge constraints
    var flexibleConstraints = []; // Stores pairs of mutually exclusive constraints

    // Process each edge/constraint definition
    iterateRange(edgeCount, function() {
        var inputLine = readInputToken('string'); // Read the constraint string

        // Parse the numerical values from the input string
        var parsedValues = inputLine.split(/<=|>=|\*|\+|-/);
        parsedValues[0] = +parsedValues[0] - 1; // Adjust node index to be 0-based
        parsedValues[1] = +parsedValues[1] - 1; // Adjust node index to be 0-based
        parsedValues[2] = +parsedValues[2];     // The weight/value

        // Determine the type of constraint (e.g., equality, inequality)
        var constraintType;
        if (inputLine.indexOf('*') !== -1) {
            constraintType = 2; // Represents an equality constraint (x = y + c)
        } else {
            // Represents an inequality constraint (x <= y + c or y <= x + c)
            constraintType = +(inputLine.indexOf('<=') === -1); // 0 for <=, 1 for >=
        }

        // Determine the sign type (e.g., positive or negative constant)
        var signType = +(inputLine.indexOf('+') === -1); // 0 for +, 1 for -

        // Based on constraint and sign types, populate the constraint arrays
        if (constraintType === 0) { // x <= y + c
            if (signType === 0) { // x <= y + c  =>  y - x >= -c  =>  y -> x with weight -c
                fixedConstraints[fixedConstraints.length] = [parsedValues[1], parsedValues[0], -parsedValues[2]];
            } else { // x <= y - c  =>  y - x >= c  =>  y -> x with weight c  AND  x - y >= 0  =>  x -> y with weight 0
                fixedConstraints[fixedConstraints.length] = [parsedValues[1], parsedValues[0], parsedValues[2]];
                fixedConstraints[fixedConstraints.length] = [parsedValues[0], parsedValues[1], 0];
            }
        } else if (constraintType === 1) { // x >= y + c
            if (signType === 0) { // x >= y + c  =>  x - y >= c  =>  x -> y with weight c
                fixedConstraints[fixedConstraints.length] = [parsedValues[0], parsedValues[1], -parsedValues[2]];
            } else { // x >= y - c  =>  x - y >= -c  =>  x -> y with weight -c  AND  y - x >= 0  =>  y -> x with weight 0
                fixedConstraints[fixedConstraints.length] = [parsedValues[1], parsedValues[0], parsedValues[2]];
                fixedConstraints[fixedConstraints.length] = [parsedValues[0], parsedValues[1], 0];
            }
        } else { // x = y + c (equality)
            if (signType === 0) { // x = y + c  =>  x - y = c  =>  x -> y with weight c  AND  y -> x with weight -c
                flexibleConstraints[flexibleConstraints.length] = [[parsedValues[0], parsedValues[1], -parsedValues[2]], [parsedValues[1], parsedValues[0], -parsedValues[2]]];
            } else { // x = y - c  =>  x - y = -c  =>  x -> y with weight -c  AND  y -> x with weight c
                fixedConstraints[fixedConstraints.length] = [parsedValues[1], parsedValues[0], parsedValues[2]];
                fixedConstraints[fixedConstraints.length] = [parsedValues[0], parsedValues[1], parsedValues[2]];
            }
        }
    });

    // Add edges from all nodes to a source node (node 0) with weight 0
    iterateRange(nodeCount, function(idx) {
        fixedConstraints[fixedConstraints.length] = [idx, 0, 0];
    });

    var resultValue = -Infinity; // Initialize the maximum possible value for the answer

    // Iterate through all possible combinations for flexible constraints
    iterateRange(1 << flexibleConstraints.length, function(combinationMask) {
        // Create a new set of edges for the current combination
        var currentEdges = [].concat(fixedConstraints);
        iterateRange(flexibleConstraints.length, function(idx) {
            // Select one of the two possible edges for each flexible constraint
            currentEdges[currentEdges.length] = flexibleConstraints[idx][(combinationMask >> idx) & 1];
        });

        // Initialize distances for Bellman-Ford algorithm
        var distances = [];
        iterateRange(nodeCount, function(idx) {
            distances[idx] = Infinity;
        });
        distances[0] = 0; // Distance from source (node 0) to itself is 0

        // Run Bellman-Ford algorithm for (nodeCount - 1) iterations
        // (Actually, it runs nodeCount iterations, which is fine for detecting negative cycles or ensuring convergence)
        iterateRange(nodeCount, function() {
            iterateRange(currentEdges.length, function(edgeIdx) {
                var currentEdge = currentEdges[edgeIdx];
                // Relax the edge: d[v] = min(d[v], d[u] + weight(u,v))
                distances[currentEdge[1]] = Math.min(distances[currentEdge[0]] + currentEdge[2], distances[currentEdge[1]]);
            });
        });

        // If the distance to the source node (node 0) is non-negative,
        // it means no negative cycle reachable from node 0 was formed.
        // In this context, it implies a valid assignment of values.
        if (distances[0] >= 0) {
            resultValue = Math.max(resultValue, distances[nodeCount - 1]); // Update the maximum distance to the last node
        }
    });

    // Output the final result
    if (resultValue === Infinity) {
        outputResult('inf'); // If the last node is reachable with infinite distance
    } else if (resultValue === -Infinity) {
        outputResult(-1); // If the last node is unreachable or no valid combination found
    } else {
        outputResult(resultValue); // The calculated maximum distance
    }
}

// Helper function for iterating a range
function iterateRange(startVal, endVal, callbackFn) {
    if (callbackFn == null) {
        callbackFn = endVal;
        endVal = startVal;
        startVal = 0;
    }
    for (var loopCounter = startVal; loopCounter < endVal; ++loopCounter) {
        callbackFn(loopCounter);
    }
}

// Standard input/output setup
process.stdin.resume();
process.stdin.setEncoding('utf8');

var rawInputBuffer = '';
var bufferPosition = 0;

// Function to read tokens from the input buffer
function readInputToken(tokenFormat) {
    if (tokenFormat === 'string') {
        return rawInputBuffer[bufferPosition++];
    } else {
        return +rawInputBuffer[bufferPosition++]; // Convert to number
    }
}

// Function to print values to console
function outputResult(valueToDisplay) {
    console.log(valueToDisplay);
}

// Event listener for incoming data
process.stdin.on('data', function(dataChunk) {
    rawInputBuffer += dataChunk;
});

// Event listener for end of input
process.stdin.on('end', function() {
    rawInputBuffer = rawInputBuffer.split(/\s+/); // Split input by whitespace
    primaryExecution(); // Start the main logic
});
