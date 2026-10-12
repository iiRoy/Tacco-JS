function ProcessInput(inputStringData) {
    "use strict";

    /**
     * Recursively finds the longest path starting from a given node.
     * @param {number} currentNode - The current node in the path.
     * @param {number} currentScore - The accumulated score to reach the currentNode.
     * @param {number} recursionDepth - Current depth of recursion (for debugging/indentation, not used in logic).
     * @param {Set<number>} visitedNodes - A set of nodes already visited in the current path to prevent cycles.
     * @returns {number} The maximum score achievable from this path.
     */
    function findLongestPath(currentNode, currentScore, recursionDepth, visitedNodes) {
        let maximumPathScore = 0;

        // The original code had commented-out debug lines like:
        // var indent = new Array(recursionDepth + 1).join("  ");
        // logOutput(currentNode, allowedNeighbors[currentNode], graphEdges[currentNode], currentScore + maximumPathScore);

        const currentNeighbors = allowedNeighbors[currentNode];

        // Guard clause: If no neighbors are defined for the current node, or the list is empty,
        // it means no further path can be extended from here.
        if (!currentNeighbors || currentNeighbors.length === 0) {
            return currentScore;
        }

        // Iterate over all possible next nodes from the current node
        for (const nextNode of currentNeighbors) {
            // Only proceed if the next node has not been visited in the current path
            // Using a Set for visitedNodes provides a structural change from Array.indexOf
            if (!visitedNodes.has(nextNode)) {
                const edgeWeight = graphEdges[currentNode][nextNode];
                const newAccumulatedScore = currentScore + edgeWeight;

                // Mark the next node as visited for the current path exploration
                visitedNodes.add(nextNode);
                // Recursively find the longest path from the next node
                maximumPathScore = Math.max(maximumPathScore, findLongestPath(nextNode, newAccumulatedScore, recursionDepth + 1, visitedNodes));
                // Backtrack: remove the next node from visited for other path explorations
                visitedNodes.delete(nextNode);
            }
        }
        return maximumPathScore;
    }

    const logOutput = console.log;
    // The original `p = require("util").print` was unused, so it's removed.
    const inputScanner = new InputParser(inputStringData, " \n");

    // Main processing logic
    const numNodes = inputScanner.nextInt();
    const numEdges = inputScanner.nextInt();

    const graphEdges = []; // Renamed from 'grapth'
    const allowedNeighbors = []; // Renamed from 'allow'

    /**
     * Helper function to initialize graph adjacency structures.
     * Preserves original behavior of initializing N-1 elements, leaving the last one undefined.
     * @param {number} nodeCount - The total number of nodes.
     */
    function initializeGraphStructures(nodeCount) {
        for (let i = 0; i < nodeCount - 1; i++) { // Original loop was N-1
            graphEdges[i] = [];
            allowedNeighbors[i] = [];
        }
    }

    /**
     * Helper function to read edge data and populate the graph structures.
     * @param {number} edgeCount - The total number of edges.
     * @param {InputParser} scanner - The scanner instance to read input.
     */
    function populateGraphEdges(edgeCount, scanner) {
        for (let i = 0; i < edgeCount; i++) {
            const startNode = scanner.nextInt();
            const endNode = scanner.nextInt();
            const edgeWeight = scanner.nextInt();

            allowedNeighbors[startNode].push(endNode);
            graphEdges[startNode][endNode] = edgeWeight;
        }
    }

    initializeGraphStructures(numNodes);
    populateGraphEdges(numEdges, inputScanner);

    // The original had commented-out debug lines like:
    // logOutput(allowedNeighbors);
    // logOutput(graphEdges);

    // Start the DFS from node 0 with an initial score of 0, depth 0, and an empty set of visited nodes.
    logOutput(findLongestPath(0, 0, 0, new Set()));
}

const InputParser = (function() { // Renamed from 'Scanner'
    /**
     * Constructor for InputParser.
     * @param {string} inputString - The raw input string.
     * @param {string} tokenDelimiter - The delimiter string for splitting tokens.
     */
    function InputParser(inputString, tokenDelimiter) {
        const delimiterRegex = new RegExp(tokenDelimiter.split("").join("|"), "g"); // Renamed from 'reg'
        this.currentIndex = 0; // Renamed from 'idx'
        this.tokenList = inputString.replace(/\r/g, '').split(delimiterRegex); // Renamed from 'list'
    }

    InputParser.prototype = {
        /**
         * Checks if there is a next token or if the current token matches a specific value.
         * @param {string} [checkValue] - Optional value to check against the current token.
         * @returns {boolean} True if a next token exists or matches the value, false otherwise.
         */
        hasNext: function(checkValue) { // Renamed from 'val'
            const currentToken = this.tokenList[this.currentIndex]; // Added helper variable
            if (typeof checkValue === "undefined") {
                return typeof currentToken !== "undefined" && currentToken !== "";
            } else {
                return currentToken === checkValue;
            }
        },
        /**
         * Returns the next token and advances the internal pointer.
         * Throws RangeError if no more tokens are available.
         * @returns {string} The next token.
         */
        next: function() {
            // Preserving original behavior: check if the *next* element after current is undefined.
            // This means it allows returning the element at currentIndex, but throws if currentIndex+1 is out of bounds.
            if (typeof this.tokenList[this.currentIndex + 1] === "undefined") {
                throw new RangeError("index out of bounds at '" + this.currentIndex + "'");
            }
            return this.tokenList[this.currentIndex++];
        },
        /**
         * Returns the next token as a number.
         * Throws TypeError if the token cannot be converted to a number.
         * @returns {number} The next token as a number.
         */
        nextNumber: function() {
            const currentToken = this.top(); // Added helper variable for clarity
            if (isNaN(+currentToken)) {
                throw new TypeError("'" + currentToken + "' cannot convert to Number");
            }
            return +this.next();
        },
        /**
         * Returns the next token as an integer, optionally specifying a radix.
         * @param {number} [parseRadix] - The radix (base) to use for parsing. Defaults to 10.
         * @returns {number} The next token as an integer.
         */
        nextInt: function(parseRadix) { // Renamed from 'radix'
            parseRadix = parseRadix || 10; // Changed bitwise OR to logical OR for clarity, functionally equivalent here.
            return parseInt(this.nextNumber(), parseRadix);
        },
        /**
         * Returns the current token without advancing the pointer.
         * @returns {string} The current token.
         */
        top: function() {
            return this.tokenList[this.currentIndex];
        }
        // The original 'rewind' method was unused, so it's removed.
    };

    return InputParser;
}());

// Execute the main processing function with input from stdin.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
