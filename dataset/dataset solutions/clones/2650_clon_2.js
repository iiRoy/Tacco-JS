/*
 * Module for parsing input data from a multi-line string.
 * This module provides a factory function to create an input reader
 * that can extract various data formats from the provided text.
 */
var DATA_PARSER = (function() {
    // This function serves as the public interface, creating and returning
    // a new instance of the InputReader.
    function createParser(sourceString) {
        return new InputReader(sourceString);
    }

    // The InputReader class manages the input string and its current parsing position.
    function InputReader(sourceString) {
        // Internal array holding each line of the source string.
        // It's trimmed to remove leading/trailing whitespace and then split by newline characters.
        this._sourceLines = sourceString.trim().split("\n");
        // Tracks the index of the current line being processed.
        this._currentLineIndex = 0;
    }

    // Prototype method to extract a single numeric or string value from the current line.
    // Values are typically read from right-to-left on a line, effectively acting like a stack.
    InputReader.prototype.extractNextValue = function(returnAsString) {
        var linesArray = this._sourceLines,
            lineIdx = this._currentLineIndex,
            extractedToken; // Variable to hold the token popped from the line.

        // If the current line is still a single string, it needs to be split into tokens.
        // The tokens are then reversed so that `pop()` retrieves them in their original order.
        if (typeof linesArray[lineIdx] === "string") {
            linesArray[lineIdx] = linesArray[lineIdx].split(" ").reverse();
        }

        // Retrieve the next token from the end of the (reversed) line array.
        extractedToken = linesArray[lineIdx].pop();

        // If the current line is now empty after popping, advance to the next line.
        if (!linesArray[lineIdx].length) {
            this._currentLineIndex++;
        }

        // Return the token either as its original string representation or
        // parsed into a number using the unary plus operator.
        return returnAsString ? extractedToken : +extractedToken;
    };

    // Prototype method to extract all tokens from the current line as an array.
    // This method automatically advances the current line index to the next line.
    InputReader.prototype.extractLineTokens = function(returnAsStrings) {
        // Split the current line into an array of tokens and then advance the line index.
        var lineTokens = this._sourceLines[this._currentLineIndex++].split(" ");
        // If `returnAsStrings` is true, return the string tokens. Otherwise, map them to numbers.
        return returnAsStrings ? lineTokens : lineTokens.map(tokenStr => +tokenStr);
    };

    // Prototype method to extract a specified number of lines, treating each line
    // as a row in a matrix, and splitting each row into individual values.
    InputReader.prototype.extractMatrix = function(numRows, returnStrings) {
        // Slice the `_sourceLines` array to get the relevant rows, and advance `_currentLineIndex`.
        // Then, map each row string to an array of its split tokens.
        var matrixData = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows)
                                        .map(rowStr => rowStr.split(" "));
        // If `returnStrings` is true, return the matrix of string tokens.
        // Otherwise, map all inner tokens to numbers.
        return returnStrings ? matrixData : matrixData.map(rowArr => rowArr.map(valStr => +valStr));
    };

    // Prototype method to extract a specified number of lines directly as an array of values.
    // Each line is considered a single value.
    InputReader.prototype.extractRows = function(rowCount, keepStrings) {
        // Slice the `_sourceLines` array to get the specified number of rows.
        // The `_currentLineIndex` is updated accordingly.
        var rowStrings = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += rowCount);
        // If `keepStrings` is true, return the array of line strings.
        // Otherwise, map each line string to a number.
        return keepStrings ? rowStrings : rowStrings.map(lineVal => +lineVal);
    };

    // The factory function `createParser` is returned, making it the public interface of the module.
    return createParser;
})();

// Initialize the input processor by reading data from standard input.
// The 'fs' module is used to read the file synchronously.
var inputProcessor = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically creates a multi-dimensional array initialized with a specific value.
 * The dimensions are provided as arguments after the initial value.
 * For example, `initializeMultiDimensionalArray(0, 2, 3)` creates a 2x3 array of zeros.
 * @param {*} initialValue - The value to fill the innermost arrays with.
 * @param {...number} dimensions - The sizes of each dimension of the array.
 * @returns {Array} The initialized multi-dimensional array.
 */
