var DataParser = (function() {
    /**
     * Represents a utility for reading structured input data line by line.
     * @param {string} rawInputContent - The entire input data as a single string.
     */
    function InputSourceStream(rawInputContent) {
        // Internal storage for all lines, trimmed and split.
        // Each line is initially a string, and will be split into tokens on demand.
        this._lineSegments = rawInputContent.trim().split('\n');
        // Pointer to the current line being processed.
        this._currentLinePointer = 0;
        // Cache for the tokens of the current line, once split.
        this._activeLineTokens = [];
    }

    /**
     * Helper to ensure the current line's tokens are ready.
     * This method loads tokens from the current line if not already loaded.
     * @private
     */
    InputSourceStream.prototype._ensureLineTokens = function() {
        // Only load if current line is valid and its tokens haven't been loaded or fully consumed.
        if (this._activeLineTokens.length === 0 && this._currentLinePointer < this._lineSegments.length) {
            this._activeLineTokens = this._lineSegments[this._currentLinePointer].split(' ');
        }
    };

    /**
     * Reads and extracts the next single token from the input stream.
     * Tokens are consumed from the left (start) of the current line.
     * @param {boolean} [asString=false] - If true, returns the token as a string; otherwise, attempts to convert to a number.
     * @returns {string|number} The extracted token, or NaN/empty string if end of input.
     */
    InputSourceStream.prototype.readNextToken = function(asString = false) {
        this._ensureLineTokens();

        // If no tokens are available on the current line, advance to the next.
        while (this._activeLineTokens.length === 0 && this._currentLinePointer < this._lineSegments.length) {
            this._currentLinePointer++; // Move to the next line
            this._ensureLineTokens();   // Try to load tokens for the new line
        }

        // If after trying to load, there are still no tokens, we've exhausted input.
        if (this._activeLineTokens.length === 0) {
            return asString ? "" : NaN;
        }

        const token = this._activeLineTokens.shift(); // Consume token from the beginning of the array
        return asString ? token : Number(token);
    };

    /**
     * Reads all tokens from the current line and advances the line pointer.
     * @param {boolean} [keepStrings=false] - If true, returns tokens as strings; otherwise, converts to numbers.
     * @returns {Array<string|number>} An array of tokens from the line. Returns empty array if no more lines.
     */
    InputSourceStream.prototype.fetchLineTokens = function(keepStrings = false) {
        if (this._currentLinePointer >= this._lineSegments.length) {
            return []; // No more lines to read
        }
        const currentLineContent = this._lineSegments[this._currentLinePointer++];
        // Clear any cached tokens for the previous line, as we're explicitly moving to the next.
        this._activeLineTokens = [];

        const tokens = currentLineContent.split(' ');
        return keepStrings ? tokens : tokens.map(Number);
    };

    /**
     * Reads 'count' number of lines, splitting each into tokens.
     * Advances the line pointer by 'count'.
     * @param {number} count - The number of lines to read.
     * @param {boolean} [retainStrings=false] - If true, tokens in each line are kept as strings; otherwise, converted to numbers.
     * @returns {Array<Array<string|number>>} A 2D array where each inner array represents a line's tokens.
     */
    InputSourceStream.prototype.getMultiLineData = function(count, retainStrings = false) {
        const collectedData = [];
        for (let i = 0; i < count; i++) {
            if (this._currentLinePointer >= this._lineSegments.length) {
                break; // Ran out of lines prematurely
            }
            const line = this._lineSegments[this._currentLinePointer++];
            // Clear any cached tokens, as we're processing a new line.
            this._activeLineTokens = [];
            const tokens = line.split(' ');
            collectedData.push(retainStrings ? tokens : tokens.map(Number));
        }
        return collectedData;
    };

    /**
     * Reads 'count' number of raw lines without splitting them into tokens.
     * Advances the line pointer by 'count'.
     * @param {number} count - The number of lines to read.
     * @param {boolean} [numericConversion=false] - If true, attempts to convert each line to a number; otherwise, keeps as string.
     * @returns {Array<string|number>} An array of raw lines.
     */
    InputSourceStream.prototype.readRawLines = function(count, numericConversion = false) {
        const rawLines = [];
        for (let i = 0; i < count; i++) {
            if (this._currentLinePointer >= this._lineSegments.length) {
                break;
            }
            const line = this._lineSegments[this._currentLinePointer++];
            // Clear cached tokens.
            this._activeLineTokens = [];
            rawLines.push(numericConversion ? Number(line) : line);
        }
        return rawLines;
    };

    // The factory function to create an instance of InputSourceStream.
    // This is the public interface of the DataParser module.
    return function(sourceContent) {
        return new InputSourceStream(sourceContent);
    };
})();

