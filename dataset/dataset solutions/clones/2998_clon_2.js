/* This module provides utilities for parsing input text. */
var INPUT_PROCESSOR_BUILDER = (function() {
    /* Factory function to create a new input reader instance. */
    function createInputReader(sourceText) {
        return new DataParser(sourceText);
    }

    /* Constructor for the DataParser class. */
    function DataParser(textInput) {
        // Store processed lines, trimming whitespace and splitting by newline.
        this._processedLines = textInput.trim().split("\n");
        // Initialize line pointer to the first line.
        this._currentLinePointer = 0;
    }

    /* Prototype method to extract a single scalar value from the current line. */
    DataParser.prototype.extractScalar = function(returnAsRaw) {
        var currentLineData = this._processedLines;
        var lineIndex = this._currentLinePointer;
        var extractedValue;

        // If the current line is still a string, process it.
        if (typeof currentLineData[lineIndex] === "string") {
            currentLineData[lineIndex] = currentLineData[lineIndex].split(" ").reverse();
        }

        // Pop the last element from the reversed array.
        extractedValue = currentLineData[lineIndex].pop();

        // If the line becomes empty after popping, advance the line pointer.
        if (!currentLineData[lineIndex].length) {
            this._currentLinePointer++;
        }

        // Return raw string or parsed number based on 'returnAsRaw' flag.
        return returnAsRaw ? extractedValue : Number(extractedValue);
    };

    /* Prototype method to retrieve all values from the current line. */
    DataParser.prototype.getLineValues = function(returnRawStrings) {
        var lineContent = this._processedLines[this._currentLinePointer++];
        var values = lineContent.split(" ");
        // Return raw strings or an array of numbers.
        return returnRawStrings ? values : values.map(element => Number(element));
    };

    /* Prototype method to read a block of 'numLines' as a 2D array (matrix). */
    DataParser.prototype.readMatrixBlock = function(numLines, returnRaw) {
        var startIdx = this._currentLinePointer;
        var endIdx = this._currentLinePointer += numLines;
        var matrixRows = this._processedLines.slice(startIdx, endIdx);
        var parsedMatrix = matrixRows.map(rowStr => rowStr.split(" "));
        // Convert elements to numbers if 'returnRaw' is false.
        return returnRaw ? parsedMatrix : parsedMatrix.map(row => row.map(item => Number(item)));
    };

    /* Prototype method to read a block of 'numLines' as a 1D array. */
    DataParser.prototype.readLinesAsList = function(numLines, returnRaw) {
        var blockStart = this._currentLinePointer;
        var blockEnd = this._currentLinePointer += numLines;
        var lineBlock = this._processedLines.slice(blockStart, blockEnd);
        // Return raw strings or an array of numbers.
        return returnRaw ? lineBlock : lineBlock.map(val => Number(val));
    };

    // The factory function is returned.
    return createInputReader;
})();

/* Initialize the input source by reading from standard input. */
var inputDataSource = INPUT_PROCESSOR_BUILDER(require("fs").readFileSync("/dev/stdin", "utf8"));

/* Function to construct a multi-dimensional array dynamically. */
function constructNestedArray(baseValue) {
    var sizeArguments = arguments;
    var argLength = sizeArguments.length;
    var arrayCreationString = "Array(sizeArguments[" + --argLength + "]).fill(null).map(item => {return " + baseValue + ";})";

    while (--argLength) {
        arrayCreationString = "Array(sizeArguments[" + argLength + "]).fill(null).map(item => " + arrayCreationString + ")";
    }

    // Evaluate the generated string to create the array.
    return eval(arrayCreationString);
}

/* Main program execution routine. */
console.log(mainProgram());

function mainProgram() {
    // Read the number of vertices/nodes.
    var totalNodes = inputDataSource.extractScalar();
    // Placeholder array, not explicitly used in original logic.
    var placeholderArray = constructNestedArray(1, totalNodes);
    // Adjacency list representation of the graph.
    var graphAdjacencyList = constructNestedArray("[]", totalNodes);

    // Populate the adjacency list based on input edges.
    for (var edgeIndex = 1; edgeIndex < totalNodes; edgeIndex++) {
        // Read an edge pair and adjust to 0-based indexing.
        var connectionPair = inputDataSource.getLineValues().map(val => val - 1);
        // Add connections to the adjacency list.
        graphAdjacencyList[connectionPair[0]].push(connectionPair[1]);
        graphAdjacencyList[connectionPair[1]].push(connectionPair[0]);
    }

    // Determine the winner based on the tree diameter.
    return calculateGraphDiameter(graphAdjacencyList) % 3 === 1 ? "SecondPlayer" : "FirstPlayer";
}

/* Function to compute the diameter of a tree using two BFS traversals. */
function calculateGraphDiameter(adjacencyRepresentation) {
    var farthestNode = 0;
    var currentMaxDistance;

    // Perform BFS twice to find the diameter.
    for (var bfsIteration = 0; bfsIteration < 2; bfsIteration++) {
        currentMaxDistance = 0;
        // Queue for current level nodes: [node, parent_node]
        var primaryQueue = [[farthestNode, -1]];
        // Queue for next level nodes.
        var secondaryQueue = [];

        // Continue BFS as long as there are nodes in either queue.
        while (primaryQueue.length > 0 || secondaryQueue.length > 0) {
            // If primary queue is empty, move to the next level.
            if (primaryQueue.length === 0) {
                currentMaxDistance++;
                primaryQueue = secondaryQueue; // Promote secondary queue to primary.
                secondaryQueue = []; // Clear secondary queue for next level.
                farthestNode = primaryQueue[0][0]; // Update farthest node for next BFS starting point.
            }

            // Pop a node from the current level.
            var nodeAndParent = primaryQueue.pop();
            var currentNodeId = nodeAndParent[0];
            var parentNodeId = nodeAndParent[1];

            // Iterate through neighbors of the current node.
            for (var neighborIdx = 0; neighborIdx < adjacencyRepresentation[currentNodeId].length; neighborIdx++) {
                // Skip if the neighbor is the parent (avoid going back).
                if (parentNodeId === adjacencyRepresentation[currentNodeId][neighborIdx]) {
                    continue;
                }
                // Add neighbor to the next level queue.
                secondaryQueue.push([adjacencyRepresentation[currentNodeId][neighborIdx], currentNodeId]);
            }
        }
    }
    // The final 'currentMaxDistance' holds the diameter.
    return currentMaxDistance;
}