function initializeMultiDimensionalArray(initialValue) {
    var argsList = arguments, // Access all arguments, including the initial value and dimensions.
        lengthCounter = argsList.length, // Total number of arguments.
        // Start building the array creation string from the innermost dimension.
        // Decrement `lengthCounter` to point to the last dimension argument.
        arrayCreationString = "Array(argsList[" + --lengthCounter + "]).fill(0).map(element => { return " + initialValue + "; })";
    // Iterate backwards through the remaining dimensions to build nested array creations.
    while (--lengthCounter) {
        arrayCreationString = "Array(argsList[" + lengthCounter + "]).fill(0).map(element => " + arrayCreationString + ")";
    }
    // Use `eval` to execute the dynamically constructed string and create the array.
    return eval(arrayCreationString);
}

/*
 * Implements a Min-Priority Queue using a binary heap data structure.
 * Elements stored in this heap are expected to be arrays, where the first element
 * (`element[0]`) serves as the priority key. This heap ensures that the element
 * with the smallest priority key is always at the root.
 */
var MinBinaryHeap = (function() {
    // Factory method to create and return a new instance of the MinHeapStructure.
    function createMinHeap() {
        return new MinHeapStructure();
    }

    // Constructor for the MinHeapStructure.
    function MinHeapStructure() {
        this._internalHeap = []; // The underlying array that stores the heap elements.
    }

    // Inserts a new element into the heap while maintaining the min-heap property.
    MinHeapStructure.prototype.insertElement = function(newItem) {
        var currentHeap = this._internalHeap,
            currentIndex = currentHeap.length++, // Get current length, then increment for new item.
            parentIndex; // Variable to store the parent's index during bubbling up.

        // Perform a "bubble up" operation to place the `newItem` in its correct position.
        while (currentIndex) {
            parentIndex = (currentIndex - 1) >> 1; // Calculate the parent's index.
            // If the parent's priority is less than or equal to the new item's priority,
            // the heap property is satisfied, so break the loop.
            if (currentHeap[parentIndex][0] <= newItem[0]) {
                break;
            }
            // Otherwise, move the parent element down to the current position.
            currentHeap[currentIndex] = currentHeap[parentIndex];
            currentIndex = parentIndex; // Move `currentIndex` up to the parent's position.
        }
        // Place the `newItem` at its final sorted position.
        currentHeap[currentIndex] = newItem;
    };

    // Removes and returns the element with the minimum priority (which is always the root).
    MinHeapStructure.prototype.removeMin = function() {
        var currentHeap = this._internalHeap,
            minElement = currentHeap[0], // The element with the minimum priority (to be returned).
            lastElement = currentHeap.pop(), // The last element in the heap, which will be re-positioned.
            heapSize = currentHeap.length, // Current size of the heap after popping the last element.
            currentIndex = 0, // Start bubbling down from the root.
            childIndex; // Variable to store the child's index during bubbling down.

        // If the heap is now empty after popping, `minElement` (which was `undefined` if heap was empty)
        // or the single element if `heapSize` was 1 before `pop()` is returned.
        if (heapSize === 0) {
            return minElement;
        }

        var halfSize = heapSize >> 1; // Optimization: Only need to check up to the last non-leaf node.
        heapSize--; // Adjust heapSize to reflect the actual number of elements for child index checks.

        // Perform a "bubble down" operation for the `lastElement`.
        while (currentIndex < halfSize) {
            childIndex = (currentIndex << 1) + 1; // Calculate the left child's index.

            // Check if a right child exists and has a higher priority (smaller value).
            if (childIndex < heapSize && currentHeap[childIndex + 1][0] < currentHeap[childIndex][0]) {
                childIndex++; // If so, use the right child for comparison.
            }

            // If the `lastElement`'s priority is less than or equal to its smallest child's priority,
            // the heap property is satisfied at this position, so break.
            if (lastElement[0] <= currentHeap[childIndex][0]) {
                break;
            }

            // Otherwise, move the child element up to the current position.
            currentHeap[currentIndex] = currentHeap[childIndex];
            currentIndex = childIndex; // Move `currentIndex` down to the child's position.
        }
        // Place the `lastElement` at its final sorted position.
        currentHeap[currentIndex] = lastElement;
        return minElement; // Return the original minimum element.
    };

    // The factory function `createMinHeap` is returned, making it the public interface of the module.
    return createMinHeap;
})();

