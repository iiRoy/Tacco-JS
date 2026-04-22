const LineProcessor = (function () {
    /**
     * @class TextStreamHandler
     * @description Manages reading tokens and lines from a raw text input stream.
     * It allows reading individual tokens, full lines, or multiple lines as matrices/arrays.
     */
    function TextStreamHandler(rawContent) {
        // Guard: Ensure input content is a non-empty string.
        if (typeof rawContent !== 'string' || rawContent.length === 0) {
            console.error("Input content for TextStreamHandler must be a non-empty string.");
            this.sourceLines = [];
            this.currentLineIndex = 0;
            return;
        }

        // Split the raw content into lines, trim whitespace from each, and filter out any empty lines.
        this.sourceLines = rawContent
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);

        this.currentLineIndex = 0; // Pointer to the current line being processed.
        this.currentTokenBuffer = []; // Buffer to hold tokens from the current line when reading single values.
    }

    /**
     * Prototype methods for the TextStreamHandler class.
     */
    Object.assign(TextStreamHandler.prototype, {
        /**
         * Extracts and returns the next single value (token) from the input stream.
         * It processes lines one by one, splitting them into tokens and returning them sequentially.
         * If the current line's tokens are exhausted, it moves to the next line.
         * @param {boolean} [returnAsString=false] - If true, the token is returned as a string; otherwise, it's converted to a number.
         * @returns {string|number|null} The next token, or null if no more tokens are available in the stream.
         */
        extractSingleValue: function (returnAsString = false) {
            // Loop until a token is found or all lines are processed.
            while (this.currentTokenBuffer.length === 0 && this.currentLineIndex < this.sourceLines.length) {
                const currentLineContent = this.sourceLines[this.currentLineIndex];
                // Split the line by one or more whitespace characters and filter out any empty tokens.
                this.currentTokenBuffer = currentLineContent.split(/\s+/).filter(token => token.length > 0);
                // If the line was empty or only whitespace, advance to the next line and try again.
                if (this.currentTokenBuffer.length === 0) {
                    this.currentLineIndex++;
                }
            }

            // If a token buffer is populated, extract the first token.
            if (this.currentTokenBuffer.length > 0) {
                const extractedToken = this.currentTokenBuffer.shift(); // Remove and return the first token.
                // If the current line's buffer is now empty, it means this line is fully consumed.
                // We increment the line index here so that the next call to extractSingleValue will
                // attempt to load the next line into the token buffer.
                if (this.currentTokenBuffer.length === 0) {
                    this.currentLineIndex++;
                }
                return returnAsString ? extractedToken : Number(extractedToken);
            }

            return null; // No more tokens across all lines.
        },

        /**
         * Reads the entire current line, splits it into tokens, and advances the line pointer.
         * This operation effectively discards any partially read tokens from the current line
         * by clearing the token buffer.
         * @param {boolean} [keepStrings=false] - If true, returns tokens as strings; otherwise, converts to numbers.
         * @returns {Array<string|number>} An array of tokens from the read line. Returns an empty array if no more lines.
         */
        fetchLineAsArray: function (keepStrings = false) {
            if (this.currentLineIndex >= this.sourceLines.length) {
                return []; // No more lines to read.
            }
            const lineContent = this.sourceLines[this.currentLineIndex++]; // Get line and advance pointer.
            this.currentTokenBuffer = []; // Clear the token buffer, as a full line is being read.
            const tokens = lineContent.split(/\s+/).filter(token => token.length > 0);
            return keepStrings ? tokens : tokens.map(Number);
        },

        /**
         * Reads 'numLines' consecutive lines, splits each into tokens, and returns a 2D array (matrix).
         * This operation also clears the token buffer.
         * @param {number} numLines - The number of lines to read. Must be a positive integer.
         * @param {boolean} [preserveStringTypes=false] - If true, returns tokens as strings; otherwise, converts to numbers.
         * @returns {Array<Array<string|number>>} A matrix of tokens. Returns an empty array if numLines is invalid or no lines available.
         */
        extractMultiLineMatrix: function (numLines, preserveStringTypes = false) {
            if (numLines <= 0 || !Number.isInteger(numLines)) {
                return []; // Invalid number of lines requested.
            }
            // Slice the required number of lines from the source.
            const matrixRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numLines);
            this.currentLineIndex += numLines; // Advance the line pointer by the number of lines read.
            this.currentTokenBuffer = []; // Clear the token buffer.

            return matrixRows.map(row => {
                const tokens = row.split(/\s+/).filter(token => token.length > 0);
                return preserveStringTypes ? tokens : tokens.map(Number);
            });
        },

        /**
         * Reads 'numLines' consecutive lines as individual values (each line expected to contain one value).
         * This is useful for lists of numbers where each number is on its own line.
         * This operation also clears the token buffer.
         * @param {number} numLines - The number of lines to read. Must be a positive integer.
         * @param {boolean} [asText=false] - If true, returns lines as strings; otherwise, converts to numbers.
         * @returns {Array<string|number>} An array of values, one per line. Returns an empty array if numLines is invalid or no lines available.
         */
        fetchConsecutiveNumericLines: function (numLines, asText = false) {
            if (numLines <= 0 || !Number.isInteger(numLines)) {
                return []; // Invalid number of lines requested.
            }
            const lines = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numLines);
            this.currentLineIndex += numLines; // Advance the line pointer.
            this.currentTokenBuffer = []; // Clear the token buffer.
            return asText ? lines : lines.map(Number);
        },

        /**
         * Checks if there is more data (lines or buffered tokens) available to be read.
         * @returns {boolean} True if more data is available, false otherwise.
         */
        hasMoreData: function() {
            return this.currentLineIndex < this.sourceLines.length || this.currentTokenBuffer.length > 0;
        }
    });

    /**
     * Factory function to create an instance of TextStreamHandler.
     * This is the public interface of the LineProcessor module.
     * @param {string} inputData - The raw input string containing multiple lines.
     * @returns {TextStreamHandler} An instance of TextStreamHandler configured with the input data.
     */
    function createParser(inputData) {
        return new TextStreamHandler(inputData);
    }

    return createParser;
})();

