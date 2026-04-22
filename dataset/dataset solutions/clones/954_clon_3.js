let graphNodeCount; // Renamed from 'n'
let allGraphEdges = []; // Renamed from 'g'
let parentRepresentative = []; // Renamed from 'p', holds parent pointers for DSU
let unionRankValues = []; // Renamed from 'r', stores ranks for DSU union-by-rank optimization

// Global variable to accumulate incoming data from stdin.
let bufferedInput = '';
// Keeps track of the current position in the tokenized input array.
let inputTokenPointer = 0;
// Stores the input tokens after splitting.
let tokenizedInputArray = [];

/**
 * Initializes the Disjoint Set Union (DSU) structure for a given number of elements.
 * Each element is initially placed in its own set, with itself as the representative
 * and a rank of zero. This function corrects the original's behavior of using edge count
 * instead of node count for initialization.
 * @param {number} numberOfElements The total number of elements (nodes) to initialize DSU for.
 */
function initializeDisjointSetStructure(numberOfElements) {
    // Guard clause: Ensure a valid number of elements is provided.
    if (numberOfElements <= 0) {
        console.error("Error: Cannot initialize DSU for zero or negative elements. Aborting initialization.");
        // We might want to throw an error here in a production system.
        return;
    }

    // Clear and resize the arrays to match the new number of elements.
    parentRepresentative = new Array(numberOfElements);
    unionRankValues = new Array(numberOfElements);

    // Populate the arrays: each element is its own parent, and all ranks are zero.
    // This loop replaces the custom 'rep' function from the original.
    for (let currentElementIndex = 0; currentElementIndex < numberOfElements; ++currentElementIndex) {
        parentRepresentative[currentElementIndex] = currentElementIndex;
        unionRankValues[currentElementIndex] = 0;
    }
}

/**
 * Finds the representative (root) of the set containing the given element.
 * This function uses path compression to flatten the tree structure,
 * making future find operations faster.
 * @param {number} elementIdentifier The index of the element to find the representative for.
 * @returns {number} The representative of the element's set, or -1 if the elementIdentifier is invalid.
 */
function findRepresentative(elementIdentifier) {
    // Guard clause: Validate the element identifier.
    if (elementIdentifier < 0 || elementIdentifier >= parentRepresentative.length) {
        console.error(`Error: Attempted to find representative for an invalid element identifier: ${elementIdentifier}.`);
        return -1; // Indicate an invalid state or error.
    }

    // If the element is its own parent, it is the representative of its set.
    if (parentRepresentative[elementIdentifier] === elementIdentifier) {
        return elementIdentifier;
    } else {
        // Path compression step: Recursively find the root and then directly
        // link the current element to that root, flattening the path.
        parentRepresentative[elementIdentifier] = findRepresentative(parentRepresentative[elementIdentifier]);
        return parentRepresentative[elementIdentifier];
    }
}

/**
 * Checks if two elements belong to the same disjoint set (i.e., are connected).
 * @param {number} firstElement The identifier for the first element.
 * @param {number} secondElement The identifier for the second element.
 * @returns {boolean} True if both elements have the same set representative, false otherwise.
 */
function areElementsConnected(firstElement, secondElement) {
    // Elements are connected if their set representatives are the same.
    return findRepresentative(firstElement) === findRepresentative(secondElement);
}

/**
 * Merges the sets containing two given elements using the union-by-rank heuristic.
 * This strategy helps to keep the DSU trees shallow, optimizing performance.
 * @param {number} nodeIdentifierA The identifier for the first element.
 * @param {number} nodeIdentifierB The identifier for the second element.
 * @returns {boolean} True if a merge operation successfully occurred, false if elements were already in the same set or an error occurred.
 */
function mergeSets(nodeIdentifierA, nodeIdentifierB) {
    let rootOfSetA = findRepresentative(nodeIdentifierA);
    let rootOfSetB = findRepresentative(nodeIdentifierB);

    // Guard clause: Check for invalid representatives returned by findRepresentative.
    if (rootOfSetA === -1 || rootOfSetB === -1) {
        console.error("Error: One or both node identifiers were invalid during mergeSets operation.");
        return false;
    }

    // If both elements are already in the same set, no merge is needed.
    if (rootOfSetA === rootOfSetB) {
        return false;
    }

    // Union by rank heuristic: Attach the root of the smaller rank tree
    // to the root of the larger rank tree. This prevents the trees from becoming too tall.
    if (unionRankValues[rootOfSetA] > unionRankValues[rootOfSetB]) {
        parentRepresentative[rootOfSetB] = rootOfSetA;
    } else if (unionRankValues[rootOfSetB] > unionRankValues[rootOfSetA]) {
        parentRepresentative[rootOfSetA] = rootOfSetB;
    } else {
        // If ranks are equal, arbitrarily choose one root (e.g., rootB) as the new parent
        // and increment its rank because the tree depth has effectively increased.
        parentRepresentative[rootOfSetA] = rootOfSetB;
        unionRankValues[rootOfSetB]++;
    }
    return true; // A successful merge occurred.
}

/**
 * Implements Kruskal's algorithm to compute the Minimum Spanning Tree (MST) weight
 * for a graph provided via an adjacency matrix.
 * This function encapsulates the main logic of the program.
 */
