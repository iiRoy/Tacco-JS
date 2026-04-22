"use strict";
// Module for processing input data line by line
var InputProcessor = (function() {
    // Factory function to create a new text data handler
    function createProcessor(sourceText) {
        return new TextLineProcessor(sourceText);
    }

    // Constructor for the text data handler
    function TextLineProcessor(rawInput) {
        // Store lines, split by newline, after trimming overall whitespace
        this._lineStorage = rawInput.trim().split("\n");
        // Initialize current line pointer
        this._currentLineIndex = 0;
    }

    // Prototype method to retrieve a single token from the current line
    TextLineProcessor.prototype.readToken = function(asString) {
        var lineArray = this._lineStorage;
        var lineIdx = this._currentLineIndex;
        var extractedToken;

        // If current line hasn't been split into tokens yet, do so
        // Note: tokens are processed from right to left, hence the reverse
        if (typeof lineArray[lineIdx] === "string") {
            lineArray[lineIdx] = lineArray[lineIdx].split(" ").reverse();
        }
        
        // Pop the last (original first) token
        extractedToken = lineArray[lineIdx].pop();
        
        // If the line is now empty, advance to the next line
        if (!lineArray[lineIdx].length) {
            this._currentLineIndex++;
        }
        
        // Return token as string or converted to number based on flag
        return asString ? extractedToken : +extractedToken;
    };

    // Prototype method to retrieve all tokens from the current line
    TextLineProcessor.prototype.readLineTokens = function(asString) {
        // Get the current line and advance the line pointer
        var lineParts = this._lineStorage[this._currentLineIndex++].split(" ");
        // Return tokens as strings or converted to numbers
        return asString ? lineParts : lineParts.map(valStr => +valStr);
    };

    // Prototype method to retrieve a matrix (N rows of tokens)
    TextLineProcessor.prototype.readMatrix = function(numRows, asString) {
        // Slice the required number of rows and advance the line pointer
        var matrixRows = this._lineStorage.slice(this._currentLineIndex, this._currentLineIndex += numRows)
                                        .map(rowStr => rowStr.split(" "));
        // Return matrix as strings or converted to numbers
        return asString ? matrixRows : matrixRows.map(rowStr => rowStr.map(valStr => +valStr));
    };

    // Prototype method to retrieve N lines as an array
    TextLineProcessor.prototype.readLines = function(numLines, asString) {
        // Slice the required number of lines and advance the line pointer
        var lineContents = this._lineStorage.slice(this._currentLineIndex, this._currentLineIndex += numLines);
        // Return lines as strings or converted to numbers
        return asString ? lineContents : lineContents.map(lineStr => +lineStr);
    };

    return createProcessor; // Return the factory function
})();

// Initialize the input reader with data from standard input
var inputReader = InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

// Utility function to create N-dimensional arrays
function createMultiDimArray(initialValue) {
    var args = arguments,
        argCount = args.length,
        arrayCreationCode = "Array(args[" + --argCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    
    // Build nested array creation code dynamically
    while (--argCount) {
        arrayCreationCode = "Array(args[" + argCount + "]).fill(0).map(x=>" + arrayCreationCode + ")";
    }
    
    // Evaluate the generated code to create the array
    return eval(arrayCreationCode);
}

// Global variables for graph structure and edge bitmasks
var adjacencyList;
var edgeBitmasks;

// Execute the main processing logic and log the result if defined
var finalResult = processGraphData();
if (finalResult !== undefined) console.log(finalResult);

