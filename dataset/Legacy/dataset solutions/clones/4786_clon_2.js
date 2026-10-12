var INPUT_PARSER = (function() {
    /**
     * Initializes a new input parsing utility.
     * @param {string} rawInputContent - The entire input string received.
     * @returns {InputHandler} An instance capable of reading input.
     */
    function createParser(rawInputContent) {
        return new InputHandler(rawInputContent);
    }

    /**
     * @class InputHandler
     * @param {string} contentString - The full string content to be parsed.
     */
    function InputHandler(contentString) {
        // Internal storage for all lines of input, trimmed and split.
        this._sourceLines = contentString.trim().split("\n");
        // Index to keep track of the current line being processed.
        this._currentLineIndex = 0;
    }

    /**
     * Reads a single token from the current line, processing from right to left.
     * Advances to the next line if the current one is exhausted.
     * @param {boolean} [returnAsText=false] - If true, returns the token as a string; otherwise, as a number.
     * @returns {string|number} The extracted token.
     */
    InputHandler.prototype.readSingleValue = function(returnAsText) {
        var allLines = this._sourceLines;
        var currentLinePosition = this._currentLineIndex;
        var retrievedToken;

        // If the current line is still a raw string, split it into tokens and reverse for right-to-left popping.
        if (typeof allLines[currentLinePosition] === "string") {
            allLines[currentLinePosition] = allLines[currentLinePosition].split(" ").reverse();
        }

        // Get the last token from the (reversed) current line.
        retrievedToken = allLines[currentLinePosition].pop();

        // If the current line is now empty, increment the line index.
        if (!allLines[currentLinePosition].length) {
            this._currentLineIndex++;
        }

        // Return the token, optionally converted to a number.
        return returnAsText ? retrievedToken : +retrievedToken;
    };

    /**
     * Reads an entire line, splitting it into tokens.
     * Increments the line index after reading.
     * @param {boolean} [keepTokensAsStrings=false] - If true, tokens are returned as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of tokens from the line.
     */
    InputHandler.prototype.readLineTokens = function(keepTokensAsStrings) {
        // Fetch the current line, split by space, and then advance the line pointer.
        var lineTokens = this._sourceLines[this._currentLineIndex++].split(" ");
        // Return tokens as strings or map them to numbers.
        return keepTokensAsStrings ? lineTokens : lineTokens.map(tokenStr => +tokenStr);
    };

    /**
     * Reads a block of lines as a matrix (2D array).
     * Advances the line index by the number of rows read.
     * @param {number} numberOfRows - The count of rows to read for the matrix.
     * @param {boolean} [outputAsStrings=false] - If true, matrix elements are strings; otherwise, numbers.
     * @returns {Array<Array<string|number>>} The parsed matrix.
     */
    InputHandler.prototype.readMatrix = function(numberOfRows, outputAsStrings) {
        // Extract the specified number of lines for the matrix.
        var matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numberOfRows)
                                          .map(line => line.split(" ")); // Split each line into elements.

        // Return the matrix, optionally converting all elements to numbers.
        return outputAsStrings ? matrixRows : matrixRows.map(row => row.map(elementStr => +elementStr));
    };

    /**
     * Reads a specified number of raw lines from the input.
     * Advances the line index by the 'count' parameter.
     * @param {number} count - The number of lines to retrieve.
     * @param {boolean} [returnRawStrings=false] - If true, returns lines as strings; otherwise, attempts numeric conversion.
     * @returns {Array<string|number>} An array of the read lines.
     */
    InputHandler.prototype.readLines = function(count, returnRawStrings) {
        // Slice the required number of lines from the source.
        var extractedLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += count);
        // Return lines as strings or convert them to numbers.
        return returnRawStrings ? extractedLines : extractedLines.map(lineValue => +lineValue);
    };

    return createParser;
})();

