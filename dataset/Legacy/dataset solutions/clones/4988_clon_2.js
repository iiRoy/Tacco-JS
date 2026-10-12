'use strict';

// This function serves as the primary entry point for processing input data.
function ProcessInput(rawData) {
    // Initialize an input parsing utility to extract numerical values.
    let dataParser = new InputProcessor(rawData),
        valA = dataParser.getNextInteger(), // First integer value from input.
        valB = dataParser.getNextInteger(), // Second integer value from input.
        valC = dataParser.getNextInteger(), // Third integer value from input.
        // Determine the largest of the three input values.
        greatestDimension = Math.max(valA, valB, valC),
        // An array to store dimensions that are not the greatest, or duplicates of the greatest.
        remainingDimensions = [],
        // Calculate the first half of the greatest dimension, rounded down.
        firstHalfLength = Math.floor(greatestDimension / 2),
        // Calculate the second half of the greatest dimension.
        secondHalfLength = greatestDimension - firstHalfLength;

    // If any of the input values are even, the result is always zero.
    if (valA % 2 === 0 || valB % 2 === 0 || valC % 2 === 0) {
        console.log(0); // Output the predetermined result.
        return; // Exit the function early.
    }

    // Iterate through the initial values to identify those smaller than the maximum.
    [ valA, valB, valC ].forEach(currentVal => {
        if (currentVal < greatestDimension) {
            remainingDimensions.push(currentVal); // Add smaller dimensions to the list.
        }
    });
    // Ensure there are at least two dimensions in 'remainingDimensions' by adding the greatest dimension if needed.
    while (remainingDimensions.length < 2) {
        remainingDimensions.push(greatestDimension); // Duplicate the greatest dimension if necessary.
    }

    // Calculate the final result based on the absolute difference of the halves and the product of the two smallest dimensions.
    console.log(Math.abs(secondHalfLength - firstHalfLength) * remainingDimensions[0] * remainingDimensions[1]);
}

// A helper class designed to parse and provide numerical data from a string input.
class InputProcessor {
    // The constructor initializes the internal data store and the current reading position.
    constructor(sourceData) {
        this.dataItems = []; // Array to hold parsed data segments.
        // If the provided source data is a string, process it into an array of strings.
        if (typeof sourceData === 'string') {
            this.dataItems = sourceData.trim().split(/\s+/); // Split by whitespace.
        }
        this.currentIndex = 0; // Pointer to the current item being read.
    }

    // Retrieves the next available item as a string.
    getNextItem() {
        return this.hasMoreItems() ? this.dataItems[this.currentIndex++] : null;
    }

    // Retrieves the next available item and converts it to an integer.
    getNextInteger() {
        return this.hasMoreItems() ? parseInt(this.dataItems[this.currentIndex++], 10) : null;
    }

    // Checks if there are more items remaining to be processed.
    hasMoreItems() {
        return this.currentIndex < this.dataItems.length;
    }
}

// Read the input from standard input and pass it to the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