// Main function to process graph data and compute the result
function processGraphData() {
    var nodeCount = inputReader.readToken(); // Read number of nodes
    var sourceNodes = [],
        targetNodes = []; // Arrays to store edge endpoints

    // Initialize adjacency list for the graph
    adjacencyList = createMultiDimArray("[]", nodeCount);
    // Initialize bitmasks for each edge, initially all zeros
    edgeBitmasks = createMultiDimArray(0, nodeCount - 1);

    // Read N-1 edges
    for (var edgeIndex = 0; edgeIndex < nodeCount - 1; edgeIndex++) {
        var firstNode = inputReader.readToken() - 1; // Read first node (0-indexed)
        var secondNode = inputReader.readToken() - 1; // Read second node (0-indexed)
        
        // Store edge endpoints, ensuring canonical order (min, max)
        sourceNodes[edgeIndex] = Math.min(firstNode, secondNode);
        targetNodes[edgeIndex] = Math.max(firstNode, secondNode);
        
        // Add edges to the adjacency list (undirected graph)
        adjacencyList[firstNode].push(secondNode);
        adjacencyList[secondNode].push(firstNode);
    }

    var queryCount = inputReader.readToken(); // Read number of queries (paths)

    // Process each query
    for (var loopCounter = 0; loopCounter < queryCount; loopCounter++) {
        var queryStartNode = inputReader.readToken() - 1; // Read query start node
        var queryEndNode = inputReader.readToken() - 1; // Read query end node
        
        var currentQueryBit = 1 << loopCounter; // Unique bit for this query
        
        // Find the path between queryStartNode and queryEndNode using DFS
        // The pathNodes array will contain the sequence of nodes in the path
        var pathNodes = findPathDepthFirst(queryStartNode, queryEndNode, -1, []);
        
        // Iterate through the path to identify edges and update their bitmasks
        for (var pathSegmentIndex = 1; pathSegmentIndex < pathNodes.length; pathSegmentIndex++) {
            var minNodeIdx = Math.min(pathNodes[pathSegmentIndex - 1], pathNodes[pathSegmentIndex]);
            var maxNodeIdx = pathNodes[pathSegmentIndex - 1] + pathNodes[pathSegmentIndex] - minNodeIdx; // Sum - min = max
            
            // Find the corresponding edge in the stored edge list
            for (var edgeSearchIndex = 0;; edgeSearchIndex++) {
                if (sourceNodes[edgeSearchIndex] === minNodeIdx && targetNodes[edgeSearchIndex] === maxNodeIdx) {
                    // Apply the query bitmask to this edge
                    edgeBitmasks[edgeSearchIndex] |= currentQueryBit;
                    break; // Edge found, move to next path segment
                }
            }
        }
    }

    // Dynamic programming section
    var maxBitmask = 1 << queryCount; // Maximum possible bitmask value (2^m)
    var dynamicProgState = createMultiDimArray(0, maxBitmask); // DP array initialized to zeros
    dynamicProgState[0] = 1; // Base case: empty set has one way

    // Iterate through each edge to update DP states
    for (var edgeIndex = 0; edgeIndex < nodeCount - 1; edgeIndex++) {
        if (edgeBitmasks[edgeIndex] === 0) {
            // If an edge is not part of any query path, it can be chosen or not
            // effectively doubling the ways for all current states
            for (var dpIndex = 0; dpIndex < maxBitmask; dpIndex++) dynamicProgState[dpIndex] *= 2;
        } else {
            // If an edge is part of query paths, update DP states based on its bitmask
            for (var dpIndex = maxBitmask; dpIndex--;) { // Iterate downwards
                // If the current state (i) already contains all bits of this edge's bitmask
                if ((dpIndex | edgeBitmasks[edgeIndex]) === dpIndex) {
                    dynamicProgState[dpIndex] *= 2; // Double ways, as this edge can be chosen or not
                } else {
                    // Otherwise, add ways from the state without this edge's bitmask
                    // to the state that includes it
                    dynamicProgState[dpIndex | edgeBitmasks[edgeIndex]] += dynamicProgState[dpIndex];
                }
            }
        }
    }
    
    // The final result is the number of ways to satisfy all queries (represented by maxBitmask - 1)
    return dynamicProgState[maxBitmask - 1];
}

// Depth-First Search function to find a path between two nodes
function findPathDepthFirst(currentVertex, goalVertex, parentVertex, visitedPath) {
    visitedPath.push(currentVertex); // Add current vertex to the path

    // If goal is reached, return the path
    if (goalVertex === currentVertex) return visitedPath;

    // Explore neighbors
    for (var neighborVertex of adjacencyList[currentVertex]) {
        // Skip if neighbor is the parent (to avoid going back immediately)
        if (neighborVertex === parentVertex) continue;
        
        // Recursively call DFS
        var foundPath = findPathDepthFirst(neighborVertex, goalVertex, currentVertex, visitedPath);
        
        // If a path was found in the recursive call, return it immediately
        if (foundPath) return foundPath;
    }
    
    // If no path found through this branch, backtrack
    visitedPath.pop();
}