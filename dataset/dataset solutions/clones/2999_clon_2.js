/* This module provides utilities for reading formatted input data. */
var DATA_READER = (function () {
    // Factory function to create a new data processor instance.
    function createInputProcessor(inputContent) {
        return new InputProcessor(inputContent);
    }

    // Constructor for the data processing object.
    function InputProcessor(sourceString) {
        // Store lines, splitting by newline and trimming each.
        this._sourceLines = sourceString.trim().split("\n");
        // Initialize pointer to the current line.
        this._linePointer = 0;
    }

    // Method to extract a single item from the current line.
    InputProcessor.prototype.extractSingleValue = function (returnRawString) {
        var currentLineData = this._sourceLines,
            lineIdx = this._linePointer,
            extractedResult;

        // If the current line hasn't been processed into an array, do it now.
        // It processes it in reverse order for efficient popping.
        if (typeof currentLineData[lineIdx] === "string") {
            currentLineData[lineIdx] = currentLineData[lineIdx].split(" ").reverse();
        }

        // Get the last item from the current line's array.
        extractedResult = currentLineData[lineIdx].pop();

        // If the current line is now empty, advance the line pointer.
        if (!currentLineData[lineIdx].length) {
            this._linePointer++;
        }

        // Return as string or parsed number based on the flag.
        return returnRawString ? extractedResult : +extractedResult;
    };

    // Method to read an entire line as an array of items.
    InputProcessor.prototype.getLineAsArray = function (keepStrings) {
        // Fetch the current line and advance the pointer.
        var lineElements = this._sourceLines[this._linePointer++].split(" ");
        // Return as strings or parsed numbers based on the flag.
        return keepStrings ? lineElements : lineElements.map(elementStr => +elementStr);
    };

    // Method to read a block of 'numRows' lines as a matrix (2D array).
    InputProcessor.prototype.readMatrixBlock = function (numRows, keepStrings) {
        // Slice the required number of lines and parse each into an array of strings.
        var matrixData = this._sourceLines.slice(this._linePointer, this._linePointer += numRows).map(rowString => rowString.split(" "));
        // Return as string arrays or parsed number arrays.
        return keepStrings ? matrixData : matrixData.map(row => row.map(cellValue => +cellValue));
    };

    // Method to read a block of 'numLines' lines as a 1D array.
    InputProcessor.prototype.getLinesAsValues = function (numLines, rawOutput) {
        // Slice the required number of lines.
        var extractedLinesArray = this._sourceLines.slice(this._linePointer, this._linePointer += numLines);
        // Return as raw strings or parsed numbers.
        return rawOutput ? extractedLinesArray : extractedLinesArray.map(lineValue => +lineValue);
    };

    // Expose the factory function.
    return createInputProcessor;
})();

/* Instantiate the data reader by reading from standard input. */
var dataStream = DATA_READER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates an N-dimensional array initialized with a specific value.
 * @param {any} initialValue The value to fill the array elements with.
 * @param {...number} dimensions The dimensions of the array (e.g., createMultiArray(0, 3, 4) for a 3x4 array of zeros).
 * @returns {Array} The N-dimensional array.
 */
function createMultiArray(initialValue) {
    var dimensionArgs = arguments,
        currentDimensionCount = dimensionArgs.length,
        // Build the inner-most array creation string first.
        evalStringRepresentation = "Array(dimensionArgs[" + --currentDimensionCount + "]).fill(0).map(itemPlaceholder => {return " + initialValue + ";})";

    // Wrap with outer array creations for each remaining dimension.
    while (--currentDimensionCount) {
        evalStringRepresentation = "Array(dimensionArgs[" + currentDimensionCount + "]).fill(0).map(itemPlaceholder => " + evalStringRepresentation + ")";
    }

    // Execute the string to create the array.
    return eval(evalStringRepresentation);
}

// Output the result of the main problem-solving function.
console.log(solveProblem());

/**
 * Main function to solve the problem.
 * This typically involves graph traversal (BFS) to find paths and distances.
 */
