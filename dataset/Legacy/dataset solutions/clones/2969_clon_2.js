var DATA_PARSER = (function() {
    // This factory function creates an instance of the InputHandler.
    function createParser(inputString) {
        return new InputHandler(inputString);
    }

    // The InputHandler class is responsible for parsing various types of input data.
    function InputHandler(inputString) {
        // Stores the input string, trimmed of leading/trailing whitespace, and split into individual lines.
        this._sourceLines = inputString.trim().split("\n");
        // Keeps track of the current line index being processed from the input.
        this._currentLineIndex = 0;
    }

    // Prototype method to read a single value from the current line.
    // It handles space-separated values on a line, processing them from right to left (due to reverse()).
    // The 'asString' parameter determines if the returned value should be a string or a number.
    InputHandler.prototype.readNextValue = function(asString) {
        var currentSourceLines = this._sourceLines;
        var lineIdx = this._currentLineIndex;
        var parsedResult;

        // If the current line hasn't been tokenized into an array of values yet, do so.
        // It splits the line by spaces and reverses the array to allow efficient popping from the end.
        if (typeof currentSourceLines[lineIdx] === "string") {
            currentSourceLines[lineIdx] = currentSourceLines[lineIdx].split(" ").reverse();
        }

        // Extracts the next value from the current line.
        parsedResult = currentSourceLines[lineIdx].pop();

        // If the current line is now empty after popping, advance to the next line.
        if (!currentSourceLines[lineIdx].length) {
            this._currentLineIndex++;
        }

        // Returns the result, either as a string or converted to a number using the unary plus operator.
        return asString ? parsedResult : +parsedResult;
    };

    // Prototype method to read all values from the current line.
    // It advances the line index after reading.
    // The 'asString' parameter determines if the returned values should be strings or numbers.
    InputHandler.prototype.readLineValues = function(asString) {
        var currentLineContent = this._sourceLines[this._currentLineIndex++];
        var splitValues = currentLineContent.split(" ");
        // Maps all values to numbers if 'asString' is false.
        return asString ? splitValues : splitValues.map(item => +item);
    };

    // Prototype method to read a block of 'numLines' lines, treating each as a row in a matrix.
    // Each row is split into values.
    // The 'asString' parameter determines if the returned values should be strings or numbers.
    InputHandler.prototype.readMatrix = function(numLines, asString) {
        // Slices the source lines to get the relevant rows and then maps them.
        var matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines)
                                          .map(item => item.split(" "));
        // If not 'asString', maps each row's elements to numbers.
        return asString ? matrixRows : matrixRows.map(row => row.map(item => +item));
    };

    // Prototype method to read a block of 'numLines' lines, where each line contains a single value.
    // The 'asString' parameter determines if the returned values should be strings or numbers.
    InputHandler.prototype.readRows = function(numLines, asString) {
        // Slices the source lines to get the relevant rows.
        var rowData = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
        // If not 'asString', maps each item to a number.
        return asString ? rowData : rowData.map(item => +item);
    };

    return createParser;
})();

// Initializes the input reader by reading the entire content of standard input.
var inputReader = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * The dimensions for the array are provided as subsequent arguments.
 * For example, createMultiDimArray(0, 2, 3) would create a 2x3 array filled with zeros.
 *
 * @param {*} initialValue The value to be used for initializing all elements of the array.
 * @param {...number} dimensions The sizes of each dimension of the array, from outermost to innermost.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    var dimensions = arguments; // Access all arguments passed to the function.
    var dimCount = dimensions.length; // Get the total number of dimensions.
    // Start building the string representation for the innermost array.
    // It creates an array of the last dimension's size, fills it, and maps to the initial value.
    var arrayCreationString = "Array(dimensions[" + --dimCount + "]).fill(0).map(x => { return " + initialValue + "; })";

    // Loop to construct the string for the outer dimensions.
    // Each iteration wraps the previously constructed string in a new Array.map call.
    while (--dimCount) {
        arrayCreationString = "Array(dimensions[" + dimCount + "]).fill(0).map(x => " + arrayCreationString + ")";
    }

    // Evaluate the dynamically constructed string to create the actual multi-dimensional array.
    return eval(arrayCreationString);
}