function calculateMinimumSpanningTree() {
    graphNodeCount = readNextToken(); // Read the total number of vertices from input.

    // Input processing: reading the adjacency matrix to construct a list of edges.
    // We iterate through all possible pairs (i, j) to find valid edges.
    for (let sourceNodeIndex = 0; sourceNodeIndex < graphNodeCount; ++sourceNodeIndex) {
        for (let targetNodeIndex = 0; targetNodeIndex < graphNodeCount; ++targetNodeIndex) {
            const currentEdgeWeight = readNextToken(); // Read the weight for edge (sourceNodeIndex, targetNodeIndex).

            // Only add edges that are valid (weight not -1) and unique (sourceNodeIndex < targetNodeIndex
            // to avoid duplicates from symmetric adjacency matrix and self-loops).
            if (sourceNodeIndex < targetNodeIndex && currentEdgeWeight !== -1) {
                // Store edge as [weight, source_node, target_node].
                allGraphEdges.push([currentEdgeWeight, sourceNodeIndex, targetNodeIndex]);
            }
        }
    }

    // Sort all collected edges in non-decreasing order of their weights.
    // This is a fundamental step for Kruskal's algorithm.
    allGraphEdges.sort((edgeOne, edgeTwo) => {
        // Compare based on the first element (weight) of each edge array.
        return edgeOne[0] - edgeTwo[0];
    });

    // Initialize the DSU structure for 'graphNodeCount' nodes.
    initializeDisjointSetStructure(graphNodeCount);

    let totalMinimumWeight = 0; // Accumulator for the total weight of the MST.
    let edgesIncludedInMst = 0; // Counter for the number of edges successfully added to the MST.

    // Iterate through the sorted edges.
    // This loop replaces another usage of the custom 'rep' function.
    for (let edgeCursor = 0; edgeCursor < allGraphEdges.length; ++edgeCursor) {
        // Optimization: If we have already found (graphNodeCount - 1) edges,
        // we have a complete MST (for a connected graph with N nodes).
        if (edgesIncludedInMst === graphNodeCount - 1 && graphNodeCount > 0) {
            break; // Exit early as the MST is complete.
        }

        const currentConsideredEdge = allGraphEdges[edgeCursor];
        const edgeWeightValue = currentConsideredEdge[0];
        const nodeEndpointU = currentConsideredEdge[1];
        const nodeEndpointV = currentConsideredEdge[2];

        // Check if adding this edge would form a cycle in the current MST.
        // If the two endpoints are not already connected, include this edge.
        if (!areElementsConnected(nodeEndpointU, nodeEndpointV)) {
            totalMinimumWeight += edgeWeightValue; // Add the edge's weight to the MST total.
            mergeSets(nodeEndpointU, nodeEndpointV); // Unite the sets of the two endpoints.
            edgesIncludedInMst++; // Increment the count of edges in the MST.
        }
    }

    // Final check: If the number of edges in MST is less than N-1 (for N > 1),
    // it implies the graph is not connected, and a spanning tree cannot be formed
    // for all vertices. For this problem, we typically assume connected graphs.
    if (graphNodeCount > 1 && edgesIncludedInMst !== graphNodeCount - 1) {
        // console.warn("Warning: The graph appears to be disconnected. The calculated weight may not represent a spanning tree for all vertices.");
    }

    // Display the final accumulated minimum weight.
    displayResult(totalMinimumWeight);
}

/**
 * Reads the next token from the pre-processed input array.
 * @param {string} expectedType The desired type for the token ('string' or 'number'). Defaults to 'number'.
 * @returns {string|number|undefined} The processed token, or undefined if no more tokens are available.
 */
function readNextToken(expectedType = 'number') {
    // Guard clause: Check if the input token pointer has exceeded the bounds of the array.
    if (inputTokenPointer >= tokenizedInputArray.length) {
        console.error("Error: Attempted to read past the end of the input tokens.");
        return undefined; // Indicate that no more input is available.
    }

    const tokenString = tokenizedInputArray[inputTokenPointer];
    inputTokenPointer++; // Advance the pointer for the next read operation.

    // Convert the token based on the expected type.
    if (expectedType === 'string') {
        return tokenString;
    } else {
        // Default conversion to number using the unary plus operator.
        const numericValue = +tokenString;
        // Optional: Log a warning if conversion results in NaN.
        if (isNaN(numericValue)) {
            // console.warn(`Warning: Input token '${tokenString}' could not be converted to a number.`);
        }
        return numericValue;
    }
}

/**
 * Displays the final calculated result to the standard output.
 * @param {any} valueToOutput The value to be printed to the console.
 */
function displayResult(valueToOutput) {
    // Using console.log is the standard way to output in Node.js.
    console.log(valueToOutput);
}

/**
 * Sets up the event listeners for Node.js standard input (stdin).
 * It buffers all incoming data, processes it upon 'end' event,
 * and then initiates the main algorithm. This function encapsulates
 * the Node.js specific input handling.
 */
function setupInputProcessingAndRun() {
    // Ensure stdin is active and correctly set up to receive UTF-8 encoded text.
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    // Event handler for 'data' chunks received from stdin.
    process.stdin.on('data', (dataChunk) => {
        bufferedInput += dataChunk; // Append each incoming chunk to the buffer.
    });

    // Event handler for when all data from stdin has been received.
    process.stdin.on('end', () => {
        const trimmedInput = bufferedInput.trim();
        // Guard clause: Check if the input buffer is empty after trimming.
        if (trimmedInput.length === 0) {
            console.error("Error: No input data provided. Exiting program.");
            return; // Exit if there's no data to process.
        }
        // Split the entire input buffer into an array of tokens using whitespace as delimiter.
        tokenizedInputArray = trimmedInput.split(/\s+/);

        // Once input is ready, execute the main algorithm.
        calculateMinimumSpanningTree();
    });

    // Optional: Add an error handler for stdin to catch potential issues during input.
    process.stdin.on('error', (err) => {
        console.error("An error occurred while reading from stdin:", err);
        process.exit(1); // Exit with an error code to indicate failure.
    });
}

// Initiate the input processing and start the algorithm.
setupInputProcessingAndRun();