// Problem solution for a graph construction task
// Implemented on 2020/05/03
'use strict'; // Enforce strict JavaScript parsing rules

// Helper function to safely deconstruct arrays or iterables.
// Tries different methods based on the input type.
function _extractArrayElements(sourceCollection, maxElements) {
    return _checkArrayExistence(sourceCollection)
        || _limitIterableExtraction(sourceCollection, maxElements)
        || _convertNonStandardIterable(sourceCollection, maxElements)
        || _throwNoIterableRemainder();
}

// Throws an exception when an object cannot be iterated or destructured.
function _throwNoIterableRemainder() {
    throw new TypeError("Invalid attempt to deconstruct a non-iterable instance. "
        + "Objects must provide a [Symbol.iterator]() method to be iterable.");
}

// Converts various non-standard iterable objects into an array-like structure.
function _convertNonStandardIterable(inputObject, minimumLength) {
    if (!inputObject) return; // If the object is null or undefined, return early.
    if (typeof inputObject === "string") return _adaptToArrayLike(inputObject, minimumLength); // Strings are array-like.

    var objectTypeName = Object.prototype.toString.call(inputObject).slice(8, -1); // Get internal type.
    if (objectTypeName === "Object" && inputObject.constructor) {
        objectTypeName = inputObject.constructor.name; // Use constructor name if available.
    }

    if (objectTypeName === "Map" || objectTypeName === "Set") {
        return Array.from(inputObject); // Convert Maps/Sets directly.
    }

    // Handle typed arrays and Arguments object.
    if (objectTypeName === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(objectTypeName)) {
        return _adaptToArrayLike(inputObject, minimumLength);
    }
}

// Transforms an array-like object into a proper array up to a specified length.
function _adaptToArrayLike(originalList, lengthLimit) {
    // If no limit or limit exceeds list length, use full length.
    if (lengthLimit == null || lengthLimit > originalList.length) {
        lengthLimit = originalList.length;
    }
    // Create a new array and copy elements.
    for (var currentIdx = 0, resultantArray = new Array(lengthLimit); currentIdx < lengthLimit; currentIdx++) {
        resultantArray[currentIdx] = originalList[currentIdx];
    }
    return resultantArray;
}

// Extracts a limited number of elements from an iterable object.
function _limitIterableExtraction(listObject, elementCount) {
    // Check if the object is actually iterable.
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(listObject))) return;

    var collectedElements = [];
    var isIterating = true;
    var hadThrownError = false;
    var caughtException = undefined;

    try {
        // Iterate through the object's elements.
        for (var currentIterator = listObject[Symbol.iterator](), iterationStep;
             !(isIterating = (iterationStep = currentIterator.next()).done);
             isIterating = true) {
            collectedElements.push(iterationStep.value);
            // Stop if the desired element count is reached.
            if (elementCount && collectedElements.length === elementCount) break;
        }
    } catch (exception) {
        hadThrownError = true;
        caughtException = exception;
    } finally {
        // Ensure the iterator is closed if it's not done.
        try {
            if (!isIterating && currentIterator["return"] != null) {
                currentIterator["return"]();
            }
        } finally {
            // Re-throw any caught exception after cleanup.
            if (hadThrownError) throw caughtException;
        }
    }
    return collectedElements;
}

// Checks if the given input is already an array.
function _checkArrayExistence(potentialArray) {
    if (Array.isArray(potentialArray)) return potentialArray;
}


/**
 * Processes input lines to determine graph structure and print results.
 * @param {Array<string>} inputContent - An array of strings, where each string is a line of input.
 */
function processGraphData(inputContent) {
    // Parse the first line to get node count and target edge count.
    var _initialInputParts = inputContent[0].split(' ').map(Number);
    var _extractedValues = _extractArrayElements(_initialInputParts, 2);
    var totalNodes = _extractedValues[0]; // Total number of nodes in the graph.
    var desiredEdges = _extractedValues[1]; // The target number of edges.

    // Initialize variables for the search.
    var currentSetSize = totalNodes; // M corresponds to the number of nodes in a specific clique.
    var foundSolution; // Flag to indicate if a valid M is found.

    // Iterate downwards from totalNodes to find a suitable 'currentSetSize'.
    for (; currentSetSize >= 0; currentSetSize--) {
        var calcValue = totalNodes - currentSetSize + 2; // Calculate a temporary value related to the number of extra nodes.

        // Check if the current 'currentSetSize' satisfies the edge count condition.
        // This formula represents (nodes_in_clique - 1) * (nodes_in_clique - 2) / 2 + (total_nodes - nodes_in_clique) - 2
        // which simplifies to the count of edges in a (L-1)-clique plus edges from a central node to remaining (M-2) nodes.
        if ((calcValue - 1) * (calcValue - 2) / 2 + currentSetSize - 2 === desiredEdges) {
            foundSolution = true; // A valid configuration is found.
            break; // Exit the loop as we found the largest valid currentSetSize.
        }
    }

    // If no valid configuration is found, print -1 and exit.
    if (!foundSolution) {
        console.log(-1);
        return;
    }

    // Output the total number of edges in the resulting graph.
    console.log(totalNodes - 1);

    // Print edges for the first part of the graph (a path/line graph).
    for (var nodeA = 1; nodeA < currentSetSize; nodeA++) {
        console.log(`${nodeA} ${nodeA + 1}`);
    }

    // Print edges connecting the first node to the remaining 'extra' nodes.
    for (var nodeB = currentSetSize + 1; nodeB <= totalNodes; nodeB++) {
        console.log(`${1} ${nodeB}`);
    }
}


/**
 * Sets up the standard input stream to read data and then processes it.
 */
function initiateInputProcessing() {
    var receivedDataBuffer = ""; // Buffer to accumulate incoming data.
    process.stdin.resume(); // Ensure the standard input stream stays open.
    process.stdin.setEncoding("utf8"); // Set encoding for incoming data.

    // Event listener for data chunks.
    process.stdin.on("data", function (dataChunk) {
        receivedDataBuffer += dataChunk; // Append chunk to buffer.
    });

    // Event listener for end of input.
    process.stdin.on("end", function () {
        // Split buffered data by newline and pass to the main processing function.
        processGraphData(receivedDataBuffer.split("\n"));
    });
}

// Start the input processing flow.
initiateInputProcessing();