/**
 * @class DisjointSetUnion
 * @description Implements a Disjoint Set Union (DSU) data structure, also known as Union-Find.
 * It efficiently tracks sets of disjoint elements and supports merging sets and querying set properties.
 */
function DisjointSetUnion(initialElementCount) {
    // Validate the initial element count.
    if (!Number.isInteger(initialElementCount) || initialElementCount < 0) {
        console.warn("Invalid initial element count for DSU. Initializing with 0 elements.");
        this.parentOrSize = [];
        this.componentCount = 0;
        return;
    }

    // `parentOrSize` array:
    // - If `parentOrSize[i] >= 0`, it stores the parent of element `i`.
    // - If `parentOrSize[i] < 0`, it means `i` is a root of a set, and its value is the negative
    //   of the size of the set it represents.
    this.parentOrSize = Array(initialElementCount + 1).fill(-1);
    // `componentCount` tracks the total number of distinct components (sets).
    this.componentCount = initialElementCount;
}

Object.assign(DisjointSetUnion.prototype, {
    /**
     * Finds the representative (root) of the set containing `elementId`.
     * Applies path compression during traversal to flatten the tree structure,
     * making future lookups faster.
     * @param {number} elementId - The ID of the element (1-indexed typically).
     * @returns {number} The representative (root) of the set containing `elementId`. Returns -1 for invalid IDs.
     */
    findSetRepresentative: function (elementId) {
        // Basic bounds check, though input is usually assumed valid in competitive programming.
        if (elementId < 0 || elementId >= this.parentOrSize.length) {
            console.error(`Attempted to find representative for invalid element ID: ${elementId}`);
            return -1;
        }

        // If the value is negative, `elementId` is a root.
        if (this.parentOrSize[elementId] < 0) {
            return elementId;
        }
        // Recursively find the root and apply path compression by setting
        // `elementId`'s parent directly to the found root.
        this.parentOrSize[elementId] = this.findSetRepresentative(this.parentOrSize[elementId]);
        return this.parentOrSize[elementId];
    },

    /**
     * Determines if two elements belong to the same disjoint set.
     * @param {number} elementA - The ID of the first element.
     * @param {number} elementB - The ID of the second element.
     * @returns {boolean} True if both elements are in the same set, false otherwise.
     */
    areConnected: function (elementA, elementB) {
        return this.findSetRepresentative(elementA) === this.findSetRepresentative(elementB);
    },

    /**
     * Merges the sets containing `elementA` and `elementB`.
     * It uses the union-by-size heuristic: the smaller set's root is attached to the larger set's root.
     * This helps keep the tree shallow.
     * @param {number} elementA - The ID of the first element.
     * @param {number} elementB - The ID of the second element.
     */
    unionSets: function (elementA, elementB) {
        let rootA = this.findSetRepresentative(elementA);
        let rootB = this.findSetRepresentative(elementB);

        // If elements are already in the same set, no merge is needed.
        if (rootA === rootB) {
            return;
        }

        // The values `parentOrSize[root]` are negative, representing the size.
        // A larger negative value (e.g., -5) means a smaller set size than a smaller negative value (e.g., -3).
        // To union by size, we make the root of the smaller set a child of the root of the larger set.
        // `parentOrSize[rootA] >= parentOrSize[rootB]` means `size(rootA) <= size(rootB)` (because they are negative).
        if (this.parentOrSize[rootA] >= this.parentOrSize[rootB]) {
            // rootB's set is larger or equal in size; rootA's set is smaller or equal.
            // Merge rootA into rootB.
            this.parentOrSize[rootB] += this.parentOrSize[rootA]; // Update rootB's size (add rootA's size)
            this.parentOrSize[rootA] = rootB; // Make rootB the parent of rootA
        } else {
            // rootA's set is larger.
            // Merge rootB into rootA.
            this.parentOrSize[rootA] += this.parentOrSize[rootB]; // Update rootA's size (add rootB's size)
            this.parentOrSize[rootB] = rootA; // Make rootA the parent of rootB
        }
        this.componentCount--; // Decrement the total number of components after a successful merge.
    },

    /**
     * Returns the size of the set containing `elementId`.
     * @param {number} elementId - The ID of the element.
     * @returns {number} The number of elements in the set. Returns 0 for invalid IDs.
     */
    getComponentSize: function (elementId) {
        if (elementId < 0 || elementId >= this.parentOrSize.length) {
            return 0; // Invalid element ID.
        }
        // The size is stored as the negative value in the root's entry.
        return -this.parentOrSize[this.findSetRepresentative(elementId)];
    },

    /**
     * Retrieves the current total number of distinct disjoint components.
     * @returns {number} The current count of components.
     */
    getTotalComponents: function() {
        return this.componentCount;
    }
});