function solveProblem() {
    // Read the total number of nodes from input.
    var totalNodes = dataStream.extractSingleValue();

    // Initialize an array to track visited nodes for BFS, initially all unvisited (1).
    var visitedStatus = createMultiArray(1, totalNodes);
    // Initialize an adjacency list for the graph, each node having an empty array of neighbors.
    var graphAdjacencyList = createMultiArray("[]", totalNodes);

    // Read edges and build the adjacency list.
    // Edges are 0-indexed in problem context, so subtract 1.
    for (var nodeIndex = 0; nodeIndex < totalNodes - 1; nodeIndex++) {
        var connectionPair = dataStream.getLineAsArray().map(nodeVal => nodeVal - 1);
        graphAdjacencyList[connectionPair[0]].push(connectionPair[1]);
        graphAdjacencyList[connectionPair[1]].push(connectionPair[0]);
    }

    // --- First BFS: Find the farthest node from node 0 ---
    // Queue for the current level of BFS.
    var currentLevelQueue = [0],
        // Queue for the next level of BFS.
        nextLevelQueue = [],
        // Variable to store the farthest node found.
        farthestDiscoveredNode;

    // Mark the starting node (0) as visited.
    visitedStatus[0] = 0;

    // Perform BFS until both queues are empty.
    while (currentLevelQueue.length > 0 || nextLevelQueue.length > 0) {
        // If the current level queue is exhausted, move to the next level.
        if (currentLevelQueue.length === 0) {
            // This 'maximumPathLength' will be implicitly declared in the global scope if not declared elsewhere,
            // mimicking the original 'l++' behavior creating a global 'l'.
            maximumPathLength++;
            currentLevelQueue = nextLevelQueue;
            nextLevelQueue = []; // Reset next level queue.
        }

        // Dequeue a node from the current level.
        var processingNode = currentLevelQueue.pop();
        // Update the farthest discovered node.
        farthestDiscoveredNode = processingNode;

        // Explore neighbors of the current node.
        for (var neighborIdx = 0; neighborIdx < graphAdjacencyList[processingNode].length; neighborIdx++) {
            var neighborNode = graphAdjacencyList[processingNode][neighborIdx];
            // If the neighbor hasn't been visited yet.
            if (visitedStatus[neighborNode]) {
                // Add to the next level queue.
                nextLevelQueue.push(neighborNode);
                // Mark as visited.
                visitedStatus[neighborNode] = 0;
            }
        }
    }

    // --- Second BFS: Find the maximum path length (diameter) from the farthest node ---
    // Reinitialize queues and path length for the second BFS.
    var bfsQueueCurrent = [farthestDiscoveredNode],
        bfsQueueNext = [],
        maximumPathLength = 0; // This 'maximumPathLength' is a new local variable, shadowing any global.

    // Reset visited status for all nodes.
    visitedStatus = createMultiArray(1, totalNodes);
    // Mark the new starting node as visited.
    visitedStatus[farthestDiscoveredNode] = 0;

    // Perform BFS again.
    while (bfsQueueCurrent.length > 0 || bfsQueueNext.length > 0) {
        if (bfsQueueCurrent.length === 0) {
            // Increment path length.
            maximumPathLength++;
            bfsQueueCurrent = bfsQueueNext;
            bfsQueueNext = []; // Reset for the next level.
        }

        var nodeBeingProcessed = bfsQueueCurrent.pop();

        for (var neighborPointer = 0; neighborPointer < graphAdjacencyList[nodeBeingProcessed].length; neighborPointer++) {
            var adjacentNode = graphAdjacencyList[nodeBeingProcessed][neighborPointer];
            if (visitedStatus[adjacentNode]) {
                bfsQueueNext.push(adjacentNode);
                visitedStatus[adjacentNode] = 0;
            }
        }
    }

    // Determine the winner based on the final path length.
    // The original logic 'l % 3 === 1' implies a game theory problem.
    // If the maximum path length modulo 3 is 1, "Second" player wins, otherwise "First".
    return maximumPathLength % 3 === 1 ? "Second" : "First";
}