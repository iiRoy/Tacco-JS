function processMainLogic() {
    // Read the number of nodes and edges from input
    let nodeCount = readNextValue();
    let edgeCount = readNextValue();

    // Initialize arrays to store different types of constraints
    // 'directConstraints' stores simple inequality constraints (a - b <= C)
    let directConstraints = [];
    // 'conditionalConstraints' stores constraints that depend on a choice (e.g., |a - b| <= C)
    let conditionalConstraints = [];

    // Iterate through each edge/constraint provided in the input
    iterateRange(edgeCount, function() {
        let inputString = readNextValue('string'); // Read the constraint string

        // Parse the string to extract node indices and the constant value
        // The regex splits by operators like <=, >=, *, +, -
        let parsedValues = inputString.split(/<=|>=|\*|\+|-/);
        // Adjust node indices to be 0-based
        parsedValues[0] = +parsedValues[0] - 1;
        parsedValues[1] = +parsedValues[1] - 1;
        // Convert the constant value to a number
        parsedValues[2] = +parsedValues[2];

        let operatorType; // Represents the type of operator (e.g., *, <=, >=)
        if (inputString.indexOf('*') !== -1) {
            operatorType = 2; // Denotes a '*' operator (absolute difference)
        } else {
            // 0 for '<=' (less than or equal to), 1 for '>=' (greater than or equal to)
            operatorType = +(inputString.indexOf('<=') === -1);
        }

        let signType; // Represents the sign of the constant (e.g., +, -)
        // 0 for '+' (positive), 1 for '-' (negative)
        signType = +(inputString.indexOf('+') === -1);

        // Apply Bellman-Ford compatible edge representation based on constraint type
        if (operatorType === 0) { // Constraint is 'a <= b + C' (or 'a - b <= C')
            if (signType === 0) { // 'a <= b + C' -> b - a <= C
                directConstraints[directConstraints.length] = [parsedValues[1], parsedValues[0], -parsedValues[2]];
            } else { // 'a <= b - C' -> b - a <= -C AND a - b <= 0
                directConstraints[directConstraints.length] = [parsedValues[1], parsedValues[0], 0];
                directConstraints[directConstraints.length] = [parsedValues[0], parsedValues[1], parsedValues[2]];
            }
        } else if (operatorType === 1) { // Constraint is 'a >= b + C' (or 'a - b >= C')
            if (signType === 0) { // 'a >= b + C' -> a - b >= C -> b - a <= -C
                directConstraints[directConstraints.length] = [parsedValues[0], parsedValues[1], -parsedValues[2]];
            } else { // 'a >= b - C' -> a - b >= -C -> b - a <= C AND a - b <= 0
                directConstraints[directConstraints.length] = [parsedValues[1], parsedValues[0], parsedValues[2]];
                directConstraints[directConstraints.length] = [parsedValues[0], parsedValues[1], 0];
            }
        } else { // Constraint is '|a - b| <= C' (operatorType === 2)
            if (signType === 0) { // '|a - b| <= C' -> a - b <= C AND b - a <= C
                conditionalConstraints[conditionalConstraints.length] = [[parsedValues[0], parsedValues[1], -parsedValues[2]], [parsedValues[1], parsedValues[0], -parsedValues[2]]];
            } else { // '|a - b| <= -C' (impossible for C > 0, implies a=b) -> a - b <= -C AND b - a <= -C
                directConstraints[directConstraints.length] = [parsedValues[1], parsedValues[0], parsedValues[2]];
                directConstraints[directConstraints.length] = [parsedValues[0], parsedValues[1], parsedValues[2]];
            }
        }
    });

    let finalResult = -Infinity; // Initialize the maximum possible value found

    // Iterate through all possible combinations for conditional constraints
    // (1 << conditionalConstraints.length) gives 2^N combinations
    iterateRange(1 << conditionalConstraints.length, function(combinationIndex) {
        // Create a temporary graph by copying direct constraints
        let currentGraphEdges = [].concat(directConstraints);

        // Add edges from conditional constraints based on the current combination
        iterateRange(conditionalConstraints.length, function(idx) {
            // (combinationIndex >> idx) & 1 selects one of the two possible edges
            currentGraphEdges[currentGraphEdges.length] = conditionalConstraints[idx][(combinationIndex >> idx) & 1];
        });

        // Initialize distances for Bellman-Ford algorithm
        let distances = [];
        iterateRange(nodeCount, function(nodeIdx) {
            distances[nodeIdx] = Infinity; // All nodes initially unreachable
        });
        distances[0] = 0; // Start node (node 0) has distance 0

        // Run Bellman-Ford algorithm for nodeCount - 1 iterations
        // (or nodeCount iterations to detect negative cycles, but here it's for finding shortest paths)
        iterateRange(nodeCount, function() {
            iterateRange(currentGraphEdges.length, function(edgeIdx) {
                let currentEdge = currentGraphEdges[edgeIdx];
                // Relax edge: d[v] = min(d[v], d[u] + weight)
                distances[currentEdge[1]] = Math.min(distances[currentEdge[0]] + currentEdge[2], distances[currentEdge[1]]);
            });
        });

        // Check for negative cycles reachable from source (node 0)
        // If d[0] is still 0, it means no negative cycle affected the source,
        // and the distances are valid.
        if (distances[0] === 0) {
            // Update the overall maximum result found
            finalResult = Math.max(finalResult, Math.max.apply(null, distances));
        }
    });

    // Output the final result based on its value
    if (finalResult === Infinity) {
        outputResult('inf'); // If the maximum distance is infinity
    } else if (finalResult === -Infinity) {
        outputResult(-1); // If no valid path was found (e.g., all paths lead to negative infinity)
    } else {
        outputResult(finalResult); // Print the calculated maximum distance
    }
}

// Helper function for iterating a range
function iterateRange(startVal, endVal, callbackFn) {
    if (callbackFn == null) {
        callbackFn = endVal;
        endVal = startVal;
        startVal = 0;
    }
    for (let loopCounter = startVal; loopCounter < endVal; ++loopCounter) {
        callbackFn(loopCounter);
    }
}

// Set up standard input processing
process.stdin.resume();
process.stdin.setEncoding('utf8');

let rawDataBuffer = ''; // Buffer to store incoming input data
let currentInputPointer = 0; // Pointer to the current position in the parsed input array

// Function to read the next value from the input
function readNextValue(dataType) {
    if (dataType === 'string') {
        return rawDataBuffer[currentInputPointer++];
    } else {
        return +rawDataBuffer[currentInputPointer++]; // Convert to number
    }
}

// Function to print output to console
function outputResult(valueToPrint) {
    console.log(valueToPrint);
}

// Event listener for incoming data chunks
process.stdin.on('data', function(dataChunk) {
    rawDataBuffer += dataChunk;
});

// Event listener for end of input stream
process.stdin.on('end', function() {
    // Split the entire input by whitespace and store in the buffer
    rawDataBuffer = rawDataBuffer.split(/\s+/);
    processMainLogic(); // Start the main program logic
});