// Initialize the input reader by loading content from standard input.
var inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically creates a multi-dimensional array initialized with a specific value.
 * @param {*} initialValue - The value to fill the array elements with.
 * @param {...number} dimensions - The sizes of each dimension (e.g., dim1, dim2, ...).
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    var dimensionArguments = arguments;
    var dimensionCount = dimensionArguments.length;
    // Construct the innermost array creation expression.
    var arrayCreationExpression = "Array(dimensionArguments[" + --dimensionCount + "]).fill(0).map(_=>{return " + initialValue + ";})";

    // Build up the nested array structure for all dimensions.
    while (--dimensionCount) {
        arrayCreationExpression = "Array(dimensionArguments[" + dimensionCount + "]).fill(0).map(_=>" + arrayCreationExpression + ")";
    }
    // Execute the generated string to create the array.
    return eval(arrayCreationExpression);
}

// Execute the primary logic function and output its result to the console.
console.log(mainLogic());

/**
 * Contains the core algorithm for solving the problem.
 * This function implements the Floyd-Warshall algorithm to find all-pairs shortest paths
 * in a graph and then counts specific edges.
 * @returns {number} The final calculated count of edges that are not part of any shortest path.
 */
function mainLogic() {
    // Read the number of vertices (N) and the number of edges (M) from input.
    var vertexCount = inputReader.readSingleValue();
    var edgeCount = inputReader.readSingleValue();

    // Initialize a distance matrix. All distances are set to a very large number (infinity),
    // representing no direct path, except for self-loops which are 0.
    var shortestPathDistances = createMultiDimArray(1e9, vertexCount, vertexCount);

    // Read all edge definitions (start_node, end_node, weight).
    var originalEdges = inputReader.readMatrix(edgeCount);

    // Set diagonal elements of the distance matrix to 0 (distance from a node to itself).
    for (var i = 0; i < vertexCount; i++) {
        shortestPathDistances[i][i] = 0;
    }

    // Populate the initial distance matrix with direct edge weights.
    // The graph is undirected, so update both (u,v) and (v,u).
    for (var j = 0; j < edgeCount; j++) {
        // Adjust node indices to be 0-based.
        var uNode = --originalEdges[j][0];
        var vNode = --originalEdges[j][1];
        var edgeWeight = originalEdges[j][2];

        shortestPathDistances[uNode][vNode] = shortestPathDistances[vNode][uNode] = edgeWeight;
    }

    // Apply the Floyd-Warshall algorithm.
    // Iterate through all possible intermediate nodes (k).
    for (var kNode = 0; kNode < vertexCount; kNode++) {
        // Iterate through all possible source nodes (i).
        for (var iNode = 0; iNode < vertexCount; iNode++) {
            // Iterate through all possible destination nodes (j).
            for (var jNode = 0; jNode < vertexCount; jNode++) {
                // If a shorter path from i to j is found via k, update the distance.
                if (shortestPathDistances[iNode][jNode] > shortestPathDistances[iNode][kNode] + shortestPathDistances[kNode][jNode]) {
                    shortestPathDistances[iNode][jNode] = shortestPathDistances[iNode][kNode] + shortestPathDistances[kNode][jNode];
                }
            }
        }
    }

    // Count how many original edges are not part of any shortest path.
    var nonShortestPathEdges = 0;
    for (var l = 0; l < edgeCount; l++) {
        // Retrieve the original edge's nodes and weight.
        // Note: originalEdges[l][0] and originalEdges[l][1] are already 0-based from earlier adjustment.
        var source = originalEdges[l][0];
        var destination = originalEdges[l][1];
        var initialWeight = originalEdges[l][2];

        // If the shortest path distance between source and destination is less than
        // the original edge's weight, it means this original edge is redundant
        // (i.e., not part of any shortest path).
        if (shortestPathDistances[source][destination] < initialWeight) {
            nonShortestPathEdges++;
        }
    }

    return nonShortestPathEdges;
}
