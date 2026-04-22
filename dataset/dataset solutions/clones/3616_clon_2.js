"use strict"; /* This directive enforces strict mode in JavaScript, ensuring cleaner code and catching common errors. */

function ExecuteProgram(dataSource) {
    // Instantiate a utility object to handle input parsing.
    let reader = new ValueReader(dataSource);

    // Retrieve the three main numerical parameters from the input stream.
    let numPoints = reader.readInteger(),
        numConnections = reader.readInteger(),
        numQueries = reader.readInteger();

    // Initialize a two-dimensional array (matrix) for storing aggregated data.
    // Its dimensions are slightly larger than 'numPoints' to accommodate 1-based indexing.
    let dataMatrix = (new Array(numPoints + 1)).fill(0).map(
        () => (new Array(numPoints + 1)).fill(0)
    );

    // Process each connection entry to update the data matrix.
    // Each connection represents a pair (left, right) which increments a specific cell.
    for (let connIdx = 0; connIdx < numConnections; connIdx++) {
        let leftBound = reader.readInteger();
        let rightBound = reader.readInteger();
        dataMatrix[leftBound][rightBound] = dataMatrix[leftBound][rightBound] + 1; // Increment the count.
    }

    // Compute the 2D prefix sums across the data matrix.
    // This pre-computation allows for constant-time range sum queries later.
    for (let rowIdx = 1; rowIdx <= numPoints; rowIdx++) {
        for (let colIdx = 1; colIdx <= numPoints; colIdx++) {
            dataMatrix[rowIdx][colIdx] += (
                dataMatrix[rowIdx - 1][colIdx] +
                dataMatrix[rowIdx][colIdx - 1] -
                dataMatrix[rowIdx - 1][colIdx - 1]
            );
        }
    }

    // Iterate through each query and output its calculated result.
    for (let queryIdx = 0; queryIdx < numQueries; queryIdx++) {
        let startVal = reader.readInteger();
        let endVal = reader.readInteger();
        // Calculate the sum for the query range using the prefix sums.
        // The formula applies the principle of inclusion-exclusion.
        console.log(dataMatrix[endVal][endVal] - dataMatrix[startVal - 1][endVal]);
    }
}


// A utility class designed to parse and extract various data types from a provided string input.
class ValueReader {
    // The constructor initializes the reader with the raw input string.
    constructor (sourceData) {
        this.currentIndex = 0; // Keeps track of the current token's index.
        // Tokenize the input string by splitting on newline or space characters.
        this.parsedTokens = sourceData.split(/\n|\s/);
    }

    // Extracts and returns the next integer from the tokenized input.
    readInteger() {
        return parseInt(this.parsedTokens[this.currentIndex++], 10); // Explicitly parse as base-10 integer.
    }

    // Retrieves an array of 'arrayLength' integer values.
    // Note: This method calls a globally scoped 'readInteger()' function,
    // mirroring the original code's behavior which might imply a global definition
    // or a potential ReferenceError if not defined.
    readIntegerArray(arrayLength) {
        let temporaryStorage = new Array(arrayLength);
        for (let arrayIndex = 0; arrayIndex < arrayLength; arrayIndex++) {
            temporaryStorage[arrayIndex] = readInteger(); // Call to global function.
        }
        return temporaryStorage;
    }

    // Extracts and returns the next string token from the input.
    readString() {
        return this.parsedTokens[this.currentIndex++];
    }

    // Retrieves an array of 'arrayLength' string values.
    // Note: Similar to 'readIntegerArray', this method calls a globally scoped
    // 'readString()' function to maintain identical logic with the source.
    readStringArray(arrayLength) {
        let temporaryStorage = new Array(arrayLength);
        for (let arrayIndex = 0; arrayIndex < arrayLength; arrayIndex++) {
            temporaryStorage[arrayIndex] = readString(); // Call to global function.
        }
        return temporaryStorage;
    }
}

// Determine the execution environment (Node.js vs. browser).
// If 'globalScope' (equivalent to 'window' in browsers) is undefined,
// it indicates a Node.js environment.
if (typeof globalScope === "undefined") {
    // In Node.js, the 'require' function is used to load modules.
    const retrieveModule = require;
    // Load the 'fs' (file system) module.
    const fileSystemModule = retrieveModule("fs");
    const standardInputPath = "/dev/stdin"; // Standard path for input in Unix-like systems.
    const textEncoding = "utf8"; // Specifies the character encoding for file reading.

    // Read the entire content of the standard input file synchronously
    // and pass it to the main program execution function.
    ExecuteProgram(fileSystemModule.readFileSync(standardInputPath, textEncoding));
}