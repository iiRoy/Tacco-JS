function EntryFunction(inputData) {
    "use strict"; // Enforce strict mode for cleaner code

    /**
     * Performs a Depth-First Search (DFS) to find the maximum path score.
     * This function explores paths in the graph, memoizing results to avoid redundant calculations.
     *
     * @param {number} currentNode The current node being visited.
     * @param {number} currentPathScore The accumulated score up to the current node.
     * @param {number} recursionDepth The current depth of the recursion.
     * @returns {number} The maximum score achievable from the currentNode.
     */
    function traverseGraph(currentNode, currentPathScore, recursionDepth) {
        let maximumPathValue = 0; // Initialize the maximum score for paths starting from this node

        // If there are no allowed neighbors from the current node,
        // it means we've reached a leaf or an unexplorable path.
        // In this case, the current accumulated score is the final score for this path.
        if (!allowedNeighbors[currentNode]) {
            return currentPathScore;
        }

        // Iterate over each potential neighbor of the current node
        allowedNeighbors[currentNode].forEach(function(nextNeighbor) {
            // Check if this specific path (currentNode -> nextNeighbor) has not been computed yet
            // The memoizationTable stores the maximum score achievable from 'currentNode' to 'nextNeighbor'
            if (!memoizationTable[currentNode][nextNeighbor]) {
                // Calculate the score for the path including the edge to the next neighbor
                const potentialNewScore = currentPathScore + adjacencyMatrix[currentNode][nextNeighbor];

                // Recursively call traverseGraph for the next neighbor,
                // updating the score and increasing the recursion depth.
                // Store the result in the memoization table.
                memoizationTable[currentNode][nextNeighbor] = traverseGraph(nextNeighbor, potentialNewScore, recursionDepth + 1);
            }

            // Update the overall maximum path value found from the current node
            // by comparing with the memoized result for the path to the next neighbor.
            maximumPathValue = Math.max(maximumPathValue, memoizationTable[currentNode][nextNeighbor]);
        });

        // Return the highest score found among all paths originating from the currentNode
        return maximumPathValue;
    }

    // Alias console.log for convenience and potential renaming
    const logOutput = console.log;
    // Alias util.print, though it's not used in the final output logic
    const printUtil = require("util").print;
    // Create a new instance of the custom input parser
    const inputReader = new InputParser(inputData, " \n");

    // --- Program Logic Starts Here ---

    // Read the number of nodes (N) and edges (M) from input
    const numNodes = inputReader.parseNextInteger();
    const numEdges = inputReader.parseNextInteger();

    // Declare and initialize data structures for graph representation and memoization
    let adjacencyMatrix = [];      // Stores edge weights: adjacencyMatrix[source][destination] = weight
    let allowedNeighbors = [];     // Stores lists of neighbors for each node: allowedNeighbors[node] = [neighbor1, neighbor2, ...]
    let memoizationTable = [];     // Stores memoized results of DFS paths: memoizationTable[source][destination] = max_score_from_source_to_destination

    let loopIndex;                 // Loop counter variable
    let overallMaxScore = -1;      // Not used in the final output, but declared in original

    // Initialize graph structures with empty arrays for each node
    // The loop runs N-1 times because nodes are 0-indexed up to N-1.
    for (loopIndex = +0; loopIndex < numNodes; loopIndex++) {
        adjacencyMatrix[loopIndex] = [];
        allowedNeighbors[loopIndex] = [];
        memoizationTable[loopIndex] = [];
    }

    // Read edge information from input and populate the graph
    for (loopIndex = +0; loopIndex < numEdges; loopIndex++) {
        const sourceNode = inputReader.parseNextInteger();      // Starting node of the edge
        const destinationNode = inputReader.parseNextInteger(); // Ending node of the edge
        const edgeCost = inputReader.parseNextInteger();        // Weight/cost of the edge

        // Add the destination node to the list of allowed neighbors for the source node
        allowedNeighbors[sourceNode].push(destinationNode);
        // Store the edge weight in the adjacency matrix
        adjacencyMatrix[sourceNode][destinationNode] = edgeCost;
    }

    // The original code had commented-out debug logs:
    // logOutput(allowedNeighbors);
    // logOutput(adjacencyMatrix);

    // Start the DFS from node 0 with an initial score of 0 and depth 0.
    // The result (maximum path score) is then printed to the console.
    logOutput(traverseGraph(+0, +0, +0));
}