// Output the final result of the main calculation function to the console.
console.log(performCalculation());

/**
 * Main function to perform the core logic of the problem.
 * This function reads input values, processes them using a priority queue,
 * and calculates a final result based on specific conditions.
 * @returns {number} The calculated result, or -1 if an impossible state is detected.
 */
function performCalculation() {
    // Read the total number of items from the input.
    var totalItems = inputProcessor.extractNextValue();
    // Read the array of initial values for each item.
    var initialValues = inputProcessor.extractLineTokens();
    // Read the array of target values for each item.
    var targetValues = inputProcessor.extractLineTokens();

    // Create a new min-priority queue instance.
    var itemQueue = MinBinaryHeap();

    // Iterate through each item to initialize the priority queue.
    for (var loopIndex = 0; loopIndex < totalItems; loopIndex++) {
        // If the initial value is already equal to the target value, no operations needed for this item.
        if (initialValues[loopIndex] === targetValues[loopIndex]) {
            continue;
        }
        // If the initial value is greater than the target value, it's an impossible scenario.
        if (initialValues[loopIndex] > targetValues[loopIndex]) {
            return -1;
        }
        // For items that need adjustment, add them to the priority queue.
        // The priority is set to the negative of the target value, so a min-heap
        // effectively acts as a max-priority queue (items with higher target values processed first).
        itemQueue.insertElement([-targetValues[loopIndex], loopIndex]);
    }

    var finalResult = 0; // Accumulator for the total number of operations.

    // Process items from the priority queue until it is empty.
    while (itemQueue._internalHeap.length) {
        var poppedItem = itemQueue.removeMin(); // Get the item with the highest priority (largest negative target).
        var itemIndex = poppedItem[1]; // Extract the original index of the item.

        // Calculate the sum of the target values of the current item's neighbors.
        // Uses modulo arithmetic for circular indexing.
        var sumNeighbors = targetValues[(itemIndex + totalItems - 1) % totalItems] + targetValues[(itemIndex + 1) % totalItems];
        // Calculate how many times the current item needs to be adjusted.
        // This is the floor division of the difference between target and initial by the sum of neighbors.
        var divisorCount = (targetValues[itemIndex] - initialValues[itemIndex]) / sumNeighbors | 0;

        // If `divisorCount` is 0, it means `targetValues[itemIndex] - initialValues[itemIndex]`
        // is positive but less than `sumNeighbors`. In this case, it's impossible to reach
        // `initialValues[itemIndex]` by only subtracting multiples of `sumNeighbors`.
        if (divisorCount === 0) {
            return -1;
        }

        finalResult += divisorCount; // Add the number of operations to the total.
        // Update the current item's target value by subtracting `sumNeighbors` multiplied by `divisorCount`.
        targetValues[itemIndex] -= sumNeighbors * divisorCount;

        // After adjustment, if the item's target value now matches its initial value, it's done.
        if (initialValues[itemIndex] === targetValues[itemIndex]) {
            continue;
        }
        // If the target value has gone below the initial value, it's an impossible scenario.
        if (initialValues[itemIndex] > targetValues[itemIndex]) {
            return -1;
        }
        // If the item still needs further adjustment, re-add it to the priority queue with its updated (negative) target value.
        itemQueue.insertElement([-targetValues[itemIndex], itemIndex]);
    }
    return finalResult; // Return the total calculated number of operations.
}