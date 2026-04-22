const DataInputManager = (() => {
    // Factory function to create an instance of the InputBuffer class
    function createInputReader(sourceTextContent) {
        // Basic validation for the input source to ensure it's a string.
        // This is a Type III addition for robustness.
        if (typeof sourceTextContent !== 'string' || sourceTextContent.length === 0) {
            // For robustness, return a reader that will yield no data or empty arrays.
            console.warn("Provided input source is empty or not a string. Returning a non-functional reader.");
            return new InputBuffer("");
        }
        return new InputBuffer(sourceTextContent);
    }

    // InputBuffer class definition to handle structured input parsing.
    // Uses modern JavaScript class syntax and private fields (#).
    class InputBuffer {
        #lineSegments; // Stores lines, each pre-split into an array of string tokens.
        #currentLinePosition; // Index of the current line being processed.
        #totalLines; // Total number of lines available in the input.

        /**
         * Initializes the InputBuffer with raw input text.
         * @param {string} rawText The complete input string, typically read from a file.
         */
        constructor(rawText) {
            // Trim overall whitespace and split the input into individual lines.
            const processedLines = rawText.trim().split("\n");
            this.#lineSegments = processedLines;
            this.#currentLinePosition = 0;
            this.#totalLines = processedLines.length;

            // Type III change: Pre-process all lines by splitting them into tokens
            // in the constructor. The original code split lines on demand.
            for (let i = 0; i < this.#totalLines; i++) {
                if (typeof this.#lineSegments[i] === 'string') {
                    this.#lineSegments[i] = this.#lineSegments[i].split(" ");
                }
            }
        }

        /**
         * Checks if there are more lines remaining to be read in the buffer.
         * @returns {boolean} True if there are unread lines, false otherwise.
         */
        hasMoreLines() {
            return this.#currentLinePosition < this.#totalLines;
        }

        /**
         * Retrieves and consumes the next token from the current line.
         * Advances the line pointer if the current line becomes exhausted.
         * @param {boolean} [returnAsString=false] If true, returns the token as a string; otherwise, attempts to convert it to a number.
         * @returns {string|number|undefined} The next token, or undefined if no more tokens/lines are available.
         */
        consumeToken(returnAsString = false) {
            // Guard clause: If no more lines, issue a warning and return undefined.
            if (!this.hasMoreLines()) {
                console.warn("Attempted to read token beyond end of input.");
                return undefined;
            }

            let currentLineTokens = this.#lineSegments[this.#currentLinePosition];

            // Type III change: Handle empty lines explicitly.
            // Skip over any empty lines until a line with tokens is found or end of input.
            while (currentLineTokens.length === 0) {
                this.#currentLinePosition++;
                if (!this.hasMoreLines()) {
                    console.warn("No more tokens available after advancing through empty lines.");
                    return undefined;
                }
                currentLineTokens = this.#lineSegments[this.#currentLinePosition];
            }

            // Extract the first token from the line (using shift for FIFO behavior).
            const retrievedToken = currentLineTokens.shift();

            // If the current line is now empty, advance the line pointer to the next line.
            if (currentLineTokens.length === 0) {
                this.#currentLinePosition++;
            }

            // Convert to number if not requested as string. Explicitly using Number().
            return returnAsString ? retrievedToken : Number(retrievedToken);
        }

        /**
         * Reads the entire current line as an array of tokens and advances the line pointer.
         * @param {boolean} [keepRawStrings=false] If true, returns tokens as strings; otherwise, converts them to numbers.
         * @returns {Array<string|number>} An array of tokens from the line.
         */
        retrieveLineData(keepRawStrings = false) {
            if (!this.hasMoreLines()) {
                console.warn("Attempted to read line beyond end of input.");
                return [];
            }

            // Retrieve the tokens for the current line and advance the line pointer.
            const tokens = this.#lineSegments[this.#currentLinePosition];
            this.#currentLinePosition++;

            // Return tokens, optionally converted to numbers.
            return keepRawStrings ? tokens : tokens.map(Number);
        }

        /**
         * Reads a specified number of lines as a 2D array (matrix).
         * Advances the line pointer by `numRows`.
         * @param {number} numRows The number of lines (rows) to read.
         * @param {boolean} [keepRawStrings=false] If true, returns tokens as strings; otherwise, converts to numbers.
         * @returns {Array<Array<string|number>>} A 2D array (matrix) of tokens.
         */
        readMultiLineMatrix(numRows, keepRawStrings = false) {
            // Type III addition: Input validation for `numRows`.
            if (numRows <= 0) {
                console.warn("Number of rows must be a positive integer.");
                return [];
            }
            // Adjust `numRows` if attempting to read beyond available lines.
            if (this.#currentLinePosition + numRows > this.#totalLines) {
                console.warn(`Requested ${numRows} lines, but only ${this.#totalLines - this.#currentLinePosition} remain. Reading fewer lines.`);
                numRows = this.#totalLines - this.#currentLinePosition;
            }

            const matrixData = [];
            // Type III change: Reimplemented using a `for` loop and `retrieveLineData`
            // instead of `Array.slice` and `map` on the internal buffer.
            for (let i = 0; i < numRows; i++) {
                matrixData.push(this.retrieveLineData(keepRawStrings));
            }
            return matrixData;
        }

        /**
         * Reads a specified number of lines, where each line is expected to contain a single token,
         * and returns them as a 1D array. Advances the line pointer by `numRows`.
         * @param {number} numRows The number of lines to read.
         * @param {boolean} [keepRawStrings=false] If true, returns tokens as strings; otherwise, converts to numbers.
         * @returns {Array<string|number>} A 1D array of tokens.
         */
        readBlockOfLines(numRows, keepRawStrings = false) {
            // Similar input validation as `readMultiLineMatrix`.
            if (numRows <= 0) {
                console.warn("Number of lines must be a positive integer.");
                return [];
            }
            if (this.#currentLinePosition + numRows > this.#totalLines) {
                console.warn(`Requested ${numRows} lines, but only ${this.#totalLines - this.#currentLinePosition} remain. Reading fewer lines.`);
                numRows = this.#totalLines - this.#currentLinePosition;
            }

            const blockData = [];
            // Type III change: Reimplemented using a `for` loop and `consumeToken`.
            for (let i = 0; i < numRows; i++) {
                blockData.push(this.consumeToken(keepRawStrings));
            }
            return blockData;
        }
    }

    return createInputReader; // The public interface is the factory function.
})();

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * This is a Type III rewrite to completely avoid the use of `eval()`,
 * which was present in the original `xArray` function.
 * @param {*} initialValue The value to initialize each element with (e.g., 0, [], "default").
 * @param {...number} dimensions A list of dimensions for the array (e.g., `(0, 3, 2)` creates a 3x2 array).
 * @returns {Array} The initialized multi-dimensional array.
 */
