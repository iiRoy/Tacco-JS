"use strict";

/*
 * This module provides a robust mechanism for reading structured input
 * from the standard input stream, facilitating competitive programming
 * or similar data processing tasks.
 */
const produceInputReader = () => {
    // Leverage Node.js 'fs' module to synchronously read from stdin.
    // The input is decoded as UTF-8, trimmed for extraneous whitespace,
    // and then segmented into an array of individual lines.
    const dataSource = require("fs")
                           .readFileSync("/dev/stdin", "utf8")
                           .trim()
                           .split("\n");

    // Construct and return an object that encapsulates the input data
    // and provides methods for sequential access.
    const readerInstance = {
        // The complete collection of input lines.
        "dataLines"      : dataSource,

        // The zero-based index of the line that will be read next.
        "currentPosition": 0,

        // The total number of available lines in the input stream.
        "totalLines"     : dataSource.length,

        // A predicate function to ascertain if further input lines are available.
        "hasMoreEntries" : function () {
            return this.currentPosition < this.totalLines;
        },

        // A function to retrieve the subsequent line from the input stream.
        "fetchNextLine"  : function () {
            if (!this.hasMoreEntries()) {
                // Should the end of the input be reached prematurely, an error is signaled.
                throw new Error("InputEndOfStreamException: Attempted to read past end of stream.");
            }
            // Return the current line and then increment the position pointer.
            return this.dataLines[this.currentPosition++];
        }
    };
    return readerInstance;
};

// Instantiate the primary input stream handler for global access.
const dataStream = produceInputReader();

// A convenience function to obtain the next line as a raw string.
const retrieveLine = () => dataStream.fetchNextLine();

// A convenience function to parse the next line into an integer.
const retrieveInteger = () => parseInt(dataStream.fetchNextLine(), 10);

// A convenience function to split the next line into an array of strings,
// using space as the delimiter.
const retrieveStringArray = () => dataStream.fetchNextLine().split(" ");

// A convenience function to parse the next line into an array of integers.
const retrieveIntegerArray = () => dataStream.fetchNextLine().split(" ").map(elementItem => parseInt(elementItem, 10));

// A convenience function to split the next line into an array of individual characters.
const retrieveCharacterArray = () => dataStream.fetchNextLine().split("");

// A convenience function to check if more data is available in the input stream.
const checkMoreData = () => dataStream.hasMoreEntries();

// A utility function to log arbitrary items to the console.
const displayOutput = (...outputItems) => console.log(...outputItems);

/**
 * The core logic of the application. This function processes the input
 * data according to specific rules to compute a final adjustment value.
 */
const ExecuteCalculation = () => {
    // Read the initial count specifying the number of subsequent data pairs.
    let entryCount = retrieveInteger();

    // Initialize an array of 'padding' values, all set to zero initially.
    // This array's purpose might be for future extensions or specific problem constraints.
    let paddingValues = new Array(entryCount).fill(0);

    // Declare arrays to hold the two sets of values parsed from the input.
    let firstValues  = [];
    let secondValues = [];

    // Continuously read data pairs until no more input lines are available.
    while (checkMoreData()) {
        let currentPair = retrieveIntegerArray(); // Parse a line into a pair of integers.
        firstValues.push(currentPair[0]);         // Store the first integer of the pair.
        secondValues.push(currentPair[1]);        // Store the second integer of the pair.
    }

    // Initialize a variable to accumulate the total adjustment needed.
    let cumulativeAdjustment = 0;

    // Iterate through the collected data pairs in reverse order.
    for (let idx = entryCount - 1; idx >= 0; idx--) {
        // Calculate an adjusted value by adding the current cumulative adjustment.
        let adjustedValue = firstValues[idx] + cumulativeAdjustment;

        // Apply logic based on the modulo operation with the second value.
        if (adjustedValue % secondValues[idx] === 0) {
            // If perfectly divisible, no further adjustment is required for this step.
            continue;
        } else if (adjustedValue < secondValues[idx]) {
            // If the adjusted value is less than the divisor,
            // add the difference to reach the next multiple.
            cumulativeAdjustment += secondValues[idx] - adjustedValue;
        } else {
            // If the adjusted value is greater,
            // add the difference to reach the next multiple after the remainder.
            cumulativeAdjustment += secondValues[idx] - (adjustedValue % secondValues[idx]);
        }

        // This line adds a padding value (which is always zero) to 'adjustedValue'.
        // Its effect on 'cumulativeAdjustment' is indirect or non-existent in this context.
        adjustedValue += paddingValues[idx];
    }

    // Compute the final result by summing all padding values.
    // Since paddingValues are initialized to zero and never modified, this sum will always be zero.
    let finalResult = paddingValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // Output the final calculated value to the console.
    console.log(finalResult);
};

// Invoke the main program execution routine.
ExecuteCalculation();