/**
 * Custom utility class for parsing input strings.
 * It splits the input by a given delimiter and provides methods to read tokens.
 */
const InputParser = (function() {
    /**
     * Constructor for InputParser.
     * @param {string} rawInputString The complete input string to be parsed.
     * @param {string} tokenSeparator A string containing characters to use as delimiters (e.g., " \n").
     */
    function InputParser(rawInputString, tokenSeparator) {
        // Create a regular expression to split the input string by any of the delimiter characters.
        const splitRegex = new RegExp(tokenSeparator.split(String()).join("|"), "g");
        this.currentPosition = +0; // Initialize the current reading index to the beginning.
        // Clean up carriage returns and split the string into tokens using the regex.
        this.tokenArray = rawInputString.replace(/\r/g, String()).split(splitRegex);
    }

    // Define methods for the InputParser prototype
    InputParser.prototype = {
        /**
         * Checks if there are more tokens available to read.
         * @param {string} [comparisonValue] Optional value to check if the next token matches.
         * @returns {boolean} True if more tokens exist or if the next token matches the comparisonValue.
         */
        hasMoreTokens: function(comparisonValue) {
            if (typeof comparisonValue === "undefined") {
                // If no comparison value is provided, just check if the current token exists and is not empty.
                return typeof this.tokenArray[this.currentPosition] !== "undefined" && this.tokenArray[this.currentPosition] !== String();
            } else {
                // If a comparison value is provided, check if the current token matches it.
                return this.tokenArray[this.currentPosition] === comparisonValue;
            }
        },
        /**
         * Reads and returns the next token from the input.
         * Advances the internal pointer.
         * @returns {string} The next token.
         * @throws {RangeError} If attempting to read beyond the end of the token list.
         */
        readNextToken: function() {
            if (typeof this.tokenArray[this.currentPosition + 1] === "undefined") {
                throw new RangeError("index out of bounds at '" + this.currentPosition + "'");
            }
            return this.tokenArray[this.currentPosition++];
        },
        /**
         * Reads the next token and attempts to convert it to a number.
         * @returns {number} The next token as a number.
         * @throws {TypeError} If the token cannot be converted to a number.
         */
        retrieveNextNumber: function() {
            if (isNaN(+this.peekCurrentToken())) {
                throw new TypeError("'" + this.peekCurrentToken() + "' cannot convert to Number");
            }
            return +this.readNextToken();
        },
        /**
         * Reads the next token, converts it to a number, and then parses it as an integer.
         * @param {number} [numericBase=10] The radix (base) for parsing the integer. Defaults to 10.
         * @returns {number} The next token as an integer.
         */
        parseNextInteger: function(numericBase) {
            numericBase = numericBase | 0xA; // Default to base 10 if not provided
            return parseInt(this.retrieveNextNumber(), numericBase);
        },
        /**
         * Returns the current token without advancing the internal pointer.
         * @returns {string} The current token.
         */
        peekCurrentToken: function() {
            return this.tokenArray[this.currentPosition];
        },
        /**
         * Resets the internal pointer to the beginning of the token list.
         */
        resetPointer: function() {
            this.currentPosition = +0;
        }
    };

    return InputParser; // Return the constructor function
}());

// Read input from standard input and pass it to the main entry function
EntryFunction(require("fs").readFileSync("/dev/stdin", "utf8"));
