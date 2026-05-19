var numVertices;
var edgeList = [];
var parentArray = [];
var rankArray = [];

/**
 * Initializes the Disjoint Set Union (DSU) structure.
 * Each element is initially in its own set, and ranks are zero.
 * Note: The original code initializes DSU arrays based on the number of edges (g.length)
 * rather than the number of vertices (n), which can lead to out-of-bounds access
 * if n is greater than g.length. This behavior is preserved as per Type II cloning rules.
 */
function initializeDSU() {
    // Iterate through the current number of edges to initialize parent and rank arrays.
    iterateRange(edgeList.length, function(currentIdx) {
        parentArray[currentIdx] = currentIdx;
        rankArray[currentIdx] = 0;
    });
}

/**
 * Finds the representative (root) of the set containing element 'idx1' using path compression.
 * @param {number} idx1 - The element to find the set for.
 * @returns {number} The representative of the set.
 */
function findSet(idx1) {
    // If the element is its own parent, it's the root.
    // Otherwise, recursively find the root and perform path compression.
    return parentArray[idx1] === idx1 ? idx1 : (parentArray[idx1] = findSet(parentArray[idx1]));
}

/**
 * Checks if two elements are in the same set by comparing their representatives.
 * @param {number} idx1 - The first element.
 * @param {number} idx2 - The second element.
 * @returns {boolean} True if they are in the same set, false otherwise.
 */
function areConnected(idx1, idx2) {
    return findSet(idx1) === findSet(idx2);
}

/**
 * Unites the sets containing elements 'idx1' and 'idx2' using union by rank.
 * @param {number} idx1 - The first element.
 * @param {number} idx2 - The second element.
 */
function unionSets(idx1, idx2) {
    var rootA = findSet(idx1); // Find the root of the first element's set.
    var rootB = findSet(idx2); // Find the root of the second element's set.

    // If they are already in the same set, do nothing.
    if (rootA === rootB) {
        return;
    }

    // Perform union by rank: attach the smaller rank tree under the root of the larger rank tree.
    if (rankArray[rootA] > rankArray[rootB]) {
        parentArray[rootB] = rootA;
    } else {
        parentArray[rootA] = rootB;
        // If ranks were equal, increment the rank of the new root.
        if (rankArray[rootA] === rankArray[rootB]) {
            ++rankArray[rootB];
        }
    }
}

/**
 * Main function to execute Kruskal's algorithm for finding the Minimum Spanning Tree (MST).
 * Reads graph input, sorts edges, and applies DSU to build the MST.
 */
function executeKruskal() {
    numVertices = readInputToken(); // Read the number of vertices.

    // Populate the edge list from the input adjacency matrix.
    // Only consider edges in the upper triangle (i < j) and with valid costs (not -1).
    iterateRange(numVertices, function(idx1) {
        iterateRange(numVertices, function(idx2) {
            var costValue = readInputToken();
            if (idx1 < idx2 && costValue !== -1) {
                edgeList[edgeList.length] = [costValue, idx1, idx2];
            }
        });
    });

    // Sort the edges by their weight (cost) in ascending order.
    edgeList.sort(function(edgeA, edgeB) {
        return edgeA[0] - edgeB[0];
    });

    initializeDSU(); // Initialize the DSU structure.

    var totalWeight = 0; // Variable to store the total weight of the MST.

    // Iterate through the sorted edges.
    iterateRange(edgeList.length, function(currentIdx) {
        var currentEdge = edgeList[currentIdx];
        // If the two vertices of the current edge are not already connected in the MST,
        // add this edge to the MST.
        if (!areConnected(currentEdge[1], currentEdge[2])) {
            totalWeight += currentEdge[0]; // Add the edge's weight to the total.
            unionSets(currentEdge[1], currentEdge[2]); // Unite the sets of the two vertices.
        }
    });

    outputResult(totalWeight); // Print the calculated total weight of the MST.
}

/**
 * A flexible loop utility function.
 * Can be called with two arguments (end, callback) or three arguments (start, end, callback).
 * @param {number} arg1 - The loop's end index (if two arguments) or start index (if three arguments).
 * @param {function|number} arg2 - The callback function (if two arguments) or the loop's end index (if three arguments).
 * @param {function} [arg3] - The callback function (if three arguments).
 */
function iterateRange(arg1, arg2, arg3) {
    var loopStart = 0;
    var loopEnd;
    var loopCallback;

    if (arg3 === undefined) { // Two arguments: (end, callback)
        loopEnd = arg1;
        loopCallback = arg2;
        loopStart = 0; // Default start from 0.
    } else { // Three arguments: (start, end, callback)
        loopStart = arg1;
        loopEnd = arg2;
        loopCallback = arg3;
    }

    // Execute the loop.
    for (var currentLoopIndex = loopStart; currentLoopIndex < loopEnd; ++currentLoopIndex) {
        // If the callback returns false, break the loop.
        if (loopCallback(currentLoopIndex) === false) {
            break;
        }
    }
}

// Standard input handling setup.
process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputBuffer = ''; // Buffer to accumulate input data.
var inputTokenIndex = 0; // Index to track the current position in the tokenized input.

/**
 * Reads and returns the next token from the processed input buffer.
 * @param {string} [dataType] - Optional type hint; if 'string', returns as string, otherwise as number.
 * @returns {string|number} The next input token.
 */
function readInputToken(dataType) {
    if (dataType === 'string') {
        return inputBuffer[inputTokenIndex++];
    } else {
        return +inputBuffer[inputTokenIndex++]; // Convert to number using unary plus.
    }
}

/**
 * Prints a given value to the console, followed by a newline.
 * @param {*} outputValue - The value to be printed.
 */
function outputResult(outputValue) {
    console.log(outputValue);
}

// Event listener for incoming data chunks from stdin.
process.stdin.on('data', function(dataChunk) {
    inputBuffer += dataChunk; // Append the chunk to the input buffer.
});

// Event listener for the end of stdin input.
process.stdin.on('end', function() {
    // Process the accumulated input: trim whitespace and split into tokens by any whitespace.
    inputBuffer = inputBuffer.trim().split(/\s+/);
    executeKruskal(); // Call the main algorithm function.
});
