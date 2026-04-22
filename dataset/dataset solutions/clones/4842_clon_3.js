"use strict";

// A small utility function to safely parse integers from string parts.
// This helps centralize parsing logic and can easily be extended for error handling.
const convertToInteger = (stringPart) => {
    // Ensure radix is always specified for parseInt for consistent behavior.
    const parsedValue = parseInt(stringPart, 10);
    // Basic check for NaN, though the problem context implies valid numeric strings.
    if (isNaN(parsedValue)) {
        // In a real application, one might throw an error or return a default.
        // For this clone, we assume valid input as per original problem specification.
        console.warn(`Warning: Could not parse "${stringPart}" into an integer. Returning 0.`);
        return 0; // Or throw new Error("Invalid number format");
    }
    return parsedValue;
};

// This function processes the raw input string to solve the specific problem.
const processNumericalSequence = (rawInputContent) => {
    // Step 1: Prepare the input data.
    // Remove leading/trailing whitespace and split the content into individual lines.
    const inputLines = rawInputContent.trim().split("\n");

    // Guard clause: Ensure there's enough input for processing.
    // The problem expects at least two lines (N X, and then the array A).
    if (inputLines.length < 2) {
        console.error("Error: Input data is incomplete. Expected at least two lines.");
        // We might choose to throw an error or exit gracefully here.
        return;
    }

    // Step 2: Parse the first line to extract key parameters.
    // The first line contains N (number of elements) and X (maximum allowed sum).
    const configurationParts = inputLines[0].split(" ");
    const numberOfElements = convertToInteger(configurationParts[0]);
    const maximumAllowedSum = convertToInteger(configurationParts[1]);

    // Step 3: Parse the second line to create the array of numbers.
    // Split the string of numbers and convert each part to an integer using our utility.
    const stringNumbers = inputLines[1].split(" ");
    const numericalArray = stringNumbers.map(convertToInteger);

    // Additional validation: Ensure array size matches 'numberOfElements' declared.
    // This is a new guard/validation fragment.
    if (numericalArray.length !== numberOfElements) {
        console.warn(`Warning: Declared number of elements (${numberOfElements}) does not match actual array length (${numericalArray.length}). Proceeding with actual length for loop bounds.`);
        // For strict adherence, one might error out or truncate/pad.
        // We will proceed using the `numberOfElements` for loop bounds as per original intent.
    }

    // Step 4: Initialize a counter to track the total adjustments made.
    let cumulativeAdjustments = 0;

    // Step 5: Iterate through the array to check adjacent pairs and apply adjustments.
    // The loop runs from the first element up to the second-to-last element.
    // This ensures that 'currentIdx + 1' is always a valid index within the array.
    const lastValidIndexForPair = numberOfElements - 1;
    for (let currentIdx = 0; currentIdx < lastValidIndexForPair; ++currentIdx) {
        // Extract the two adjacent elements for clearer readability.
        const firstAdjacentValue = numericalArray[currentIdx];
        const secondAdjacentValue = numericalArray[currentIdx + 1];

        // Calculate the sum of the current pair.
        const adjacentPairSum = firstAdjacentValue + secondAdjacentValue;

        // Check if this sum exceeds the predefined maximum allowed sum.
        if (adjacentPairSum > maximumAllowedSum) {
            // Determine the exact amount by which the sum exceeds the threshold.
            const excessAmount = adjacentPairSum - maximumAllowedSum;

            // Adjust the second element of the pair by subtracting the excess amount.
            // This ensures the pair's sum becomes exactly 'maximumAllowedSum' (or less if prior adjustments made it smaller).
            numericalArray[currentIdx + 1] = numericalArray[currentIdx + 1] - excessAmount;

            // Add the 'excessAmount' to our cumulative adjustments counter.
            cumulativeAdjustments = cumulativeAdjustments + excessAmount;
        }
    }

    // Step 6: Output the final accumulated count of all adjustments made.
    console.log(cumulativeAdjustments);
};

// This is the entry point for the script when executed.
// It handles reading input from the standard input stream.
const fileSystemHandler = require('fs'); // Renamed 'fs' module variable
const standardInputFile = '/dev/stdin'; // Constant for the input file path
const fileEncoding = 'utf8'; // Constant for the character encoding

// Use a try-catch block to handle potential file system errors during input reading.
try {
    const rawDataFromStdin = fileSystemHandler.readFileSync(standardInputFile, fileEncoding);
    // Pass the raw content to our main processing function.
    processNumericalSequence(rawDataFromStdin);
} catch (readError) {
    // Log an informative error message if reading fails.
    console.error("An error occurred while reading from standard input:", readError.message);
    // Depending on requirements, one might exit the process here or try a fallback.
    process.exit(1); // Exit with a non-zero status code to indicate an error.
}