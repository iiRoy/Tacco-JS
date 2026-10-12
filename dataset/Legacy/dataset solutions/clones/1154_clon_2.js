var numElements; // Stores the total number of elements for the Disjoint Set Union structure
var parentArray = []; // An array representing the parent of each element in the DSU
var rankArray = []; // An array storing the rank (or approximate height) of each set tree

/**
 * Initializes the Disjoint Set Union (DSU) data structure.
 * Each element is initially placed into its own distinct set.
 */
function initializeDisjointSet() {
    // Loop through all elements from 0 to numElements - 1
    iterateRange(numElements, function(idx) {
        parentArray[idx] = idx; // Set each element as its own parent
        rankArray[idx] = 0;     // Initialize the rank of each set to zero
    });
}

/**
 * Finds the representative (root) of the set that a given element belongs to.
 * This function employs path compression for efficiency.
 * @param {number} elementIndex - The index of the element whose set representative is to be found.
 * @returns {number} The index of the representative of the set containing elementIndex.
 */
function findRepresentative(elementIndex) {
    // If the element is its own parent, it is the representative of its set
    if (parentArray[elementIndex] === elementIndex) {
        return elementIndex;
    }
    // Otherwise, recursively find the representative and apply path compression
    // by setting the element's parent directly to the found representative.
    parentArray[elementIndex] = findRepresentative(parentArray[elementIndex]);
    return parentArray[elementIndex];
}

/**
 * Determines if two elements belong to the same set.
 * @param {number} firstElement - The index of the first element.
 * @param {number} secondElement - The index of the second element.
 * @returns {boolean} True if both elements are in the same set, false otherwise.
 */
function areConnected(firstElement, secondElement) {
    // Elements are connected if their set representatives are the same.
    return findRepresentative(firstElement) === findRepresentative(secondElement);
}

/**
 * Unites the sets containing two specified elements.
 * This operation uses the union by rank heuristic to maintain tree balance.
 * @param {number} itemA - The index of the first element.
 * @param {number} itemB - The index of the second element.
 */
function unionSets(itemA, itemB) {
    var rootA = findRepresentative(itemA); // Get the representative of itemA's set
    var rootB = findRepresentative(itemB); // Get the representative of itemB's set

    // If both elements already share the same representative, they are in the same set,
    // so no union operation is needed.
    if (rootA === rootB) {
        return;
    }

    // Apply the union by rank heuristic: attach the smaller rank tree under the root of the larger rank tree.
    if (rankArray[rootA] > rankArray[rootB]) {
        parentArray[rootB] = rootA; // Make rootA the parent of rootB
    } else {
        parentArray[rootA] = rootB; // Make rootB the parent of rootA
        // If ranks were equal, the rank of the new root increases.
        if (rankArray[rootA] === rankArray[rootB]) {
            ++rankArray[rootB];
        }
    }
}

/**
 * The primary function that orchestrates the program's execution.
 * It reads input, initializes the DSU, processes queries, and outputs results.
 */
function executeProgram() {
    numElements = readInputToken(); // Read the total number of elements for the DSU
    initializeDisjointSet();        // Set up the DSU structure

    var queryCount = readInputToken(); // Read the number of operations (queries) to perform

    // Iterate through each query
    iterateRange(queryCount, function() {
        var operationType = readInputToken(); // Read the type of operation (0 for union, 1 for check)
        var valX = readInputToken();          // Read the first element involved in the query
        var valY = readInputToken();          // Read the second element involved in the query

        if (operationType === 0) {
            unionSets(valX, valY); // If operation type is 0, perform a union operation
        } else {
            // If operation type is 1, check if elements are connected and output 1 or 0.
            // The unary plus operator converts the boolean result to a number (true -> 1, false -> 0).
            outputValue(+areConnected(valX, valY));
        }
    });
}

/**
 * A flexible utility function for iterating over a range.
 * It supports two call signatures:
 * 1. `iterateRange(limit, callback)`: Iterates from 0 up to `limit` (exclusive).
 * 2. `iterateRange(start, end, callback)`: Iterates from `start` up to `end` (exclusive).
 * @param {number} startIdxOrLimit - The starting index (inclusive) or the upper limit (exclusive).
 * @param {function|number} endIdxOrCallback - The ending index (exclusive) or the callback function.
 * @param {function} [iterationCallback] - The callback function to execute for each iteration.
 */
function iterateRange(startIdxOrLimit, endIdxOrCallback, iterationCallback) {
    let currentStart = 0; // Default starting index
    let currentEnd;       // Variable to hold the upper limit (exclusive)
    let actualCallback;   // The function to be invoked in each loop iteration

    // Determine the correct arguments based on the function's overload
    if (iterationCallback === undefined) {
        // Signature: iterateRange(limit, callback)
        actualCallback = endIdxOrCallback;
        currentEnd = startIdxOrLimit;
    } else {
        // Signature: iterateRange(start, end, callback)
        currentStart = startIdxOrLimit;
        currentEnd = endIdxOrCallback;
        actualCallback = iterationCallback;
    }

    // Loop through the determined range
    for (let currentIteration = currentStart; currentIteration < currentEnd; ++currentIteration) {
        // Execute the callback function. If it returns `false`, break the loop.
        if (actualCallback(currentIteration) === false) {
            break;
        }
    }
}

// Configure Node.js standard input stream
process.stdin.resume();
process.stdin.setEncoding('utf8');

var accumulatedInput = ''; // Buffer to accumulate all incoming data from stdin
var inputTokenIndex = 0;   // Index to keep track of the current token being read from the parsed input array

/**
 * Reads and returns the next token from the processed input.
 * @param {string} [tokenType] - An optional hint for the token type. If 'string', returns as string; otherwise, attempts to convert to number.
 * @returns {string|number} The next token from the input stream.
 */
function readInputToken(tokenType) {
    if (tokenType === 'string') {
        return accumulatedInput[inputTokenIndex++]; // Return as string
    } else {
        // Convert the token to a number using the unary plus operator
        return +accumulatedInput[inputTokenIndex++];
    }
}

/**
 * Prints a given value to the standard output (console), followed by a newline.
 * @param {*} outputData - The data to be displayed.
 */
function outputValue(outputData) {
    console.log(outputData);
}

// Event listener for 'data' chunks from stdin
process.stdin.on('data', function(dataChunk) {
    accumulatedInput += dataChunk; // Append each incoming data chunk to the buffer
});

// Event listener for the 'end' of the stdin stream
process.stdin.on('end', function() {
    // Once all input is received, split it by any whitespace characters
    // and store the resulting tokens in the accumulatedInput array.
    accumulatedInput = accumulatedInput.split(/\s+/);
    executeProgram(); // Begin the main program logic
});