// --- Helper for N-dimensional array creation without using eval ---

/**
 * Dynamically creates an N-dimensional array initialized with a specific value.
 * This function uses recursion to build the array structure, avoiding `eval`
 * for better security and predictability.
 * @param {*} initialValue - The value to initialize all elements with.
 * @param {...number} dimensions - The sizes of each dimension (e.g., `createNDArray(0, 3, 4)` for a 3x4 array).
 * @returns {Array} The N-dimensional array.
 */
function createNDArray(initialValue, ...dimensions) {
    // Base case: If no more dimensions, return the initial value.
    if (dimensions.length === 0) {
        return initialValue;
    }

    const currentDimensionSize = dimensions[0];
    // If the dimension size is invalid, return an empty array or throw an error.
    if (currentDimensionSize <= 0) {
        return [];
    }
    
    const remainingDimensions = dimensions.slice(1);
    const result = new Array(currentDimensionSize);

    for (let i = 0; i < currentDimensionSize; i++) {
        // Recursively create sub-arrays for the remaining dimensions.
        result[i] = createNDArray(initialValue, ...remainingDimensions);
    }
    return result;
}

// Global constant for representing "infinity" in pathfinding algorithms.
// Using a large number (1 billion) to ensure it's greater than any valid edge weight
// but small enough to prevent overflow issues when two "infinite" paths are summed.
const POSITIVE_INFINITY = 1_000_000_000;

// Main execution starts here.
// Reads input from standard input using Node.js 'fs' module.
const inputReader = DataParser(require("fs").readFileSync("/dev/stdin", "utf8"));

// Kicks off the main algorithm and prints its computed result to the console.
console.log(executeAlgorithm());

/**
 * The core algorithm function to solve the problem.
 * This function implements the Floyd-Warshall algorithm to find all-pairs
 * shortest paths in a graph, and then counts specific "redundant" edges.
 * @returns {number} The final calculated count of redundant edges.
 */