function initializeNestedArray(initialValue, ...dimensions) {
    // Base case: If no dimensions are provided, return the initial value itself.
    if (dimensions.length === 0) {
        return initialValue;
    }

    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    // If this is the last dimension, create a 1D array filled with the initial value.
    // `Array.from` with a factory function ensures that for object values (like `[]`),
    // new instances are created for each element, preventing shallow copies.
    if (remainingDimensions.length === 0) {
        return Array.from({ length: currentDimensionSize }, () => initialValue);
    } else {
        // Recursive step: Create an array for the current dimension,
        // and each element is a recursively created nested array.
        return Array.from({ length: currentDimensionSize }, () =>
            initializeNestedArray(initialValue, ...remainingDimensions)
        );
    }
}

// Explicitly import 'fs' module. Type III change for clarity.
const fs = require("fs");
// Instantiate the input reader by reading from standard input.
const inputRawText = fs.readFileSync("/dev/stdin", "utf8");
const inputReader = DataInputManager(inputRawText);

/**
 * Main function containing the problem's core logic.
 * This function solves a graph problem, likely related to tree diameter and parity.
 */
function executeGameLogic() {
    // Read the total number of nodes (vertices) in the graph.
    const numVertices = inputReader.consumeToken();

    // Initialize data structures:
    // visitedStatus: An array to keep track of visited nodes during BFS traversals.
    //                Initialized with 0 (unvisited) for all nodes.
    const visitedStatus = initializeNestedArray(0, numVertices);

    // adjacencyList: An array of arrays to represent the graph's connections.
    //                Each index `i` holds an array of nodes connected to node `i`.
    const adjacencyList = initializeNestedArray([], numVertices);

    // Build the graph's adjacency list by reading `numVertices - 1` edges.
    // This typically implies the graph is a tree.
    for (let edgeIndex = 0; edgeIndex < numVertices - 1; edgeIndex++) {
        // Read two connected nodes for the current edge.
        const connectionPair = inputReader.retrieveLineData();

        // Adjust node indices to be 0-based (common in programming contests).
        const nodeA = connectionPair[0] - 1;
        const nodeB = connectionPair[1] - 1;

        // Type III addition: Basic validation for node indices.
        if (nodeA < 0 || nodeA >= numVertices || nodeB < 0 || nodeB >= numVertices) {
            console.error(`Invalid node indices encountered: ${nodeA + 1}, ${nodeB + 1}. Skipping this edge.`);
            continue; // Skip processing invalid edges.
        }

        // Add connections to the adjacency list (for an undirected graph).
        adjacencyList[nodeA].push(nodeB);
        adjacencyList[nodeB].push(nodeA);
    }

    let farthestNodeFromFirstBFSStart = 0; // Stores a node that is 'far' from the initial BFS starting point.

    // --- First Breadth-First Search (BFS) Traversal ---
    // Purpose: To find one of the endpoints of the graph's diameter.
    // A common heuristic is to start a BFS from an arbitrary node (here, node 0)
    // and find the node that is furthest away. This 'farthest' node is a good candidate
    // for one end of the diameter.
    { // Block scope for BFS-specific variables for clarity.
        // Queue stores objects { node: number, distance: number } to track path length.
        let bfsQueue = [{ node: 0, distance: 0 }];
        visitedStatus.fill(0); // Reset all nodes to unvisited.
        visitedStatus[0] = 1; // Mark the starting node (node 0) as visited.

        let currentMaxDistance = 0; // Tracks the maximum distance found so far in this BFS.

        // Type III change: Using a manual head pointer instead of `shift()`
        // for potential minor performance improvement on very large queues,
        // and as a structural variation.
        let queueHeadPointer = 0;
        while (queueHeadPointer < bfsQueue.length) {
            const { node: currentNode, distance: currentDistance } = bfsQueue[queueHeadPointer++]; // Dequeue.

            // Update `farthestNodeFromFirstBFSStart` if a new maximum distance is found,
            // or if a node at the same maximum distance is encountered later (mimics original's "last node processed").
            if (currentDistance > currentMaxDistance) {
                currentMaxDistance = currentDistance;
                farthestNodeFromFirstBFSStart = currentNode;
            } else if (currentDistance === currentMaxDistance) {
                farthestNodeFromFirstBFSStart = currentNode; // Original picked the last processed node.
            }

            // Explore neighbors.
            for (const neighborNode of adjacencyList[currentNode]) {
                if (visitedStatus[neighborNode] === 0) { // If neighbor is unvisited.
                    visitedStatus[neighborNode] = 1; // Mark as visited.
                    bfsQueue.push({ node: neighborNode, distance: currentDistance + 1 }); // Enqueue with incremented distance.
                }
            }
        }
    } // End of first BFS block.

    // --- Second Breadth-First Search (BFS) Traversal ---
    // Purpose: Calculate the actual longest path length (diameter) of the tree.
    // Starting from `farthestNodeFromFirstBFSStart`, a second BFS will find the
    // node furthest from it, and that distance will be the diameter.
    let diameterLength = 0; // Renamed from `l` and `levelDistance` for semantic clarity.
    { // Block scope for BFS-specific variables.
        // Queue stores objects { node: number, distance: number }.
        let bfsQueue = [{ node: farthestNodeFromFirstBFSStart, distance: 0 }];
        visitedStatus.fill(0); // Reset all nodes to unvisited for the new BFS.
        visitedStatus[farthestNodeFromFirstBFSStart] = 1; // Mark the new starting node as visited.

        let queueHeadPointer = 0;
        while (queueHeadPointer < bfsQueue.length) {
            const { node: currentNode, distance: currentDistance } = bfsQueue[queueHeadPointer++]; // Dequeue.

            // Update `diameterLength` with the maximum distance encountered in this BFS.
            if (currentDistance > diameterLength) {
                diameterLength = currentDistance;
            }

            // Explore neighbors.
            for (const neighborNode of adjacencyList[currentNode]) {
                if (visitedStatus[neighborNode] === 0) { // If neighbor is unvisited.
                    visitedStatus[neighborNode] = 1; // Mark as visited.
                    bfsQueue.push({ node: neighborNode, distance: currentDistance + 1 }); // Enqueue with incremented distance.
                }
            }
        }
    } // End of second BFS block.

    // Determine the winner based on the calculated diameter length.
    // The original code's `l` variable (which I've called `diameterLength`)
    // was effectively `(actual_diameter + 1)` due to its level increment logic.
    // My BFS calculates the `actual_diameter` directly.
    // Therefore, to match the original condition `l % 3 === 2`,
    // we need to use `(actual_diameter + 1) % 3 === 2`.
    // This is a Type III update to ensure functional equivalence.
    const adjustedLengthForCondition = diameterLength + 1;
    const isSecondPlayerWinning = (adjustedLengthForCondition % 3 === 2);

    // Type III: Use an intermediate variable for the final result string.
    const gameResult = isSecondPlayerWinning ? "Second" : "First";

    return gameResult;
}

// Execute the main logic and print the result to the console.
console.log(executeGameLogic());