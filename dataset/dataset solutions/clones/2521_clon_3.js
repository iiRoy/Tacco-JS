'use strict';

/*
 * This module processes raw input data to determine the number of individuals
 * whose height meets or exceeds a specified minimum dimension.
 * It simulates a scenario where a group of companions needs to pass a height check.
 */
const processInputData = function (incomingText) {
    // Define commonly used delimiters for parsing.
    const lineDelimiter = '\n';
    const valueDelimiter = ' ';

    // Split the entire input block into individual lines.
    // Ensure that we handle potential empty lines or malformed input gracefully.
    const textLines = incomingText.trim().split(lineDelimiter);

    // Basic validation: Check if we have at least two lines of data.
    // The first line contains parameters, the second line contains individual data.
    if (textLines.length < 2) {
        console.error('Error: Insufficient input data provided. Expected at least two lines.');
        // In case of critical input error, return 0 as a default or throw.
        return 0;
    }

    // Helper function to safely parse an integer, returning 0 on failure.
    // This prevents NaN values from propagating errors.
    const safeParseInt = (str) => {
        const parsed = parseInt(str, 10);
        return isNaN(parsed) ? 0 : parsed;
    };

    // Process the first line to extract configuration parameters.
    // This line typically contains the total count of participants (not directly used for iteration here)
    // and the minimum height threshold.
    const configurationValuesRaw = textLines[0].split(valueDelimiter);
    let expectedCompanions = 0; // Initialize with a default value
    let thresholdHeightValue = 0; // Initialize with a default value

    // Validate and parse the configuration values.
    if (configurationValuesRaw.length >= 2) {
        expectedCompanions = safeParseInt(configurationValuesRaw[0]);
        thresholdHeightValue = safeParseInt(configurationValuesRaw[1]);
    } else {
        console.warn('Warning: Configuration line missing expected values. Defaulting parameters to 0.');
    }

    // Process the second line, which contains the height measurements for each individual.
    const individualHeightsListRaw = textLines[1].split(valueDelimiter);
    const participantDimensions = []; // Array to store parsed numerical heights.

    // Iterate through the raw height strings and convert them to numbers.
    // Only non-negative heights are considered valid for this context.
    for (let i = 0; i < individualHeightsListRaw.length; i++) {
        const currentHeightString = individualHeightsListRaw[i];
        const currentHeightNumeric = safeParseInt(currentHeightString);
        
        // Add a simple check for logical heights (e.g., non-negative).
        if (currentHeightNumeric >= 0) {
            participantDimensions.push(currentHeightNumeric);
        } else {
            console.warn(`Warning: Invalid height value "${currentHeightString}" encountered and skipped.`);
        }
    }

    // Introduce an intermediate variable for the filtering criteria to enhance readability.
    const requiredDimensionCriterion = thresholdHeightValue;

    // Determine the number of individuals whose height meets the specified criterion.
    // Instead of using array methods like filter().length, we implement a manual loop
    // to demonstrate a structural modification.
    let eligibleCompanionsCount = 0;
    for (let j = 0; j < participantDimensions.length; j++) {
        const personActualHeight = participantDimensions[j];
        if (personActualHeight >= requiredDimensionCriterion) {
            eligibleCompanionsCount++;
        }
    }

    // Output the final computed result to the console.
    console.log(eligibleCompanionsCount);
};

// Main execution block: Read input from standard input and pass it to the processing function.
// This part handles the environment-specific I/O.
try {
    const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    processInputData(rawInputContent);
} catch (error) {
    // Catch potential errors during file reading (e.g., file not found, permission issues).
    console.error('Failed to retrieve input from /dev/stdin:', error.message);
    // Optionally, provide a fallback or default behavior in case of input failure.
    // For example, processInputData("3 160\n155 165 170"); could be used for testing.
}