function executeAlgorithm() {
    // Read the number of vertices (nodes) and the number of edges from the input.
    const vertexCount = inputReader.readNextToken();
    const edgeCount = inputReader.readNextToken();

    // Guard clause: Validate input sizes to prevent errors or meaningless computations.
    if (vertexCount === null || isNaN(vertexCount) || vertexCount <= 0 || edgeCount === null || isNaN(edgeCount) || edgeCount < 0) {
        // Log a warning for invalid input and return a default value (e.g., 0).
        console.warn(`Warning: Invalid vertex count (${vertexCount}) or edge count (${edgeCount}) provided. Returning 0.`);
        return 0;
    }

    // Initialize the adjacency matrix (distance map) for all-pairs shortest paths.
    // All distances are initially set to a large value representing "infinity".
    const distanceMap = createNDArray(POSITIVE_INFINITY, vertexCount, vertexCount);

    // Populate diagonal entries: the distance from a node to itself is always 0.
    for (let currentVertexIndex = 0; currentVertexIndex < vertexCount; currentVertexIndex++) {
        distanceMap[currentVertexIndex][currentVertexIndex] = 0;
    }

    // Read the list of raw edges. Each edge contains a source, destination, and weight.
    // The original problem uses 1-based indexing for nodes, so we will adjust to 0-based.
    const initialEdges = inputReader.getMultiLineData(edgeCount);

    // Populate the distance map with the initial edge weights.
    // For an undirected graph, update distances for both (sourceNode, destNode) and (destNode, sourceNode).
    for (let edgeIteration = 0; edgeIteration < edgeCount; edgeIteration++) {
        const currentEdgeDetails = initialEdges[edgeIteration];
        const rawSource = currentEdgeDetails[0];
        const rawDestination = currentEdgeDetails[1];
        const edgeWeight = currentEdgeDetails[2];

        // Adjust node indices from 1-based to 0-based.
        const sourceNode = rawSource - 1;
        const destinationNode = rawDestination - 1;

        // Basic validation for node indices to prevent out-of-bounds access.
        if (sourceNode < 0 || sourceNode >= vertexCount || destinationNode < 0 || destinationNode >= vertexCount) {
             console.error(`Error: Edge ${edgeIteration + 1} specifies out-of-bounds node indices: (${rawSource}, ${rawDestination}). Skipping this edge.`);
             continue; // Skip processing this invalid edge.
        }
        if (edgeWeight < 0) {
            console.warn(`Warning: Edge ${edgeIteration + 1} has a negative weight (${edgeWeight}). Floyd-Warshall assumes non-negative weights for correct interpretation of "shortest" path. Proceeding, but results might be unexpected.`);
            // The original problem context usually implies non-negative weights for Floyd-Warshall.
            // For cloning, we'll keep the value but add a warning.
        }

        // Update the distance map. If multiple edges exist between the same two nodes,
        // we store the minimum weight. This is important for correctly initializing the algorithm.
        distanceMap[sourceNode][destinationNode] = Math.min(distanceMap[sourceNode][destinationNode], edgeWeight);
        // For an undirected graph, the path is symmetric.
        distanceMap[destinationNode][sourceNode] = Math.min(distanceMap[destinationNode][sourceNode], edgeWeight);
    }

    // --- Floyd-Warshall Algorithm for All-Pairs Shortest Paths ---
    // The algorithm iterates through all possible intermediate nodes 'k'.
    // Then, for every pair of nodes (i, j), it checks if passing through 'k'
    // provides a shorter path than the currently known shortest path.
    for (let intermediateVertex = 0; intermediateVertex < vertexCount; intermediateVertex++) {
        for (let startVertex = 0; startVertex < vertexCount; startVertex++) {
            for (let endVertex = 0; endVertex < vertexCount; endVertex++) {
                // Calculate the potential path length if going from startVertex to intermediateVertex
                // and then from intermediateVertex to endVertex.
                const potentialPathLength = distanceMap[startVertex][intermediateVertex] + distanceMap[intermediateVertex][endVertex];

                // Check for potential overflow if adding two large "infinity" values.
                // If either segment of the path is effectively infinite, the combined path is also infinite.
                // This check ensures `POSITIVE_INFINITY + POSITIVE_INFINITY` doesn't wrap around
                // or become a value that might be incorrectly considered shorter.
                if (distanceMap[startVertex][intermediateVertex] === POSITIVE_INFINITY ||
                    distanceMap[intermediateVertex][endVertex] === POSITIVE_INFINITY) {
                    // If either segment is unreachable, `potentialPathLength` might still be a large number,
                    // but it's not a valid finite path. We don't update if the current path is finite.
                    // If the current path is also infinite, no change.
                    // This specific check is a slight modification from the original's implicit handling
                    // of large numbers, making it more robust against edge cases with very large "infinity" constants.
                    // However, for cloning, the core comparison `>` is maintained.
                } else if (distanceMap[startVertex][endVertex] > potentialPathLength) {
                    // If the new path through the intermediate vertex is shorter, update the distance.
                    distanceMap[startVertex][endVertex] = potentialPathLength;
                }
            }
        }
    }

    // --- Count "redundant" edges ---
    // An edge from the initial input is considered "redundant" if its original weight
    // is strictly greater than the shortest path found between its endpoints
    // by the Floyd-Warshall algorithm. This implies the edge is not essential
    // for the shortest path between its own endpoints.
    let countOfRedundantEdges = 0;
    for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
        const currentEdge = initialEdges[edgeIndex];
        const sourceNodeAdjusted = currentEdge[0] - 1; // 0-based source node
        const destinationNodeAdjusted = currentEdge[1] - 1; // 0-based destination node
        const originalEdgeWeight = currentEdge[2];

        // Retrieve the shortest path distance between these two nodes from the computed distance map.
        const shortestPathBetweenNodes = distanceMap[sourceNodeAdjusted][destinationNodeAdjusted];

        // If the shortest path found is strictly less than the original weight of this edge,
        // it means a shorter alternative path exists, making the original edge "redundant"
        // in terms of contributing to the overall shortest path between its own endpoints.
        if (shortestPathBetweenNodes < originalEdgeWeight) {
            countOfRedundantEdges++;
        }
    }

    return countOfRedundantEdges;
}