// Initialize the input data parser by reading from standard input.
const inputDataParser = LineProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * @function calculateConnectivityLoss
 * @description Solves the "Connectivity Loss" or "Roads and Cities" type problem.
 * It calculates the number of connected pairs of nodes after each edge is 'added'
 * by processing edges in reverse order using a Disjoint Set Union (DSU) data structure.
 * @returns {string} A newline-separated string of BigInt values, where each value
 * represents the total number of connected pairs after each edge addition,
 * starting from no edges up to all edges.
 */
function calculateConnectivityLoss() {
    // Read the number of nodes (N) and edges (M) from the input.
    const nodeCount = inputDataParser.extractSingleValue();
    const edgeCount = inputDataParser.extractSingleValue();

    // Guard clauses for invalid or edge-case input values.
    if (nodeCount === null || edgeCount === null || nodeCount < 0 || edgeCount < 0) {
        return "Error: Invalid or missing node/edge counts in input.";
    }
    if (nodeCount === 0) {
        return "0"; // If no nodes, there are no connected pairs.
    }
    if (edgeCount === 0) {
        // If no edges, the initial number of connected pairs is the only result.
        // Use BigInt for calculation to prevent overflow for large N.
        return String(BigInt(nodeCount) * BigInt(nodeCount - 1) / BigInt(2));
    }

    // Read all edge connection pairs (u, v) into a matrix.
    const edgeConnectionPairs = inputDataParser.extractMultiLineMatrix(edgeCount);

    // Initialize an array to store the results for each step.
    const connectivityResultsArray = new Array(edgeCount);

    // Initialize the Disjoint Set Union manager with 'nodeCount' elements.
    const dsuManager = new DisjointSetUnion(nodeCount);

    // Calculate the initial maximum possible pairs in a fully connected graph of 'nodeCount' nodes.
    // This is N * (N-1) / 2. Using BigInt for large N.
    const initialMaximumPairs = BigInt(nodeCount) * BigInt(nodeCount - 1) / BigInt(2);

    // The last element of the results array corresponds to the state where all edges are present.
    // However, since we are processing edges in reverse, this will be the *initial* state for our iteration.
    connectivityResultsArray[edgeCount - 1] = initialMaximumPairs;

    // A mutable variable to track the current number of connected pairs as edges are processed.
    let currentConnectedPairs = initialMaximumPairs;

    // Iterate through the edges in reverse order (from last edge to second edge).
    // The loop calculates results for indices `edgeCount - 2` down to `0`.
    let currentEdgeIndex = edgeCount - 1;
    while (currentEdgeIndex > 0) {
        const [uNode, vNode] = edgeConnectionPairs[currentEdgeIndex]; // Destructure the current edge.

        // Add: Basic validation for node IDs within the expected range.
        if (uNode < 1 || uNode > nodeCount || vNode < 1 || vNode > nodeCount) {
             console.warn(`Skipping invalid edge: [${uNode}, ${vNode}] at index ${currentEdgeIndex}. Node IDs must be between 1 and ${nodeCount}.`);
             // If an edge is invalid, the connectivity doesn't change from the previous step.
             connectivityResultsArray[currentEdgeIndex - 1] = currentConnectedPairs;
             currentEdgeIndex--;
             continue; // Move to the next edge.
        }

        // Check if the two nodes of the current edge are already connected in the DSU structure.
        if (dsuManager.areConnected(uNode, vNode)) {
            // If they are already connected, adding this edge (in reverse, effectively removing)
            // does not change the number of connected pairs. So, copy the previous result.
            connectivityResultsArray[currentEdgeIndex - 1] = currentConnectedPairs;
        } else {
            // If they are not connected, merging them will create new connected pairs.
            // The number of new pairs formed is the product of the sizes of the two components being merged.
            const sizeOfComponentU = BigInt(dsuManager.getComponentSize(uNode));
            const sizeOfComponentV = BigInt(dsuManager.getComponentSize(vNode));
            const pairsFormedByMerge = sizeOfComponentU * sizeOfComponentV;

            // Update the total connected pairs by subtracting the pairs formed by this merge.
            // (When processing in reverse, we are conceptually 'removing' an edge, so we subtract pairs).
            currentConnectedPairs -= pairsFormedByMerge;
            connectivityResultsArray[currentEdgeIndex - 1] = currentConnectedPairs;

            // Perform the union operation in the DSU manager.
            dsuManager.unionSets(uNode, vNode);
        }
        currentEdgeIndex--; // Move to the next edge in reverse.
    }

    // Convert all BigInt results to strings and join them with newlines for output.
    return connectivityResultsArray.map(val => val.toString()).join("\n");
}

// Execute the main function and print its result to the console.
console.log(calculateConnectivityLoss());