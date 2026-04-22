"use strict";

// Entry point for processing the input data.
// This function encapsulates the core logic to analyze frequencies and calculate a sum.
const processInputData = (rawInputString) => {
    // Standard input processing: trim whitespace and split into lines.
    const inputLines = rawInputString.trim().split("\n");

    // A basic validation to ensure the input has at least two lines:
    // one for parameters and one for the sequence of numbers.
    if (inputLines.length < 2) {
        // In a competitive programming context, this might not be needed,
        // but for a robust application, it's a good guard clause.
        console.error("Error: Insufficient input lines provided. Expected at least two.");
        // Returning 0 or throwing an error are options for handling invalid input.
        return 0;
    }

    // Parse the first line to extract configuration parameters.
    // The first parameter (often N, total count of elements) is not directly used
    // in the final calculation, so we only extract the second one.
    const configurationParameters = inputLines[0].split(" ");
    const numberOfMostFrequentToSkip = parseInt(configurationParameters[1], 10);

    // Parse the second line to obtain the sequence of integer values.
    // Using the `Number` constructor for concise string-to-integer conversion.
    const numericalSequence = inputLines[1].split(" ").map(Number);

    // Define the maximum expected value in the sequence.
    // This helps in sizing the frequency counting array appropriately.
    // Assuming numbers can go up to 200,000, so array size needs to be 200,001 for 0-indexed.
    const MAXIMUM_EXPECTED_VALUE = 200000;
    const valueOccurrenceTracker = new Array(MAXIMUM_EXPECTED_VALUE + 1).fill(0);

    // Populate the occurrence tracker by iterating through the numerical sequence.
    // Each number encountered increments its corresponding counter.
    for (const currentElement of numericalSequence) {
        // Add a check to ensure the element is within expected bounds before incrementing.
        if (currentElement >= 0 && currentElement <= MAXIMUM_EXPECTED_VALUE) {
            valueOccurrenceTracker[currentElement]++;
        }
        // Optionally, handle out-of-range elements, e.g., by logging a warning.
    }

    // Filter out all counts that are zero, as these values did not appear in the input.
    // This creates a new array containing only the frequencies of observed numbers.
    const actualFrequencies = valueOccurrenceTracker.filter(countValue => countValue > 0);

    // Sort the actual frequencies in descending order.
    // This arranges them from the most frequent number to the least frequent.
    actualFrequencies.sort((frequencyA, frequencyB) => frequencyB - frequencyA);

    // Determine the effective number of frequencies to skip.
    // Ensure it's not negative and does not exceed the total unique frequencies available.
    const effectiveSkipCount = Math.max(0, Math.min(numberOfMostFrequentToSkip, actualFrequencies.length));

    // Calculate the sum of frequencies for all elements *after* the most frequent ones
    // that were skipped. This effectively sums the frequencies of the least common items.
    let accumulatedSumOfMinorityFrequencies = 0;
    // Iterate from the 'effectiveSkipCount' index to the end of the sorted frequencies array.
    for (let i = effectiveSkipCount; i < actualFrequencies.length; i++) {
        accumulatedSumOfMinorityFrequencies += actualFrequencies[i];
    }

    // Return the final calculated sum.
    return accumulatedSumOfMinorityFrequencies;
};

// Immediately-invoked function expression (IIFE) to handle external dependencies
// and initiate the data processing workflow.
(() => {
    // Read the entire content from standard input, typically used in competitive programming.
    const fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Invoke the main processing function with the read input.
    const finalCalculatedValue = processInputData(fileContents);

    // Output the result to standard output.
    console.log(finalCalculatedValue);
})();