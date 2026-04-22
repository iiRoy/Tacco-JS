/*
 * This module provides utilities for parsing structured input data.
 * It encapsulates an input source and offers methods to extract various data types.
 */
let DATA_PARSER = (function() {

    /*
     * Factory function to create a new input source handler.
     *
     * @param {string} sourceContent - The raw string content to parse.
     * @returns {InputSourceHandler} A new instance of the InputSourceHandler.
     */
    function createParser(sourceContent) {
        return new InputSourceHandler(sourceContent);
    }

    /*
     * Constructor for the InputSourceHandler class.
     * Manages the raw input lines and the current reading position.
     *
     * @param {string} rawStringData - The initial string data.
     */
    function InputSourceHandler(rawStringData) {
        this._lines = rawStringData.trim().split("\n");         /* All input lines, stripped of leading/trailing whitespace */
        this._currentLineIndex = 0;                              /* Current line being processed, 0-based index */
    }

    /*
     * Prototype methods for InputSourceHandler.
     */

    /**
     * Extracts and returns the next value from the current line.
     * If the line is exhausted, it advances to the next.
     *
     * @param {boolean} returnAsString - If true, returns the value as a string; otherwise, as a number.
     * @returns {string|number} The extracted value.
     */
    InputSourceHandler.prototype.extractNextValue = function(returnAsString) {
        let currentSegments = this._lines,
            linePointer = this._currentLineIndex,
            retrievedDatum;

        // If the current line hasn't been processed into segments yet, do so by splitting and reversing.
        if (typeof currentSegments[linePointer] === "string") {
            currentSegments[linePointer] = currentSegments[linePointer].split(" ").reverse();
        }

        // Pop the last segment from the current line's array of segments.
        retrievedDatum = currentSegments[linePointer].pop();

        // If the current line is now empty, advance the line pointer to the next line.
        if (!currentSegments[linePointer].length) {
            this._currentLineIndex++;
        }

        // Return the value as a string or a number based on the `returnAsString` flag.
        return returnAsString ? retrievedDatum : +retrievedDatum;
    };

    /**
     * Retrieves an entire line, splits it by spaces, and optionally converts segments to numbers.
     *
     * @param {boolean} outputAsStrings - If true, returns an array of strings; otherwise, an array of numbers.
     * @returns {Array<string|number>} An array of values from the line.
     */
    InputSourceHandler.prototype.retrieveLine = function(outputAsStrings) {
        // Fetch the current line, split it by space, and then advance the line pointer.
        let lineSegments = this._lines[this._currentLineIndex++].split(" ");

        // Return segments as strings or converted numbers.
        return outputAsStrings ? lineSegments : lineSegments.map(segment => +segment);
    };

    /**
     * Reads a block of multiple lines, treating each as a row in a matrix.
     * Each row is split by spaces, and optionally converted to numbers.
     *
     * @param {number} numberOfRows - The number of lines (rows) to read.
     * @param {boolean} outputStringFormat - If true, returns a matrix of strings; otherwise, a matrix of numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
     */
    InputSourceHandler.prototype.getMultiLineData = function(numberOfRows, outputStringFormat) {
        // Extract a block of 'numberOfRows' lines, split each by space.
        let parsedRows = this._lines.slice(this._currentLineIndex, this._currentLineIndex += numberOfRows).map(line => line.split(" "));

        // Return the parsed rows as strings or nested arrays of numbers.
        return outputStringFormat ? parsedRows : parsedRows.map(row => row.map(item => +item));
    };

    /**
     * Reads a block of multiple lines without further splitting, optionally converting each line to a number.
     *
     * @param {number} countOfLines - The number of lines to read.
     * @param {boolean} stringMode - If true, returns an array of raw strings; otherwise, an array of numbers.
     * @returns {Array<string|number>} An array of lines.
     */
    InputSourceHandler.prototype.fetchLines = function(countOfLines, stringMode) {
        // Extract a block of 'countOfLines' lines without further splitting.
        let rawLineBlock = this._lines.slice(this._currentLineIndex, this._currentLineIndex += countOfLines);

        // Return lines as strings or converted numbers.
        return stringMode ? rawLineBlock : rawLineBlock.map(singleLine => +singleLine);
    };

    return createParser;
})();


