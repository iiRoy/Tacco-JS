/*
 * InputDataStream: A utility module for parsing multi-line string input.
 * It provides a factory function to create a parser instance, which can then
 * be used to read tokens, entire lines, or blocks of lines, converting them
 * to numbers or keeping them as strings as needed. This module is designed
 * to handle structured text input efficiently.
 */
var InputDataStream = (function () {
    /**
     * Factory function: Creates and returns a new instance of InputDataParser.
     * This is the primary entry point for using the input parsing utility.
     *
     * @param {string} rawInputContent - The complete input data as a single string.
     * @returns {InputDataParser} A new parser object configured with the provided input.
     */
    function createParser(rawInputContent) {
        return new InputDataParser(rawInputContent);
    }

    /**
     * InputDataParser Class: Manages the state and operations for parsing input.
     * It processes the raw input into an array of lines and keeps track of
     * the current line being processed.
     *
     * @param {string} rawInputContent - The string content to be parsed.
     */
    function InputDataParser(rawInputContent) {
        // Ensure input is a string, trim whitespace, split into lines, and filter out empty lines.
        this._sourceLines = String(rawInputContent).trim().split("\n").filter(line => line.length > 0);
        this._currentLineIndex = 0; // Index of the current line being read.
    }

    /**
     * Internal helper: Prepares the current line for token extraction.
     * If the current line is still a raw string, it splits it into tokens (words)
     * and reverses the array. Reversing allows efficient extraction using `pop()`,
     * reading tokens from right-to-left as per the original logic.
     * Throws an error if an attempt is made to read beyond the end of the input.
     */
    InputDataParser.prototype._ensureLineIsTokenized = function () {
        if (this._currentLineIndex >= this._sourceLines.length) {
            throw new Error("Input stream exhausted: No more lines to read.");
        }
        // If the current line is a string, tokenize it and reverse for pop() operations.
        if (typeof this._sourceLines[this._currentLineIndex] === "string") {
            const tokens = this._sourceLines[this._currentLineIndex].split(" ");
            // Filter out any empty strings that might result from multiple spaces.
            this._sourceLines[this._currentLineIndex] = tokens.filter(t => t.length > 0).reverse();
        }
    };

    /**
     * Extracts and returns a single token (word) from the current line.
     * Tokens are read from right-to-left from the current line. Once a line
     * is exhausted, the parser automatically advances to the next line.
     *
     * @param {boolean} [returnAsString=false] - If true, the token is returned as a string; otherwise, it's converted to a number.
     * @returns {string|number} The extracted token.
     */
    InputDataParser.prototype.extractToken = function (returnAsString = false) {
        this._ensureLineIsTokenized(); // Prepare the current line.

        const currentLineTokens = this._sourceLines[this._currentLineIndex];

        // If the current line is empty after tokenization (e.g., a line with only spaces),
        // advance and try to read from the next line.
        if (currentLineTokens.length === 0) {
            this._currentLineIndex++;
            return this.extractToken(returnAsString); // Recursive call for the next line.
        }

        const tokenValue = currentLineTokens.pop(); // Get the last token (first from right after reverse).

        // If the current line's token array is now empty, advance the line index.
        if (currentLineTokens.length === 0) {
            this._currentLineIndex++;
        }

        return returnAsString ? tokenValue : Number(tokenValue);
    };

    /**
     * Reads the entire current line, splits it into tokens, and advances to the next line.
     *
     * @param {boolean} [returnAsStringArray=false] - If true, returns an array of strings; otherwise, an array of numbers.
     * @returns {Array<string|number>} An array of values from the line.
     */
    InputDataParser.prototype.readEntireLine = function (returnAsStringArray = false) {
        if (this._currentLineIndex >= this._sourceLines.length) {
            throw new Error("Input stream exhausted: Cannot read full line.");
        }
        const rawLine = this._sourceLines[this._currentLineIndex++]; // Get line and advance index.
        const tokens = rawLine.split(" ").filter(t => t.length > 0); // Split and filter empty tokens.
        return returnAsStringArray ? tokens : tokens.map(val => Number(val));
    };

    /**
     * Reads a specified number of lines as a matrix (2D array). Each line is split into tokens.
     *
     * @param {number} numRows - The number of lines to read for the matrix.
     * @param {boolean} [returnAsStringMatrix=false] - If true, returns a 2D array of strings; otherwise, a 2D array of numbers.
     * @returns {Array<Array<string|number>>} The parsed matrix.
     */
    InputDataParser.prototype.readMatrixBlock = function (numRows, returnAsStringMatrix = false) {
        if (this._currentLineIndex + numRows > this._sourceLines.length) {
            throw new Error(`Insufficient lines to read a matrix of ${numRows} rows.`);
        }
        // Slice the required lines, map each to an array of tokens.
        const matrixSegment = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + numRows)
            .map(line => line.split(" ").filter(t => t.length > 0)); // Split and filter.
        this._currentLineIndex += numRows; // Advance the line index.

        return returnAsStringMatrix ? matrixSegment : matrixSegment.map(row => row.map(val => Number(val)));
    };

    /**
     * Reads a specified number of lines as raw strings or numbers without splitting them into tokens.
     *
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} [returnAsStringArray=false] - If true, returns an array of strings; otherwise, an array of numbers.
     * @returns {Array<string|number>} An array of the raw lines.
     */
    InputDataParser.prototype.readRawLineBlock = function (numLines, returnAsStringArray = false) {
        if (this._currentLineIndex + numLines > this._sourceLines.length) {
            throw new Error(`Insufficient lines to read a block of ${numLines} raw lines.`);
        }
        const lines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + numLines);
        this._currentLineIndex += numLines;
        return returnAsStringArray ? lines : lines.map(val => Number(val));
    };

    return createParser; // Return the factory function.
})();

