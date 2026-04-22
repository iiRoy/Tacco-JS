"use strict";
// This module reads input from standard input, processes it, and prints a result.
let sourceData = require("node:fs").readBytesFromFile("/dev/stdin", "utf-8");

// Tokenization and cursor management for input parsing.
let tokenBuffer = sourceData.split(/[\s\n]+/), tokenCursor = 0;

// Function to retrieve the next numerical token from the buffer.
function acquireNextNumber() {
    return Number(tokenBuffer[tokenCursor++]);
}

// Function to retrieve the next string token from the buffer.
function acquireNextString() {
    return tokenBuffer[tokenCursor++];
}

// Function to retrieve the next BigInt token from the buffer.
function acquireNextBigInt() {
    return BigInt(tokenBuffer[tokenCursor++]);
}

// Function to get a sequence of numbers or strings from the buffer.
function getNumericSequence(countElements, returnAsStrings) {
    return returnAsStrings
        ? tokenBuffer.slice(tokenCursor, (tokenCursor += countElements))
        : tokenBuffer.slice(tokenCursor, (tokenCursor += countElements)).map((entry) => Number(entry));
}

// Function to retrieve matrix data from the buffer.
function getMatrixData(matrixRows, matrixCols, stringsOnly) {
    let resultGrid = [], rowIter = 0;
    if (stringsOnly) {
        for (; rowIter < matrixRows; rowIter++) {
            resultGrid.push(tokenBuffer.slice(tokenCursor, (tokenCursor += matrixCols)));
        }
    } else {
        for (; rowIter < matrixRows; rowIter++) {
            resultGrid.push(tokenBuffer.slice(tokenCursor, (tokenCursor += matrixCols)).map((val) => Number(val)));
        }
    }
    return resultGrid;
}

// Function to dynamically create a multi-dimensional array with a specified initial value.
function createMultiDimensionalArray(initialFillValue) {
    let dimensionSpecs = arguments, specLength = dimensionSpecs.length,
        constructionString = "Array(dimensionSpecs[" + --specLength + "]).fill().map(element => { return " + initialFillValue + "; })";
    while (--specLength) {
        constructionString = "Array(dimensionSpecs[" + specLength + "]).fill().map(element => " + constructionString + ")";
    }
    return eval(constructionString);
}

// Execute the primary logic of the program and store the computed outcome.
let finalOutcome = processDataset();

// Display the result to the console if it holds a defined value.
if (finalOutcome !== void 0) {
    console.info(String(finalOutcome));
}

// The core algorithm implementation to process the input dataset.
function processDataset() {
    let datasetSize = acquireNextNumber(); // Fetch the total number of elements in the dataset.
    let dataCollection = [0].concat(getNumericSequence(datasetSize)); // Initialize data with a leading zero, then append the fetched numeric sequence.

    // Iterate backwards through the collection to apply a specific transformation logic.
    for (let currentElementIndex = datasetSize; currentElementIndex >= 1; currentElementIndex--) {
        // If the current element's value is non-negative, skip further processing for this index and move to the next.
        if (dataCollection[currentElementIndex] >= 0) {
            continue;
        }

        // Calculate the sum of all elements that are multiples of the current index.
        let accumulatorValue = 0;
        for (let divisorMultipleIndex = currentElementIndex; divisorMultipleIndex <= datasetSize; divisorMultipleIndex += currentElementIndex) {
            accumulatorValue += dataCollection[divisorMultipleIndex];
        }

        // If the calculated sum of multiples is negative, reset relevant elements and restart the entire iteration.
        if (accumulatorValue < 0) {
            for (let resetIdx = currentElementIndex; resetIdx <= datasetSize; resetIdx += currentElementIndex) {
                dataCollection[resetIdx] = 0;
            }
            currentElementIndex = datasetSize; // Reset the outer loop index to re-evaluate from the end after modification.
        }
    }
    // Finally, sum all elements in the modified collection and return the total.
    return dataCollection.reduce((total, element) => total + element);
}