/*
 * Dynamically constructs a multi-dimensional array based on provided dimensions.
 * This function uses `eval` for dynamic array creation.
 *
 * @param {*} initialValue - The value to fill the innermost array elements with.
 * @param {...number} dimensions - A variable number of arguments representing the dimensions of the array.
 * @returns {Array} The newly constructed multi-dimensional array.
 */
function buildMultiDimensionalArray(initialValue) {
    let dimensionArguments = arguments,
        dimensionCount = dimensionArguments.length,
        arrayCodeString = `Array(dimensionArguments[${--dimensionCount}]).fill(0).map(element => { return ${initialValue}; })`;

    // Loop to build up the nested array creation code string.
    while (--dimensionCount) {
        arrayCodeString = `Array(dimensionArguments[${dimensionCount}]).fill(0).map(element => ${arrayCodeString})`;
    }

    // Evaluate the constructed code string to create and return the array.
    return eval(arrayCodeString);
}


/*
 * Initialize the input parsing utility with data from standard input.
 * Reads the entire content of /dev/stdin as a UTF-8 string.
 */
const inputReader = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * Execute the main problem-solving logic and output the result to the console.
 */
console.log(solveProblem());

/*
 * The primary function that contains the core logic for the problem.
 * This function calculates the number of redundant edges in a graph
 * using the Floyd-Warshall algorithm for all-pairs shortest paths.
 *
 * @returns {number} The count of redundant edges.
 */
function solveProblem() {
    // Read the number of nodes (vertices) in the graph.
    const nodeCount = inputReader.extractNextValue();
    // Read the number of edges.
    const edgeCount = inputReader.extractNextValue();

    // Initialize an adjacency matrix (distance matrix) for all-pairs shortest paths.
    // Use a large value (effectively infinity) for unreachable paths.
    const distanceMatrix = buildMultiDimensionalArray(1_000_000_000, nodeCount, nodeCount);

    // Read all edge data, where each edge is [nodeA, nodeB, weight].
    const edgeData = inputReader.getMultiLineData(edgeCount);

    // Set diagonal elements of the distance matrix to 0, as the distance from a node to itself is zero.
    for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
        distanceMatrix[nodeIdx][nodeIdx] = 0;
    }

    // Populate the initial distance matrix with direct edge weights.
    // Node indices are typically 1-based in input, so adjust to 0-based.
    for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
        // Decrement node indices to make them 0-based.
        let firstNode = --edgeData[edgeIdx][0],
            secondNode = --edgeData[edgeIdx][1],
            pathCost = edgeData[edgeIdx][2];

        // For an undirected graph, set distances for both directions.
        distanceMatrix[firstNode][secondNode] = distanceMatrix[secondNode][firstNode] = pathCost;
    }

    // Apply the Floyd-Warshall algorithm to find all-pairs shortest paths.
    // Iterate through all possible intermediate nodes 'kNode'.
    for (let kNode = 0; kNode < nodeCount; kNode++)
        // Iterate through all possible start nodes 'iNode'.
        for (let iNode = 0; iNode < nodeCount; iNode++)
            // Iterate through all possible target nodes 'jNode'.
            for (let jNode = 0; jNode < nodeCount; jNode++) {
                // If a shorter path from iNode to jNode is found by passing through kNode,
                // update the distance in the matrix.
                if (distanceMatrix[iNode][jNode] > distanceMatrix[iNode][kNode] + distanceMatrix[kNode][jNode]) {
                    distanceMatrix[iNode][jNode] = distanceMatrix[iNode][kNode] + distanceMatrix[kNode][jNode];
                }
            }

    // Count the number of redundant edges.
    // An edge is considered redundant if its direct path is longer than the
    // shortest path found by the Floyd-Warshall algorithm.
    let redundantEdgeCount = 0;
    for (let checkEdgeIdx = 0; checkEdgeIdx < edgeCount; checkEdgeIdx++) {
        // Retrieve the original 0-based node indices and weight from the processed edgeData.
        let firstNode = edgeData[checkEdgeIdx][0],
            secondNode = edgeData[checkEdgeIdx][1],
            originalWeight = edgeData[checkEdgeIdx][2];

        // If the calculated shortest path between the two nodes is less than the original edge weight,
        // it means this edge is not part of a shortest path and can be removed, hence it's redundant.
        if (distanceMatrix[firstNode][secondNode] < originalWeight) {
            redundantEdgeCount++;
        }
    }

    // Return the final count of redundant edges.
    return redundantEdgeCount;
}