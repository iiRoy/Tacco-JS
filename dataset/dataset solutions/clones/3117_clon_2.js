"use strict";

// This utility class is designed for sequentially parsing structured text data.
// It reads input line by line and token by token, applying a specified type conversion.
function DataStream(sourceText, valueMapper) {
    // Stores the entire input as an array of strings, where each element is a line.
    this._textSegments = sourceText.split("\n");
    // Keeps track of the current token's index within the active line.
    this._tokenPos = 0;
    // Points to the index of the current line being processed in `_textSegments`.
    this._lineIndex = 0;
    // The function used to convert string tokens into their desired data type.
    // Defaults to `parseInt` if no specific mapper is provided, suitable for integer inputs.
    this._castMethod = valueMapper || parseInt;
}

// Prototype method to extract and return the very next single data token from the stream.
// It handles advancing both the token position and the line index as needed.
DataStream.prototype.getNextItem = function() {
    // Fetch the string content of the current line.
    var activeLine = this._textSegments[this._lineIndex];

    // If the current line is undefined (e.g., end of file), return immediately.
    if (!activeLine) {
        return;
    }

    // Clean whitespace from the line and then split it into an array of individual tokens using space as a delimiter.
    var lineTokens = activeLine.trim().split(" ");
    // Retrieve the token at the current `_tokenPos`.
    var currentPart = lineTokens[this._tokenPos];

    // Increment the token position to point to the next token for subsequent calls.
    this._tokenPos++;

    // Check if all tokens on the current line have been consumed.
    if (lineTokens.length === this._tokenPos) {
        // Reset the token position to 0 for the start of the next line.
        this._tokenPos = 0;
        // Move to the next line in the `_textSegments` array.
        this._lineIndex++;
    }

    // Apply the configured type conversion function (`_castMethod`) to the extracted token and return the result.
    return this._castMethod(currentPart);
};


// Prototype method to read all tokens from the current line, convert them, and then advance to the next line.
DataStream.prototype.parseLineTokens = function() {
    // Obtain the content of the current line.
    var activeLine = this._textSegments[this._lineIndex];

    // If there's no more line content, return early.
    if (!activeLine) {
        return;
    }

    // Reset the token position, as this method processes the entire line from its beginning.
    this._tokenPos = 0;
    // Advance the line index to move past the current line.
    this._lineIndex++;

    // Split the current line into tokens and apply the `_castMethod` to each token,
    // returning an array of the converted values.
    return activeLine.split(" ").map(this._castMethod);
};

// Make the DataStream class available for import by other modules.
module.exports = DataStream;


// This is the main function responsible for solving the graph-related problem.
function solveGraphProblem(problemData) {

    // Instantiate a new DataStream reader to process the raw input data.
    const inputReader = new DataStream(problemData);

    // Read the total number of vertices (nodes) in the graph from the input.
    const numVertices = inputReader.getNextItem();
    // Read the total number of edges (connections) in the graph from the input.
    const numEdges = inputReader.getNextItem();


    // Initialize an adjacency list to represent the graph's connections.
    // The list is 1-indexed to match typical graph problem conventions (nodes 1 to N).
    const graphConnections = [];
    for (let nodeIdx = 1; nodeIdx <= numVertices; nodeIdx++) {
        graphConnections[nodeIdx] = []; // Each node starts with an empty list of neighbors.
    }


    // Loop through the input to read and record all graph edges.
    for (let edgeIdx = 0; edgeIdx < numEdges; edgeIdx++) {
        // Read the identifier for the first endpoint of the current edge.
        let endpoint1 = inputReader.getNextItem();
        // Read the identifier for the second endpoint of the current edge.
        let endpoint2 = inputReader.getNextItem();

        // Since the graph is undirected, add connections in both directions.
        graphConnections[endpoint1].push(endpoint2);
        graphConnections[endpoint2].push(endpoint1);
    }


    // Declare boolean and counter variables to track specific properties of the graph.
    let foundVertexDegree6 = false; // Becomes true if any node has exactly 6 neighbors.
    let verticesWithDegree4 = 0;    // Counts how many nodes have exactly 4 neighbors.
    let noOddDegrees = true;        // Stays true only if all nodes have an even number of neighbors.


    // Iterate through each node in the graph to calculate and analyze its degree.
    for (let nodeIdx = 1; nodeIdx <= numVertices; nodeIdx++) {

        // Check if the current node's degree (number of connections) is precisely 6.
        if (graphConnections[nodeIdx].length === 6) {
            foundVertexDegree6 = true;
        }

        // Check if the current node's degree is precisely 4.
        if (graphConnections[nodeIdx].length == 4) {
            verticesWithDegree4 += 1; // Increment the counter for degree-4 nodes.
        }

        // Check if the current node's degree is an odd number.
        if (graphConnections[nodeIdx].length % 2 !== 0) {
            noOddDegrees = false; // If any node has an odd degree, set this flag to false.
        }
    }


    // Output the final result based on a complex logical condition.
    // The condition evaluates to "Yes" if:
    // (There is at least one node with degree 6 OR there are two or more nodes with degree 4)
    // AND (All nodes in the graph have an even degree). Otherwise, "No".
    console.log(((foundVertexDegree6 || verticesWithDegree4 >= 2) && noOddDegrees) ? "Yes" : "No");

}


// Invoke the main solution function, providing it with data read from standard input.
// The `fs` module is used to read the file, and "utf8" specifies the encoding.
solveGraphProblem(require("fs").readFileSync("/dev/stdin", "utf8"));