/*
 * createMultiDimArray: A utility function to dynamically create multi-dimensional arrays.
 * This implementation replaces the original 'eval'-based approach with a safer
 * and more explicit recursive function, enhancing code safety and readability.
 */

/**
 * Internal recursive helper for `createMultiDimArray`.
 * This function builds the array dimension by dimension.
 *
 * @param {Array<number>} dimensions - An array of integers, where each integer specifies the size of a dimension.
 * @param {number} currentDimensionIndex - The index of the dimension currently being constructed.
 * @param {*} defaultValue - The value to be used for the innermost elements of the array.
 * @returns {Array} A partially or fully constructed multi-dimensional array.
 */
function _buildRecursiveArray(dimensions, currentDimensionIndex, defaultValue) {
    // Base case: If we've processed all dimensions, return the default value.
    if (currentDimensionIndex >= dimensions.length) {
        // Special handling: if defaultValue is the string "[]", return a new empty array.
        // This allows initializing leaf nodes as empty arrays, useful for adjacency lists.
        if (typeof defaultValue === 'string' && defaultValue === '[]') {
            return [];
        }
        // For other default values (e.g., numbers, objects), return them directly.
        return defaultValue;
    }

    const currentDimensionSize = dimensions[currentDimensionIndex];
    const newArray = new Array(currentDimensionSize); // Create an array for the current dimension.

    // Recursively fill the current dimension with arrays for the next dimension.
    for (let i = 0; i < currentDimensionSize; i++) {
        newArray[i] = _buildRecursiveArray(dimensions, currentDimensionIndex + 1, defaultValue);
    }
    return newArray;
}

/**
 * Creates a multi-dimensional array initialized with a specified default value.
 * This function is variadic, accepting the default value first, followed by
 * any number of dimension sizes.
 *
 * @param {*} defaultValue - The value to initialize all elements of the innermost dimension with.
 *                           Can be a primitive, an object, or the special string "[]" to create empty arrays.
 * @param {...number} dimensions - A variable number of arguments, each representing the size of a dimension.
 * @returns {Array} The newly created and initialized multi-dimensional array.
 */
function createMultiDimArray(defaultValue, ...dimensions) {
    // If no dimensions are provided, simply return the default value (or an empty array if "[]").
    if (dimensions.length === 0) {
        if (typeof defaultValue === 'string' && defaultValue === '[]') {
            return [];
        }
        return defaultValue;
    }
    // Start the recursive array building process.
    return _buildRecursiveArray(dimensions, 0, defaultValue);
}

