function ProcessInput(inputData) {
    "use strict";

    // This function recursively explores paths in a directed acyclic graph
    // to find the maximum possible weight (score) from a starting vertex.
    function explorePath(currentVertex, currentWeight, recursionLevel, visitedNodes) {
        let maximumPath = 0; // Stores the maximum weight found from the current path

        // If the current vertex has no outgoing edges (no allowed neighbors),
        // then this path ends, and its weight is the current path's weight.
        if (!adjacencies[currentVertex]) {
            return currentWeight;
        }

        // Iterate over all neighbors reachable from the current vertex.
        adjacencies[currentVertex].forEach(function(neighbor) {
            // Check if the neighbor has not been visited in the current path to avoid cycles.
            if (visitedNodes.indexOf(neighbor) === -1) {
                // Calculate the new weight for the path including this neighbor.
                let newWeight = currentWeight + edgeWeights[currentVertex][neighbor];

                // Mark the neighbor as visited for the current path.
                visitedNodes.push(neighbor);
                // Recursively explore from the neighbor and update the maximum path found.
                maximumPath = Math.max(maximumPath, explorePath(neighbor, newWeight, recursionLevel + 1, visitedNodes));
                // Backtrack: remove the neighbor from visited nodes to explore other paths.
                visitedNodes.pop();
            }
        });
        return maximumPath;
    }

    // Setup output functions and input parser.
    const logOutput = console.log;
    const printChar = require("util").print; // This variable is declared but not used in the original logic.
    const inputReader = new InputParser(inputData, " \n");

    // Main processing logic starts here.
    // Read graph dimensions.
    let numVertices = inputReader.nextInt();
    let numEdges = inputReader.nextInt();

    // Initialize data structures for graph representation.
    let edgeWeights = []; // Stores the weights of edges: edgeWeights[from][to] = weight
    let adjacencies = []; // Stores adjacency lists: adjacencies[from] = [to1, to2, ...]
    let loopCounter;
    let overallMax = -1; // This variable is declared but not used in the original logic.

    // Initialize arrays for each vertex up to numVertices - 1.
    for (loopCounter = 0; loopCounter < numVertices - 1; loopCounter++) {
        edgeWeights[loopCounter] = [];
        adjacencies[loopCounter] = [];
    }

    // Read edge data from input and populate graph structures.
    for (loopCounter = 0; loopCounter < numEdges; loopCounter++) {
        let startNode = inputReader.nextInt();
        let endNode = inputReader.nextInt();
        let edgeValue = inputReader.nextInt();

        // Ensure the adjacency list for startNode exists before pushing.
        if (!adjacencies[startNode]) {
            adjacencies[startNode] = [];
        }
        adjacencies[startNode].push(endNode);

        // Ensure the edge weight array for startNode exists before assigning.
        if (!edgeWeights[startNode]) {
            edgeWeights[startNode] = [];
        }
        edgeWeights[startNode][endNode] = edgeValue;
    }

    // Start the DFS from node 0 with an initial score of 0, depth 0, and an empty visited list.
    // Output the maximum path weight found.
    logOutput(explorePath(0, 0, 0, []));
}

// InputParser utility class for reading tokens from a string.
const InputParser = (function() {
    function InputParser(inputString, tokenSeparator) {
        // Create a regular expression to split the input string by the given separators.
        const regexPattern = new RegExp(tokenSeparator.split("").join("|"), "g");
        this.currentIndex = 0; // Current position in the token list.
        // Split the input string into tokens, removing carriage returns.
        this.tokenList = inputString.replace(/\r/g, '').split(regexPattern);
    }

    InputParser.prototype = {
        // Checks if there is a next token, optionally checking if it matches a specific value.
        hasNext: function(checkValue) {
            if (typeof checkValue === "undefined") {
                return typeof this.tokenList[this.currentIndex] !== "undefined" && this.tokenList[this.currentIndex] !== "";
            } else {
                return this.tokenList[this.currentIndex] === checkValue;
            }
        },
        // Retrieves the next token and advances the index.
        getNextToken: function() {
            if (typeof this.tokenList[this.currentIndex + 1] === "undefined") {
                throw new RangeError("InputParser: index out of bounds at '" + this.currentIndex + "'");
            }
            return this.tokenList[this.currentIndex++];
        },
        // Retrieves the next token and converts it to a Number.
        getNextNumber: function() {
            if (isNaN(+this.peekNext())) {
                throw new TypeError("InputParser: '" + this.peekNext() + "' cannot convert to Number");
            }
            return +this.getNextToken();
        },
        // Retrieves the next token, converts it to a Number, and then to an integer with a specified base.
        nextInt: function(baseValue) {
            baseValue = baseValue | 10; // Default to base 10 if not provided.
            return parseInt(this.getNextNumber(), baseValue);
        },
        // Peeks at the next token without advancing the index.
        peekNext: function() {
            return this.tokenList[this.currentIndex];
        },
        // Resets the current index to the beginning of the token list.
        resetIndex: function() {
            this.currentIndex = 0;
        }
    };

    return InputParser;
}());

// Read input from stdin and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
