let vertexCount, adjacencyMatrix, visitedNodes, degreeBalance; // Global variables for graph processing and input handling

/**
 * Recursively explores a connected component starting from a given node using Depth-First Search (DFS).
 * Marks all reachable nodes as visited.
 * @param {number} currentNodeIdx - The numerical index of the node to begin traversal from.
 */
function exploreComponent(currentNodeIdx) {
    // Mark the current node as having been visited
    visitedNodes[currentNodeIdx] = true;

    // Iterate through all potential neighbors (representing characters 'a' through 'z')
    iterateRange(26, function(neighborIdx) {
        // If an edge exists between the current node and the neighbor,
        // and the neighbor has not yet been visited,
        // then recursively call this function on the unvisited neighbor.
        if (adjacencyMatrix[currentNodeIdx][neighborIdx] && !visitedNodes[neighborIdx]) {
            exploreComponent(neighborIdx);
        }
    });
}

/**
 * The main program entry point. It processes multiple test cases from standard input.
 * The loop continues until a test case with 0 edges is encountered.
 */
function primaryExecution() {
    // Begin an infinite loop to handle multiple test scenarios
    while (true) {
        // Read the count of edges (words) for the current test case
        vertexCount = readInputToken();

        // If the read value is 0, it signals the end of input, so terminate the loop
        if (!vertexCount) {
            break;
        }

        // Initialize the primary data structures for the new graph
        adjacencyMatrix = []; // Represents connections between character nodes
        visitedNodes = [];    // Tracks which nodes have been visited during traversal
        degreeBalance = [];   // Stores the net difference between out-degree and in-degree for each node

        // Populate initial states for all 26 possible character nodes
        iterateRange(26, function(charIdx) {
            adjacencyMatrix[charIdx] = []; // Each node can potentially connect to any other node
            degreeBalance[charIdx] = 0;    // Start with a balanced degree for all nodes
        });

        // Process each word (edge) provided in the input for the current test case
        iterateRange(vertexCount, function() {
            const inputString = readInputToken('string'); // Obtain the word as a string
            // Determine the numerical index for the first character of the word
            const firstCharAscii = inputString.charCodeAt(0) - 'a'.charCodeAt(0);
            // Determine the numerical index for the last character of the word
            const lastCharAscii = inputString.charCodeAt(inputString.length - 1) - 'a'.charCodeAt(0);

            // Establish an undirected connection in the adjacency matrix between the first and last characters
            adjacencyMatrix[firstCharAscii][lastCharAscii] = adjacencyMatrix[lastCharAscii][firstCharAscii] = true;

            // Adjust the degree balance: increment for the starting character, decrement for the ending character
            // This is crucial for checking Euler path/circuit conditions.
            ++degreeBalance[firstCharAscii];
            --degreeBalance[lastCharAscii];
        });

        // Identify and mark any nodes that are completely isolated (have no connections)
        // These nodes are effectively "visited" in the sense that they don't need to be part of a connected component.
        iterateRange(26, function(nodeIdx) {
            let isIsolated = true; // Assume the current node is isolated by default
            iterateRange(26, function(innerNodeIdx) {
                // If any connection is found, the node is not isolated
                isIsolated = !adjacencyMatrix[nodeIdx][innerNodeIdx] && isIsolated;
            });
            if (isIsolated) {
                visitedNodes[nodeIdx] = true; // Mark isolated nodes as visited to exclude them from connectivity checks
            }
        });

        // Perform a connectivity check: start DFS from the first unvisited node.
        // If more than one call to exploreComponent is needed, the graph is disconnected.
        iterateRange(26, function(nodeIdx) {
            if (!visitedNodes[nodeIdx]) {
                exploreComponent(nodeIdx); // Initiate DFS from this unvisited node
                // If this point is reached, it means a connected component was found.
                // The `return false` statement here is used to break out of the `iterateRange` loop.
                // This ensures `exploreComponent` is called at most once for the primary component.
                return false;
            }
        });

        // Evaluate the final outcome based on graph properties (connectivity and degree balance)
        let finalOutcome = true; // Optimistically assume the graph is 'OK'

        iterateRange(26, function(nodeIdx) {
            // For the graph to be 'OK', all nodes must have been visited (either part of the main component or isolated)
            // AND the degree balance for each node must be zero (a condition for an Euler circuit).
            finalOutcome = visitedNodes[nodeIdx] && degreeBalance[nodeIdx] === 0 && finalOutcome;
        });

        // Output the determined result ('OK' or 'NG')
        outputResult(finalOutcome ? 'OK' : 'NG');
    }
}

/**
 * A flexible utility function for iterating over a numerical range, similar to a for loop.
 * It supports different argument signatures: (end), (start, end), or (start, end, callback).
 * @param {number} startVal - The starting value of the iteration (inclusive).
 * @param {number} endVal - The ending value of the iteration (exclusive).
 * @param {Function} callbackFn - The function to execute for each value in the range.
 *                                If this function returns `false`, the iteration stops.
 */
function iterateRange(startVal, endVal, callbackFn) {
    // Adjust arguments based on the function signature used
    if (callbackFn === null || callbackFn === undefined) {
        callbackFn = endVal;   // If the third argument is missing, the second is the callback
        endVal = startVal;     // The first argument then becomes the end value
        startVal = 0;          // Default starting value is 0
    }
    // Loop from the determined start value up to (but not including) the end value
    for (let currentIdx = startVal; currentIdx < endVal; ++currentIdx) {
        // Execute the callback function; if it returns false, break the loop
        if (callbackFn(currentIdx) === false) {
            break;
        }
    }
}

// --- Standard Input/Output Handling Configuration ---

// Ensure the standard input stream is active
process.stdin.resume();
// Set the character encoding for incoming standard input data
process.stdin.setEncoding('utf8');

// A buffer to accumulate all incoming data from stdin
let rawInputBuffer = '';
// A pointer to keep track of the current position in the tokenized input array
let inputTokenPointer = 0;

/**
 * Retrieves the next token from the buffered input.
 * @param {string} [tokenType] - Optional. If 'string', the token is returned as a string.
 *                               Otherwise, it's converted to a number.
 * @returns {string|number} The next available input token.
 */
function readInputToken(tokenType) {
    if (tokenType === 'string') {
        return rawInputBuffer[inputTokenPointer++];
    } else {
        return +rawInputBuffer[inputTokenPointer++]; // Use unary plus to convert to number
    }
}

/**
 * Outputs a given value to the console, followed by a newline character.
 * @param {*} valueToPrint - The data to be displayed on the console.
 */
function outputResult(valueToPrint) {
    console.log(valueToPrint);
}

// Event listener for when data chunks are received on standard input
process.stdin.on('data', function(dataChunk) {
    rawInputBuffer += dataChunk; // Append the new data chunk to the buffer
});

// Event listener for when the standard input stream has ended
process.stdin.on('end', function() {
    // Split the entire accumulated input buffer into an array of tokens, using whitespace as a delimiter
    rawInputBuffer = rawInputBuffer.split(/\s+/);
    // Once all input is processed, initiate the primary execution logic
    primaryExecution();
});