// Executes the main problem-solving function and prints its result to the console.
console.log(solveProblem());

/**
 * This is the primary function that encapsulates the problem's logic.
 * It reads two integer inputs, 'numBits' and 'targetValue', and generates a specific sequence.
 * The sequence is designed to represent a path in a hypercube graph, with special handling for 'targetValue'.
 *
 * @returns {string} A space-separated string representing the generated sequence, or -1 for invalid inputs.
 */
function solveProblem() {
    // Reads the first integer input, representing the number of bits (m).
    var numBits = inputReader.readNextValue();
    // Reads the second integer input, representing the target value (k).
    var targetValue = inputReader.readNextValue();

    // Condition 1: If the target value is too large to be represented by 'numBits'.
    // (1 << numBits) calculates 2^numBits.
    if (targetValue >= (1 << numBits)) {
        return -1;
    }

    // Condition 2: Special case for m=1. If k is non-zero and m is 1, it's an invalid scenario.
    // For m=1, possible values are 0 and 1. If k=1, the problem's specific constraints lead to -1.
    if (targetValue && numBits === 1) {
        return -1;
    }

    // Condition 3: If the target value is 0, delegate to a specific handler function.
    if (targetValue === 0) {
        return handleZeroTarget(numBits);
    }

    var resultSequence = []; // Array to store the generated sequence.
    // Calculate the total number of unique elements in the sequence (2^numBits).
    var totalElements = 1 << numBits;

    // First loop: Generates numbers from 0 up to (totalElements - 1), skipping 'targetValue'.
    // 'loopCounter' tracks iterations, 'currentNumber' tracks the value to be added.
    for (var loopCounter = 0, currentNumber = 0; loopCounter < totalElements - 1; loopCounter++, currentNumber++) {
        // If 'currentNumber' matches 'targetValue', increment 'currentNumber' to skip it.
        if (currentNumber === targetValue) {
            currentNumber++;
        }
        resultSequence.push(currentNumber); // Add the current number to the sequence.
    }
    resultSequence.push(targetValue); // Add the 'targetValue' at the end of the first half.

    // Second loop: Generates numbers in decreasing order, again skipping 'targetValue'.
    // 'currentNumber' retains its value from the end of the previous loop.
    for (var loopCounter = 0; loopCounter < totalElements - 1; loopCounter++) {
        currentNumber--; // Decrement 'currentNumber'.
        // If 'currentNumber' matches 'targetValue', decrement it again to skip.
        if (currentNumber === targetValue) {
            currentNumber--;
        }
        resultSequence.push(currentNumber); // Add the current number to the sequence.
    }
    resultSequence.push(targetValue); // Add 'targetValue' again to complete the sequence.

    // Joins all elements of the 'resultSequence' array into a single string, separated by spaces.
    return resultSequence.join(" ");
}

/**
 * This function handles the specific case where the target value (k) is 0.
 * It generates a sequence where each number from 0 to (2^bitCount - 1) appears exactly twice.
 * The sequence effectively looks like: 0 0 1 1 2 2 ... (2^bitCount - 1) (2^bitCount - 1).
 *
 * @param {number} bitCount The number of bits (m) for the problem.
 * @returns {string} A space-separated string representing the generated sequence.
 */
function handleZeroTarget(bitCount) {
    // The total length of the sequence will be 2 * (2^bitCount), which is 2^(bitCount + 1).
    var sequenceLength = 1 << (bitCount + 1);
    var outputArray = []; // Array to store the generated sequence.

    // Populates the 'outputArray'. The expression 'index >> 1' performs an integer division by 2.
    // This means:
    // index 0, 1 both map to 0.
    // index 2, 3 both map to 1.
    // ...and so on, effectively placing each number twice.
    for (var index = 0; index < sequenceLength; index++) {
        outputArray[index] = index >> 1;
    }

    // Joins all elements of the 'outputArray' into a single string, separated by spaces.
    return outputArray.join(" ");
}