// Initialize the global input parser instance by reading from standard input.
var inputReader = InputDataStream(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * executeSolution: The main program logic.
 * This function orchestrates the reading of input, construction of the tree,
 * calculation of its diameter, and determination of the final game outcome.
 */
function executeSolution() {
    // Read the total number of nodes (vertices) in the tree from the input.
    const numberOfNodes = inputReader.extractToken();

    // Basic validation: A tree must have at least one node.
    if (numberOfNodes <= 0) {
        console.error("Error: The number of nodes must be a positive integer.");
        return "Error: Invalid Input"; // Or throw an error, depending on desired error handling.
    }

    // Initialize the adjacency list for the graph.
    // Each element `graphAdjacencyList[i]` will be an array containing the neighbors of node `i`.
    // `createMultiDimArray("[]", numberOfNodes)` ensures each entry is an empty array.
    const graphAdjacencyList = createMultiDimArray("[]", numberOfNodes);

    // Read N-1 edges to construct the tree structure.
    // The input edges are 1-indexed, so we convert them to 0-indexed for array access.
    for (let edgeCounter = 0; edgeCounter < numberOfNodes - 1; edgeCounter++) {
        const edgeNodes = inputReader.readEntireLine(); // Reads a line with two node IDs.
        const nodeIdentifierA = edgeNodes[0] - 1; // Convert first node ID to 0-indexed.
        const nodeIdentifierB = edgeNodes[1] - 1; // Convert second node ID to 0-indexed.

        // Add both directions to the adjacency list as the graph is undirected (a tree).
        graphAdjacencyList[nodeIdentifierA].push(nodeIdentifierB);
        graphAdjacencyList[nodeIdentifierB].push(nodeIdentifierA);
    }

    // Calculate the diameter of the constructed tree.
    const treeDiameterValue = calculateTreeDiameter(graphAdjacencyList);

    // Determine the winner ("Second" or "First") based on the diameter's modulo 3.
    // This is a specific game rule from the problem context.
    const diameterModuloThree = treeDiameterValue % 3;
    if (diameterModuloThree === 1) {
        return "Second";
    } else {
        return "First";
    }
}

/*
 * calculateTreeDiameter: Finds the longest path (diameter) in a given tree.
 * This function implements the standard two-BFS algorithm for tree diameter:
 * 1. Perform a Breadth-First Search (BFS) starting from an arbitrary node (e.g., node 0)
 *    to find the node farthest from it. Let's call this node 'endpointA'.
 * 2. Perform a second BFS starting from 'endpointA' to find the node farthest from 'endpointA'.
 *    The distance found in this second BFS is the tree's diameter.
 */
/**
 * Calculates the diameter (the length of the longest path) of a tree.
 *
 * @param {Array<Array<number>>} adjacencyList - The adjacency list representation of the tree.
 *                                               Each element `adjacencyList[i]` is an array of neighbors of node `i`.
 * @returns {number} The integer value of the tree's diameter.
 */
function calculateTreeDiameter(adjacencyList) {
    const totalVertices = adjacencyList.length;

    // Handle edge cases for empty or single-node trees.
    if (totalVertices === 0) {
        return 0; // An empty graph has a diameter of 0.
    }
    if (totalVertices === 1) {
        return 0; // A single-node tree has a diameter of 0.
    }

    /**
     * Performs a Breadth-First Search (BFS) starting from a given node.
     * It identifies the node farthest from the start node and the maximum distance reached.
     *
     * @param {number} startNodeId - The ID of the node to start the BFS from.
     * @returns {{farthestVertex: number, maximumDistance: number}} An object containing the ID of the farthest node and its distance.
     */
    function performBFS(startNodeId) {
        // Initialize distances array: -1 indicates an unvisited node.
        const distanceMap = new Array(totalVertices).fill(-1);
        const bfsQueue = []; // The queue for BFS traversal.
        let furthestNodeInCurrentBFS = startNodeId; // Tracks the node found furthest from startNodeId.
        let maxDistanceInCurrentBFS = 0; // Tracks the maximum distance found in this BFS.

        // Enqueue the starting node with a distance of 0.
        bfsQueue.push({ vertexId: startNodeId, distFromStart: 0 });
        distanceMap[startNodeId] = 0; // Mark start node as visited with distance 0.

        let queueHeadPointer = 0; // Manual pointer for efficient queue processing (avoids `Array.shift()`).

        // Continue BFS as long as there are nodes in the queue.
        while (queueHeadPointer < bfsQueue.length) {
            const { vertexId: currentVertex, distFromStart: currentDistance } = bfsQueue[queueHeadPointer++];

            // Update the farthest node and maximum distance if a longer path is discovered.
            if (currentDistance > maxDistanceInCurrentBFS) {
                maxDistanceInCurrentBFS = currentDistance;
                furthestNodeInCurrentBFS = currentVertex;
            } else if (currentDistance === maxDistanceInCurrentBFS) {
                // If multiple nodes are at the same maximum distance,
                // consistently choose the one with the smallest ID.
                furthestNodeInCurrentBFS = Math.min(furthestNodeInCurrentBFS, currentVertex);
            }

            // Explore all neighbors of the current vertex.
            for (const neighborId of adjacencyList[currentVertex]) {
                // If the neighbor has not been visited yet (distance is -1).
                if (distanceMap[neighborId] === -1) {
                    distanceMap[neighborId] = currentDistance + 1; // Set its distance.
                    bfsQueue.push({ vertexId: neighborId, distFromStart: currentDistance + 1 }); // Enqueue neighbor.
                }
            }
        }
        return { farthestVertex: furthestNodeInCurrentBFS, maximumDistance: maxDistanceInCurrentBFS };
    }

    // Step 1: Perform the first BFS starting from an arbitrary node (node 0).
    // This finds one endpoint of the tree's diameter.
    const firstBFSResult = performBFS(0);
    const diameterEndpointA = firstBFSResult.farthestVertex;

    // Step 2: Perform the second BFS starting from 'diameterEndpointA'.
    // The maximum distance found in this BFS is the actual diameter of the tree.
    const secondBFSResult = performBFS(diameterEndpointA);
    const finalDiameterLength = secondBFSResult.maximumDistance;

    return finalDiameterLength;
}

// Execute the main solution logic and output the result to the console.
console.log(executeSolution());