function PrimaryHandler(inputContent) {
    "use strict";

    // Recursive function to traverse paths and calculate maximum scores
    function explorePath(currentVertex, currentWeight, pathLength) {
        let highestValue = 0; // Initialize maximum path value for this branch

        // If no connections are allowed from the current vertex, return its current weight
        if (!permittedConnections[currentVertex]) {
            return currentWeight;
        }

        // Iterate over all possible neighbors from the current vertex
        permittedConnections[currentVertex].forEach(function(neighbor) {
            // Check if this specific path (currentVertex -> neighbor) has not been processed yet
            if (!memoizedResults[currentVertex][neighbor]) {
                // Calculate the new weight by adding the edge cost
                let newWeight = currentWeight + edgeWeights[currentVertex][neighbor];
                // Recursively call explorePath for the neighbor and store the result
                memoizedResults[currentVertex][neighbor] = explorePath(neighbor, newWeight, pathLength + 1);
            }

            // Update the highest value found so far in this branch
            highestValue = Math.max(highestValue, memoizedResults[currentVertex][neighbor]);
        });
        return highestValue; // Return the maximum score from this vertex's paths
    }

    // Define utility functions for output and input parsing
    let outputLog = console.info,
        printerUtil = require("util").print,
        inputParser = new InputTokenizer(inputContent, " \n");

    // Main program logic starts here
    let vertexCount = inputParser.getIntegerToken(),
        edgeCount = inputParser.getIntegerToken(),
        edgeWeights = [],
        permittedConnections = [],
        memoizedResults = [],
        idxCounter, overallMax = -1;

    // Initialize data structures for graph representation
    for (idxCounter = 0; idxCounter < vertexCount - 1; idxCounter++) {
        edgeWeights[idxCounter] = [];
        permittedConnections[idxCounter] = [];
        memoizedResults[idxCounter] = [];
    }

    // Read and populate graph connections and weights
    for (idxCounter = 0; idxCounter < edgeCount; idxCounter++) {
        let startNode = inputParser.getIntegerToken(),
            endNode = inputParser.getIntegerToken(),
            connectionCost = inputParser.getIntegerToken();

        permittedConnections[startNode].push(endNode);
        edgeWeights[startNode][endNode] = connectionCost;
    }

    // Execute the path exploration from the starting node (node 0) and print the result
    outputLog(explorePath(0, 0, 0));
}

// InputTokenizer class for parsing string input
let InputTokenizer = (function() {
    function InputTokenizer(sourceString, separatorChars) {
        // Create a regular expression from the separator characters
        let splitRegex = new RegExp(separatorChars.split("").join("|"), "g");
        this.positionIndex = 0; // Current position in the token list
        // Clean up carriage returns and split the string into tokens
        this.tokenList = sourceString.replace(/\r/g, '').split(splitRegex);
    }

    InputTokenizer.prototype = {
        // Checks if there are more tokens available
        hasMoreTokens: function(expectedValue) {
            if (typeof expectedValue === "undefined") {
                return typeof this.tokenList[this.positionIndex] !== "undefined" && this.tokenList[this.positionIndex] !== "";
            } else {
                return this.tokenList[this.positionIndex] === expectedValue;
            }
        },
        // Retrieves the next token and advances the index
        getNextToken: function() {
            if (typeof this.tokenList[this.positionIndex + 1] === "undefined") {
                throw new RangeError("Index out of allowed range at '" + this.positionIndex + "'");
            }
            return this.tokenList[this.positionIndex++];
        },
        // Converts the next token to a number
        getNumericToken: function() {
            if (isNaN(+this.peekCurrent())) {
                throw new TypeError("'" + this.peekCurrent() + "' cannot be converted to a numerical value");
            }
            return +this.getNextToken();
        },
        // Parses the next token as an integer
        getIntegerToken: function(baseRadix) {
            baseRadix = baseRadix || 10; // Default to base 10
            return parseInt(this.getNumericToken(), baseRadix);
        },
        // Peeks at the current token without advancing the index
        peekCurrent: function() {
            return this.tokenList[this.positionIndex];
        },
        // Resets the tokenizer's position to the beginning
        resetPosition: function() {
            this.positionIndex = 0;
        }
    };

    return InputTokenizer;
}());

// Execute the primary handler with input from standard input
PrimaryHandler(require("node:fs").readFileSync("/dev/fd/0", "utf-8"));