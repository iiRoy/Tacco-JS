// This section contains auxiliary functions and setup for input/output processing.
var inputUtility = require('readline').createInterface({
    inputStream: process.stdin,
    outputStream: process.stdout
});
var dataStore;
var receivedLines = [];
inputUtility.listenFor('line', function(currentLine) {
    receivedLines.push(currentLine);
});
inputUtility.listenFor('close', function() {
    dataStore = initializeDataReader(receivedLines);
    console.error("\n");
    var startTime = new Date();
    ExecutePrincipalLogic();
    var elapsedTime = new Date() - startTime;

    reportMetric("duration : " + (elapsedTime) + "ms");
    reportMetric("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

// Creates a completely new independent copy of an object.
function createDeepCopy(objectToCopy) {
    return JSON.parse(JSON.stringify(objectToCopy));
}

// Fetches the next input item and converts it to an integer.
function retrieveNextInteger() {
    return convertInputFormat(fetchNextItem(), 1);
}

// Fetches the next input item and converts it to an array of strings.
function retrieveNextStringArray() {
    return convertInputFormat(fetchNextItem(), 2);
}

// Fetches the next input item and converts it to an array of integers.
function retrieveNextIntegerArray() {
    return convertInputFormat(fetchNextItem(), 4);
}

// Fetches the next input item and converts it to an array of characters.
function retrieveNextCharacterArray() {
    return convertInputFormat(fetchNextItem(), 6);
}

// Retrieves the subsequent data element from the reader.
function fetchNextItem() {
    return dataStore.fetchNext();
}

// Checks if there are more data elements to read.
function hasMoreItems() {
    return dataStore.hasRemaining();
}

// Sets up the data reader object.
function initializeDataReader(sourceInput) {
    var readerObject = {
        dataLines: sourceInput,
        currentIndex: 0,
        maximumItems: sourceInput.length,
        // Checks if there are unread lines.
        hasRemaining: function() {
            return (this.currentIndex < this.maximumItems);
        },
        // Retrieves the next line and advances the pointer.
        fetchNext: function() {
            if (!this.hasRemaining()) {
                throw "InputOutOfBoundsException: No more data available";
            } else {
                var extractedData = this.dataLines[this.currentIndex];
                this.currentIndex++;
                return extractedData;
            }
        }
    };
    return readerObject;
}

// Outputs the given string to the standard console.
function displayResult(outputString) {
    console.log(outputString);
}

// Logs debug information to the error stream.
function reportMetric(debugInfo) {
    console.error("debug output: " + require("util").inspect(debugInfo, false, null));
}

// Utility for converting input values based on a specified type.
// 1: To integer; 2: Split by space (string array); 4: Split by space (integer array);
// 6: Split by character (char array); 7: Split by character (integer array);
// 8: Join by space; 9: Join by newline; 0: Join without separator.
function convertInputFormat(inputValue, conversionType) {
    try {
        switch (conversionType) {
            case 1:
                return Number.parseInt(inputValue);
            case 2:
                return inputValue.split(" ");
            case 4:
                return inputValue.split(" ").map(Number);
            case 6:
                return inputValue.split("");
            case 7:
                return inputValue.split("").map(Number);
            case 8:
                return inputValue.join(" ");
            case 9:
                return inputValue.join("\n");
            case 0:
                return inputValue.join("");
            default:
                return inputValue;
        }
    } catch (errorInstance) {
        return inputValue; // Return original if conversion fails
    }
}

// End of helper functions ----------------------------------------------------
function ExecutePrincipalLogic() {
    var nodeCount = retrieveNextInteger();
    var adjacencyList = new Array(nodeCount); // Represents the graph structure
    var edgeProperties = {}; // Stores properties for each edge

    // Initialize each node in the adjacency list
    for (var nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
        adjacencyList[nodeIdx] = {
            connectedNodes: []
        };
    }

    var maxColorValue = 0; // Tracks the maximum color used on any edge

    // Read edge connections and populate the graph
    for (var edgeIdx = 0; edgeIdx < nodeCount - 1; edgeIdx++) {
        var edgeInput = retrieveNextIntegerArray();
        var firstNodeIndex = edgeInput[0] - 1;
        var secondNodeIndex = edgeInput[1] - 1;

        // Add bidirectional connections
        adjacencyList[firstNodeIndex].connectedNodes.push(secondNodeIndex);
        adjacencyList[secondNodeIndex].connectedNodes.push(firstNodeIndex);

        // Store edge metadata, initially with no color
        edgeProperties[firstNodeIndex + ":" + secondNodeIndex] = {
            originalIndex: edgeIdx,
            assignedColor: null
        };
    }

    // Perform a Breadth-First Search (BFS) to color the edges
    var traversalQueue = [
        [0, 0]
    ]; // [current_node, color_of_parent_edge]

    while (traversalQueue.length > 0) {
        var currentQueueItem = traversalQueue.shift();
        var currentNode = currentQueueItem[0];
        var parentEdgeColor = currentQueueItem[1];
        var neighbors = adjacencyList[currentNode].connectedNodes;
        var currentEdgeColor = 1; // Start coloring from 1

        // Iterate through all neighbors of the current node
        for (var neighborIdx = 0; neighborIdx < neighbors.length; neighborIdx++) {
            var neighborNode = neighbors[neighborIdx];
            var smallerIndex;
            var largerIndex;

            // Determine the canonical representation for the edge key (e.g., "1:2" not "2:1")
            if (currentNode > neighborNode) {
                smallerIndex = neighborNode;
                largerIndex = currentNode;
            } else {
                smallerIndex = currentNode;
                largerIndex = neighborNode;
            }

            // If this edge has not been colored yet
            if (edgeProperties[smallerIndex + ":" + largerIndex].assignedColor == null) {
                // Ensure the current edge color is different from the parent edge's color
                if (currentEdgeColor == parentEdgeColor) {
                    currentEdgeColor++;
                }

                // Assign the color to the edge
                edgeProperties[smallerIndex + ":" + largerIndex].assignedColor = currentEdgeColor;
                // Add the neighbor to the queue for further traversal
                traversalQueue.push([neighborNode, currentEdgeColor]);
                // Update the maximum color used so far
                maxColorValue = Math.max(currentEdgeColor, maxColorValue);
                currentEdgeColor++; // Increment color for the next edge from this node
            }
        }
    }

    displayResult(maxColorValue); // Output the maximum color used

    var finalColors = new Array(nodeCount - 1); // Array to store final edge colors in original order
    var sortedEdgeData = new Array(nodeCount - 1); // Temporary array for sorting edges
    var edgeKeys = Object.keys(edgeProperties);

    // Populate the temporary array with edge data
    for (var keyIndex = 0; keyIndex < edgeKeys.length; keyIndex++) {
        sortedEdgeData[keyIndex] = edgeProperties[edgeKeys[keyIndex]];
    }

    // Sort the edge data by their original input order
    sortedEdgeData.sort(function(itemA, itemB) {
        return itemA.originalIndex - itemB.originalIndex;
    });

    // Extract the assigned colors into the final output array
    for (var resultIdx = 0; resultIdx < nodeCount - 1; resultIdx++) {
        finalColors[resultIdx] = sortedEdgeData[resultIdx].assignedColor;
    }

    // Display the final edge colors, joined by newlines
    displayResult(convertInputFormat(finalColors, 9));
}