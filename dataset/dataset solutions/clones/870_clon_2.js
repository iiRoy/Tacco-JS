/*
 * This module processes standard input to perform graph-related computations.
 */
function ProcessInput(rawData) {
    "use strict"; /* Enforce strict JavaScript parsing and error handling */

    /**
     * Recursively explores paths in a graph to find the maximum accumulated weight.
     * @param {number} currentVertex The current vertex being visited.
     * @param {number} accumulatedValue The sum of edge weights to reach this vertex.
     * @param {number} recursionDepth The current depth of the recursion stack.
     * @param {Array<number>} visitedVertices A list of vertices already visited in the current path.
     * @returns {number} The maximum weight found from this vertex onwards.
     */
    function exploreNodes(currentVertex, accumulatedValue, recursionDepth, visitedVertices) {
        let maximumWeight = 0;

        // Optionally, one could log debug information here, for example:
        // let currentIndent = new Array(recursionDepth + 1).join("----");
        // displayResult(`${currentIndent} Visiting vertex: ${currentVertex}, current score: ${accumulatedValue}`);

        /* If the current vertex has no outgoing allowed connections,
         * or if it's an invalid node, return the current accumulated value.
         */
        if (!possibleMoves[currentVertex]) {
            return accumulatedValue;
        }

        // Iterate over each adjacent vertex from the current one
        possibleMoves[currentVertex].forEach(function (adjVertex) {
            /* Check if the neighbor has not been visited in the current path
             * to prevent cycles in simple path calculations.
             */
            if (visitedVertices.indexOf(adjVertex) === -1) {
                // Calculate the new accumulated value for the path through this neighbor
                let newWeight = accumulatedValue + edgeWeights[currentVertex][adjVertex];

                // Mark the neighbor as visited for the current path
                visitedVertices.push(adjVertex);
                // Recursively explore from the neighbor and update the maximum weight
                maximumWeight = Math.max(maximumWeight, exploreNodes(adjVertex, newWeight, recursionDepth + 1, visitedVertices));
                // Backtrack: remove the neighbor from visited list to explore other paths
                visitedVertices.pop();
            }
        });
        return maximumWeight; // Return the highest weight found
    }

    // Setup output and input utilities
    const displayResult = console.log;
    const emitChar = require("util").print; // This variable is unused in the original logic, maintaining for structural fidelity.
    const inputReader = new TokenStream(rawData, " \n");

    // Initialize graph structure and variables
    const vertexCount = inputReader.getNextInteger();
    const edgeCount = inputReader.getNextInteger();

    let edgeWeights = []; // Represents the adjacency matrix for weights
    let possibleMoves = []; // Represents the adjacency list for connections
    let loopIndex;
    let globalMaximum = -1; // Initial maximum value, unused in original logic but declared.

    // Prepare graph structures with empty arrays for each vertex
    for (loopIndex = 0; loopIndex < vertexCount - 1; loopIndex++) {
        edgeWeights[loopIndex] = [];
        possibleMoves[loopIndex] = [];
    }

    // Populate graph data from input
    for (loopIndex = 0; loopIndex < edgeCount; loopIndex++) {
        const sourceNode = inputReader.getNextInteger();
        const targetNode = inputReader.getNextInteger();
        const edgeValue = inputReader.getNextInteger();

        possibleMoves[sourceNode].push(targetNode);
        edgeWeights[sourceNode][targetNode] = edgeValue;
    }

    // Display the final computed maximum path weight
    displayResult(exploreNodes(0, 0, 0, []));
}

/*
 * Utility class for parsing input strings into tokens.
 * Provides methods to read various types of data.
 */
const TokenStream = (function () {
    function TokenStream(textContent, tokenDelimiter) {
        // Construct a regular expression from the delimiter pattern
        const splitRegex = new RegExp(tokenDelimiter.split("").join("|"), "g");
        this.readPosition = 0; // Current index in the token list
        // Split the input string into tokens, removing carriage returns
        this.parsedTokens = textContent.replace(/\r/g, '').split(splitRegex);
    }

    TokenStream.prototype = {
        /**
         * Checks if there are more tokens available or if the next token matches an expected value.
         * @param {string} [comparisonToken] An optional token to compare with the next available token.
         * @returns {boolean} True if more tokens exist, or if the next token matches the comparisonToken.
         */
        hasMoreTokens: function (comparisonToken) {
            if (typeof comparisonToken === "undefined") {
                return typeof this.parsedTokens[this.readPosition] !== "undefined" && this.parsedTokens[this.readPosition] !== "";
            } else {
                return this.parsedTokens[this.readPosition] === comparisonToken;
            }
        },
        /**
         * Retrieves the next token from the stream and advances the read position.
         * @returns {string} The next token.
         * @throws {RangeError} If attempting to read beyond the end of the token list.
         */
        getNext: function () {
            if (typeof this.parsedTokens[this.readPosition + 1] === "undefined") {
                throw new RangeError(`Index out of bounds at position '${this.readPosition}' during token retrieval.`);
            }
            return this.parsedTokens[this.readPosition++];
        },
        /**
         * Reads the next token, attempts to convert it to a number, and returns it.
         * @returns {number} The next token as a number.
         * @throws {TypeError} If the next token cannot be converted to a number.
         */
        readNumber: function () {
            if (isNaN(+this.peekCurrent())) {
                throw new TypeError(`'${this.peekCurrent()}' cannot be converted to a valid Number type.`);
            }
            return +this.getNext();
        },
        /**
         * Reads the next number token and parses it as an integer with a specified radix.
         * @param {number} [numericalBase=10] The base for parsing the integer (default is 10).
         * @returns {number} The parsed integer.
         */
        getNextInteger: function (numericalBase) {
            numericalBase = numericalBase | 10; // Default to base 10 if not provided
            return parseInt(this.readNumber(), numericalBase);
        },
        /**
         * Peeks at the current token without advancing the read position.
         * @returns {string} The current token.
         */
        peekCurrent: function () {
            return this.parsedTokens[this.readPosition];
        },
        /**
         * Resets the read position to the beginning of the token stream.
         */
        resetPosition: function () {
            this.readPosition = 0;
        }
    };

    return TokenStream;
}());

/*
 * Entry point: Read input from standard input and pass it to the main processing function.
 */
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));