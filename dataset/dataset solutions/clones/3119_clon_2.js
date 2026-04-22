"use strict";

// This class provides utilities to parse input data line by line, token by token.
function InputParserUtility(inputStringData, typeConversionFunc) {
	// Store the input string, split into individual lines.
	this._sourceLines = inputStringData.split("\n");

	// Initialize the current token index within a line.
	this._currentSegmentIdx = 0;

	// Initialize the current line index.
	this._currentLineIdx = 0;

	// Set the function used for type conversion, defaulting to Number.
	this._valueConverter = typeConversionFunc || Number;
}

// Prototype method to retrieve the next single value from the input stream.
InputParserUtility.prototype.fetchNextValue = function() {
	var currentLineContent = this._sourceLines[this._currentLineIdx];

	// If there's no content on the current line, return undefined.
	if (!currentLineContent) {
		return;
	}

	// Trim whitespace and split the line into segments (tokens).
	var lineSegments = currentLineContent.trim().split(" ");
	var extractedSegment = lineSegments[this._currentSegmentIdx];

	// Advance the token index.
	this._currentSegmentIdx++;

	// If all tokens on the current line have been consumed, reset token index and advance to the next line.
	if (lineSegments.length === this._currentSegmentIdx) {
		this._currentSegmentIdx = 0;
		this._currentLineIdx++;
	}

	// Convert and return the extracted segment.
	return this._valueConverter(extractedSegment);
};


// Prototype method to retrieve all values from the current line.
InputParserUtility.prototype.fetchLineValues = function() {
	var fullLineContent = this._sourceLines[this._currentLineIdx];

	// If the line is empty or doesn't exist, return undefined.
	if (!fullLineContent) {
		return;
	}

	// Reset the token index for the new line being processed.
	this._currentSegmentIdx = 0;

	// Advance to the next line after processing the current one.
	this._currentLineIdx++;

	// Split the line into segments and map them using the conversion function.
	return fullLineContent.split(" ").map(this._valueConverter);
};

// Export the utility class for use in other modules.
module.exports = InputParserUtility;


// Main function to process graph-related data from the input.
function processGraphData(rawTextStream) {
	// Create an instance of the input parser.
	const inputReader = new InputParserUtility(rawTextStream);

	// Read the total number of vertices (N).
	const vertexCount = inputReader.fetchNextValue();

	// Read the total number of edges (M).
	const edgeCountTotal = inputReader.fetchNextValue();

	// Initialize an adjacency list to represent the graph.
	const graphConnections = [];
	for (let nodeIndex = 1; nodeIndex <= vertexCount; nodeIndex++) {
		graphConnections[nodeIndex] = [];
	}

	// Populate the adjacency list based on the provided edges.
	for (let edgeIndex = 0; edgeIndex < edgeCountTotal; edgeIndex++) {
		let firstVertex = inputReader.fetchNextValue();
		let secondVertex = inputReader.fetchNextValue();
		graphConnections[firstVertex].push(secondVertex);
		graphConnections[secondVertex].push(firstVertex); // Add reverse connection for undirected graph.
	}

	// Initialize flags for specific graph properties.
	let hasSpecialDegree = false; // Checks if any node has a degree of 6.
	let allEvenDegrees = true;    // Checks if all nodes have an even degree.

	// Iterate through each vertex to check its properties.
	for (let checkIndex = 1; checkIndex <= vertexCount; checkIndex++) {
		// Check if the current node's degree is exactly 6.
		if (graphConnections[checkIndex].length === 6) {
			hasSpecialDegree = true;
		}

		// Check if the current node's degree is odd.
		if (graphConnections[checkIndex].length % 2 !== 0) {
			allEvenDegrees = false; // If any degree is odd, this condition is false.
		}
	}

	// Output "Yes" if both conditions are met, otherwise "No".
	console.log((hasSpecialDegree && allEvenDegrees) ? "Yes" : "No");

}


// Execute the main processing function by reading input from standard input.
processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));