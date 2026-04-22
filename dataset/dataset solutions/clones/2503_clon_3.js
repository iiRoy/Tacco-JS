(() => {
    "use strict";

    // --- Global Constants and Utilities ---
    // A very large number to represent infinite distances or unreachable paths.
    // Slightly different from original's 99999999999.
    const PATH_IMPOSSIBLE = Number.MAX_SAFE_INTEGER;
    // Standard input path for competitive programming environments.
    const SOURCE_INPUT_STREAM = "/dev/stdin";

    /**
     * @typedef {number[][]} AdjacencyMatrix
     * Represents a 2D array where matrix[i][j] stores the distance from node i to node j.
     */

    /**
     * Helper function to create and initialize a square adjacency matrix.
     * @param {number} dimensions - The number of rows and columns (number of vertices).
     * @param {number} initialValue - The value to fill each cell with.
     * @returns {AdjacencyMatrix} A new matrix filled with the initial value.
     */
    const createSquareMatrix = (dimensions, initialValue) => {
        if (dimensions < 0) {
            console.error("Matrix dimensions cannot be negative.");
            return [];
        }
        return Array.from({ length: dimensions }, () => Array(dimensions).fill(initialValue));
    };

    /**
     * Helper function to safely parse an integer from a string.
     * @param {string} token - The string token to parse.
     * @param {number} defaultValue - The value to return if parsing fails.
     * @returns {number} The parsed integer or the default value.
     */
    const parseNumericToken = (token, defaultValue = 0) => {
        const parsed = parseInt(token, 10);
        return isNaN(parsed) ? defaultValue : parsed;
    };

    // --- Core Data Structures ---

    /**
     * @class TokenQueue
     * A simple queue implementation optimized for sequential token consumption.
     * Manages a collection of items, allowing addition to the end and removal from the front.
     */
    class TokenQueue {
        /**
         * Initializes a new queue, optionally with starting elements.
         * @param {Array<string>} [initialElements=[]] - Elements to pre-populate the queue.
         */
        constructor(initialElements = []) {
            /** @private @type {Array<string>} The underlying array storing queue elements. */
            this._elementStorage = initialElements;
            /** @private @type {number} The index of the next element to be dequeued. */
            this._headIndex = 0;
            // No need for a separate size property if we can derive it or rely on array length.
        }

        /**
         * Adds one or more elements to the end of the queue.
         * @param {...string} elementsToAdd - Elements to enqueue.
         */
        enqueue(...elementsToAdd) {
            this._elementStorage.push(...elementsToAdd);
        }

        /**
         * Removes and returns the element at the front of the queue.
         * Returns `null` if the queue is empty.
         * @returns {string | null} The dequeued element or null.
         */
        dequeue() {
            if (this.isEmpty()) {
                return null; // Explicitly return null for empty queue.
            }
            return this._elementStorage[this._headIndex++];
        }

        /**
         * Returns the element at the front of the queue without removing it.
         * Returns `null` if the queue is empty.
         * @returns {string | null} The front element or null.
         */
        peek() {
            return this.isEmpty() ? null : this._elementStorage[this._headIndex];
        }

        /**
         * Checks if the queue contains any elements.
         * @returns {boolean} True if the queue is empty, false otherwise.
         */
        isEmpty() {
            return this._headIndex >= this._elementStorage.length;
        }

        /**
         * Gets the current number of elements in the queue.
         * @returns {number} The count of elements.
         */
        get size() {
            return this._elementStorage.length - this._headIndex;
        }

        /**
         * Clears all elements from the queue, resetting it to an empty state.
         */
        resetQueue() {
            this._elementStorage = [];
            this._headIndex = 0;
        }
    }

    /**
     * @class InputParser
     * Handles parsing raw input string into usable tokens and numbers.
     * Utilizes a `TokenQueue` internally to manage parsed tokens.
     */
    class InputParser {
        /**
         * Creates an input handler from a raw string.
         * @param {string} rawInputContent - The complete input string, typically from stdin.
         */
        constructor(rawInputContent) {
            // Split by any whitespace, then filter out empty strings.
            const initialTokens = rawInputContent.split(/\s+/).filter(Boolean);
            /** @private @type {TokenQueue} The queue holding parsed string tokens. */
            this._tokenBuffer = new TokenQueue(initialTokens);
        }

        /**
         * Reads and returns the next raw string token from the input.
         * @returns {string | null} The next token or null if no more tokens.
         */
        retrieveRawToken() {
            return this._tokenBuffer.dequeue();
        }

        /**
         * Reads the next token and attempts to parse it as an integer.
         * @returns {number} The parsed integer, or 0 if parsing fails or no more tokens.
         */
        retrieveInteger() {
            const token = this._tokenBuffer.dequeue();
            return token !== null ? parseNumericToken(token) : 0;
        }

        /**
         * Checks if there are more tokens available in the input stream.
         * @returns {boolean} True if more tokens exist, false otherwise.
         */
        hasRemainingTokens() {
            return !this._tokenBuffer.isEmpty();
        }

        /**
         * Clears the internal token buffer, effectively resetting the input stream state.
         */
        clearProcessedData() {
            this._tokenBuffer.resetQueue();
        }
    }

    /**
     * @function computeAllPairsShortestPaths
     * Implements the Floyd-Warshall algorithm to find the shortest paths between all pairs of nodes.
     * @param {AdjacencyMatrix} initialDistances - The initial adjacency matrix representing direct edge weights.
     * @returns {AdjacencyMatrix} A new matrix where shortestPaths[i][j] is the shortest distance from i to j.
     */
    function computeAllPairsShortestPaths(initialDistances) {
        if (!initialDistances || initialDistances.length === 0 || !Array.isArray(initialDistances[0])) {
            console.warn("Invalid or empty adjacency matrix provided for Floyd-Warshall. Returning empty matrix.");
            return [];
        }

        const graphDimension = initialDistances.length;
        // Create a deep copy of the original distance matrix to avoid modifying it directly.
        // Using map with spread operator for robust deep copy of a 2D array.
        const shortestPaths = initialDistances.map(row => [...row]);

        // Iterate through all possible intermediate nodes (k).
        for (let kVertex = 0; kVertex < graphDimension; kVertex++) {
            // Iterate through all possible source nodes (i).
            for (let sourceVertex = 0; sourceVertex < graphDimension; sourceVertex++) {
                // Iterate through all possible destination nodes (j).
                for (let targetVertex = 0; targetVertex < graphDimension; targetVertex++) {
                    // Check if paths through kVertex can shorten the path from sourceVertex to targetVertex.
                    // Also, ensure that paths to kVertex and from kVertex are not impossible.
                    const pathViaK = shortestPaths[sourceVertex][kVertex] + shortestPaths[kVertex][targetVertex];
                    if (shortestPaths[sourceVertex][kVertex] !== PATH_IMPOSSIBLE &&
                        shortestPaths[kVertex][targetVertex] !== PATH_IMPOSSIBLE &&
                        shortestPaths[sourceVertex][targetVertex] > pathViaK) {
                        shortestPaths[sourceVertex][targetVertex] = pathViaK;
                    }
                }
            }
        }
        return shortestPaths;
    }

    /**
     * @function processGraphQueries
     * This is the main application logic, reading graph data, applying transformations,
     * and answering path queries. It uses the Floyd-Warshall algorithm twice.
     * @param {InputParser} inputReader - An instance of InputParser to read graph data.
     */
    function processGraphQueries(inputReader) {
        // Read initial graph parameters: number of vertices (N), number of edges (M), and transfer cost threshold (T).
        const numberOfVertices = inputReader.retrieveInteger();
        const numberOfEdges = inputReader.retrieveInteger();
        const transferThreshold = inputReader.retrieveInteger();

        // Basic validation for graph dimensions
        if (numberOfVertices <= 0 || numberOfEdges < 0) {
            console.error("Invalid graph dimensions provided. Vertices must be > 0, Edges >= 0.");
            return;
        }

        // Initialize the adjacency matrix for direct travel distances.
        // All paths are initially considered impossible, except for self-loops (distance 0).
        let directTravelDistances = createSquareMatrix(numberOfVertices, PATH_IMPOSSIBLE);
        for (let v = 0; v < numberOfVertices; v++) {
            directTravelDistances[v][v] = 0; // Distance to self is zero.
        }

        // Populate the direct travel distances matrix with given edges.
        // Node indices are 1-based in input, convert to 0-based for arrays.
        for (let edgeIdx = 0; edgeIdx < numberOfEdges; edgeIdx++) {
            const nodeA = inputReader.retrieveInteger() - 1;
            const nodeB = inputReader.retrieveInteger() - 1;
            const edgeWeight = inputReader.retrieveInteger();

            // Ensure nodes are within bounds.
            if (nodeA < 0 || nodeA >= numberOfVertices || nodeB < 0 || nodeB >= numberOfVertices) {
                console.warn(`Skipping invalid edge: (${nodeA + 1}, ${nodeB + 1}) is out of bounds.`);
                continue;
            }
            // For an undirected graph, set both directions.
            directTravelDistances[nodeA][nodeB] = edgeWeight;
            directTravelDistances[nodeB][nodeA] = edgeWeight;
        }

        // Step 1: Calculate all-pairs shortest paths considering only direct travel.
        // This gives us the minimum cost to travel between any two nodes without considering transfers yet.
        const shortestPathsInitial = computeAllPairsShortestPaths(directTravelDistances);

        // Step 2: Create a new graph structure for 'transfer' costs.
        // An edge exists between nodeA and nodeB with cost 1 if the shortest path between them
        // in the 'shortestPathsInitial' matrix is less than or equal to 'transferThreshold'.
        // Otherwise, the transfer cost is considered impossible.
        let transferCostMatrix = createSquareMatrix(numberOfVertices, PATH_IMPOSSIBLE);
        for (let r = 0; r < numberOfVertices; r++) {
            for (let c = 0; c < numberOfVertices; c++) {
                if (r === c) {
                    transferCostMatrix[r][c] = 0; // Self-transfer cost is zero.
                } else if (shortestPathsInitial[r][c] <= transferThreshold) {
                    transferCostMatrix[r][c] = 1; // A transfer is possible and costs 1 unit.
                }
            }
        }

        // Step 3: Calculate all-pairs shortest paths on the 'transferCostMatrix'.
        // This determines the minimum number of transfers required to get between any two nodes.
        const minimumTransfersPaths = computeAllPairsShortestPaths(transferCostMatrix);

        // Read the number of queries and process each one.
        const numberOfQueries = inputReader.retrieveInteger();
        const queryResults = [];

        for (let queryIdx = 0; queryIdx < numberOfQueries; queryIdx++) {
            const startNode = inputReader.retrieveInteger() - 1;
            const endNode = inputReader.retrieveInteger() - 1;

            // Validate query nodes
            if (startNode < 0 || startNode >= numberOfVertices || endNode < 0 || endNode >= numberOfVertices) {
                console.warn(`Query for invalid nodes (${startNode + 1}, ${endNode + 1}). Returning -1.`);
                queryResults.push(-1);
                continue;
            }

            const calculatedTransfers = minimumTransfersPaths[startNode][endNode];

            // If the calculated number of transfers is still PATH_IMPOSSIBLE,
            // it means the nodes are unreachable even with transfers.
            // Otherwise, subtract 1 because the problem implies the *number of transfers*
            // between the start and end point, not the number of segments.
            // A path of length L means L segments, thus L-1 transfers.
            if (calculatedTransfers === PATH_IMPOSSIBLE) {
                queryResults.push(-1);
            } else {
                queryResults.push(calculatedTransfers - 1);
            }
        }

        // Output all query results, each on a new line.
        console.log(queryResults.join("\n"));
    }

    // --- Application Entry Point ---
    /**
     * @function initializeAndRunApplication
     * Main function to start the application: reads input, initializes parser, and runs the solver.
     */
    function initializeAndRunApplication() {
        let inputFileContent = "";
        const fileSystem = require("fs"); // Using Node.js built-in 'fs' module.

        try {
            // Read input from the specified path. Using options for clarity.
            inputFileContent = fileSystem.readFileSync(SOURCE_INPUT_STREAM, { encoding: 'utf8', flag: 'r' });
            // Basic check for empty input.
            if (!inputFileContent || inputFileContent.trim().length === 0) {
                console.error("Error: No input content found from " + SOURCE_INPUT_STREAM + ". Exiting.");
                process.exit(1); // Terminate process with an error code.
            }
        } catch (readOperationError) {
            console.error(`Failed to read input from ${SOURCE_INPUT_STREAM}: ${readOperationError.message}`);
            process.exit(1); // Terminate process due to input error.
        }

        // Create an input parser instance with the read content.
        const currentInputProcessor = new InputParser(inputFileContent);

        // Execute the main graph problem solver.
        processGraphQueries(currentInputProcessor);

        // Optionally clear the parser's internal state after processing is complete.
        currentInputProcessor.clearProcessedData();
    }

    // Begin execution of the application.
    initializeAndRunApplication();

})();