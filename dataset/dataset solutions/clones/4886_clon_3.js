// This module performs a specialized analysis on a sequence of numerical data.
// Its primary function is to identify potential "gains" within the sequence
// by comparing current values against the lowest point encountered up to that moment,
// and then to quantify how frequently the highest such gain occurs, constrained by an external factor.

function AnalyzeSequenceData(inputPayload) {

    // Internal utility function to parse a string line into an array of numbers.
    // It handles cleanup of whitespace and direct type conversion for each token.
    const extractNumericTokens = (textLine) => {
        // First, remove any leading or trailing whitespace from the line.
        // Then, split the cleaned string by spaces to get individual tokens.
        // Finally, map each token to its numeric representation.
        return textLine.trim().split(" ").map(Number);
    };

    // Simple helper to find the lesser of two numbers.
    // This can be seen as an alternative to Math.min for demonstration of rewriting.
    const determineLesserValue = (valA, valB) => {
        return valA < valB ? valA : valB;
    };

    // --- Data Acquisition and Initial Validation ---

    // A preliminary check to ensure the input is a valid string and not empty.
    // This helps in robust error handling for unexpected input formats.
    if (typeof inputPayload !== 'string' || inputPayload.length === 0) {
        console.error("Input processing terminated: Supplied data is not a valid non-empty string.");
        return; // Exit if input is invalid.
    }

    // Break down the multi-line input string into an array of individual lines.
    const dataRows = inputPayload.split("\n");

    // Verify that the input contains at least two lines: one for parameters and one for the data sequence.
    if (dataRows.length < 2) {
        console.error("Input processing terminated: Insufficient number of data lines provided.");
        return;
    }

    // Parse the first line to extract the primary operational parameters.
    // We use array destructuring for direct assignment of `dataSize` and `timeLimit`.
    const [dataSize, timeLimit] = extractNumericTokens(dataRows[0]);

    // Parse the second line, which contains the actual sequence of values for analysis.
    const valueSequence = extractNumericTokens(dataRows[1]);

    // Further validation checks on the parsed parameters and the data array.
    // Ensures `dataSize` is a positive integer and matches the actual length of `valueSequence`.
    if (dataSize <= 0 || !Number.isInteger(dataSize) || valueSequence.length !== dataSize) {
        console.error("Input processing terminated: Discrepancy in declared data size or invalid data size parameter.");
        return;
    }
    // Validates that `timeLimit` is a non-negative integer.
    if (timeLimit < 0 || !Number.isInteger(timeLimit)) {
        console.error("Input processing terminated: Invalid value detected for time limit parameter.");
        return;
    }

    // --- Core Analytical Loop for Maximum Gain Identification ---

    // Variables to keep track of the highest gain discovered and how many times it occurred.
    let currentMaximumGain = 0;      // Stores the largest difference found.
    let maxGainFrequency = 0;        // Counts how often `currentMaximumGain` is observed.

    // Initialize the reference point for calculating gains.
    // The `lowestPointEncountered` is set to the first element of the sequence.
    // All subsequent elements will be compared against this (or a new lower point).
    let lowestPointEncountered = valueSequence[0];

    // Iterate through each element of the `valueSequence` to perform the gain analysis.
    // This loop effectively finds the maximum difference between an element and any preceding minimum element.
    for (let index = 0; index < dataSize; ++index) {
        const currentElement = valueSequence[index];

        // Calculate the potential gain if we consider 'buying' at the `lowestPointEncountered`
        // and 'selling' at the `currentElement`.
        const potentialInstantGain = currentElement - lowestPointEncountered;

        // Logic to update `currentMaximumGain` and `maxGainFrequency`.
        if (potentialInstantGain > currentMaximumGain) {
            // A new, higher gain has been identified.
            currentMaximumGain = potentialInstantGain;
            maxGainFrequency = 1; // Reset count, as this is a new maximum.
        } else if (potentialInstantGain === currentMaximumGain) {
            // The current gain matches the existing maximum gain.
            maxGainFrequency++; // Increment the frequency count.
        }
        
        // Update the `lowestPointEncountered` for subsequent comparisons.
        // This must be done after the `potentialInstantGain` calculation for the `currentElement`,
        // because the `currentElement` itself might become the new lowest point for future iterations.
        lowestPointEncountered = determineLesserValue(lowestPointEncountered, currentElement);
    }

    // --- Final Result Computation and Output ---

    // The final result is constrained by the `timeLimit`.
    // It's the minimum of the `maxGainFrequency` and half of the `timeLimit`, rounded down.
    const cappedTimeFactor = Math.floor(timeLimit / 2);
    const finalOutcome = determineLesserValue(maxGainFrequency, cappedTimeFactor);

    // Output the calculated final outcome to standard console.
    console.log(finalOutcome);
}

// Execution entry point: Read input from standard input and pass it to the analysis function.
AnalyzeSequenceData(require("fs").readFileSync("/dev/stdin", "utf8"));