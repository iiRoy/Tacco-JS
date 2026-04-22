"use strict";

/**
 * A utility function to parse a single string representing a point's coordinates
 * into an array of numeric values. Handles trimming and multiple spaces.
 * @param {string} pointCoordinateString - The input string, e.g., "1 2 3"
 * @returns {number[]} An array of numbers representing the coordinates.
 */
const parseSinglePointNumericalCoordinates = (pointCoordinateString) => {
    // Defensive check for valid input type
    if (typeof pointCoordinateString !== 'string' || pointCoordinateString.trim().length === 0) {
        // In case of invalid input, return an empty array to signify no coordinates
        return [];
    }
    // Trim whitespace, split by one or more spaces, and convert each segment to a number
    return pointCoordinateString.trim().split(/\s+/).map(Number);
};

/**
 * Core function to analyze spatial data, calculate Euclidean distances between all unique pairs
 * of points, and count how many of these distances are integers.
 *
 * @param {string} rawInputPayloadString - The entire input data as a single string,
 *                                         typically read from a file or stdin.
 * @returns {number} The total count of pairs with an integer Euclidean distance.
 */
const calculateIntegerDistancePairs = (rawInputPayloadString) => {
    // --- Input Validation and Pre-processing ---

    // Ensure the input is a non-empty string to prevent runtime errors
    if (typeof rawInputPayloadString !== 'string' || rawInputPayloadString.trim().length === 0) {
        console.error("Input data is either invalid or empty. Cannot perform spatial analysis.");
        return 0; // No pairs can be found with empty input
    }

    // Split the input string into individual lines, filtering out any empty lines
    const allInputDataLines = rawInputPayloadString.trim().split('\n').filter(line => line.trim().length > 0);

    // Verify minimum required lines: one for N/D, at least one for a point
    if (allInputDataLines.length < 2) {
        console.warn("Insufficient data lines provided. Expected at least two lines (header + point).");
        return 0;
    }

    // --- Header Parsing ---

    // Parse the first line to get the total number of points (N) and dimensions (D)
    const headerLineTokens = allInputDataLines[0].trim().split(/\s+/).map(Number);
    const totalNumberOfPointsDeclared = headerLineTokens[0];
    const spatialDimensionsCount = headerLineTokens[1]; // D is parsed but not directly used in the distance formula itself

    // Optional: Add a check for the validity of parsed N and D
    if (isNaN(totalNumberOfPointsDeclared) || isNaN(spatialDimensionsCount) || totalNumberOfPointsDeclared < 0 || spatialDimensionsCount < 0) {
        console.error("Invalid N or D values found in the header line. Must be non-negative integers.");
        return 0;
    }

    // --- Point Data Transformation ---

    // Extract point coordinate strings from the input and convert them into numerical arrays
    // We only consider the number of points specified by totalNumberOfPointsDeclared
    const collectionOfParsedPoints = allInputDataLines
        .slice(1, totalNumberOfPointsDeclared + 1) // Take N point lines
        .map(parseSinglePointNumericalCoordinates); // Use the helper to parse each line

    // Adjust the actual number of points if the declared N was larger than available lines
    const actualNumberOfPoints = collectionOfParsedPoints.length;
    if (totalNumberOfPointsDeclared !== actualNumberOfPoints) {
        console.warn(`Declared number of points (${totalNumberOfPointsDeclared}) differs from actual parsed points (${actualNumberOfPoints}). Proceeding with actual count.`);
    }

    let integerEuclideanDistanceCounter = 0; // Initialize a counter for pairs with integer distances

    // --- Pairwise Distance Calculation ---

    // Outer loop: Iterate through each point in the collection
    for (let pointIndexA = 0; pointIndexA < actualNumberOfPoints; pointIndexA++) {
        const currentPointVector = collectionOfParsedPoints[pointIndexA];

        // Inner loop: Compare currentPointVector with all subsequent points to avoid duplicate pairs
        for (let pointIndexB = pointIndexA + 1; pointIndexB < actualNumberOfPoints; pointIndexB++) {
            const comparisonPointVector = collectionOfParsedPoints[pointIndexB];

            let sumOfSquaredCoordinateDifferences = 0; // Accumulator for the squared differences

            // Ensure points have consistent dimensions before calculating distance
            // This is a guard clause for malformed data
            if (currentPointVector.length !== comparisonPointVector.length || currentPointVector.length === 0) {
                console.warn(`Skipping pair (indices ${pointIndexA}, ${pointIndexB}) due to inconsistent or zero dimensions.`);
                continue; // Move to the next pair
            }

            // Calculate the sum of squared differences across all dimensions
            for (let dimensionIterator = 0; dimensionIterator < currentPointVector.length; dimensionIterator++) {
                const coordinateDifference = currentPointVector[dimensionIterator] - comparisonPointVector[dimensionIterator];
                // Square the difference; Math.pow is less efficient than direct multiplication for squares
                sumOfSquaredCoordinateDifferences += (coordinateDifference * coordinateDifference);
            }

            // Calculate the final Euclidean distance by taking the square root
            const calculatedEuclideanDistance = Math.sqrt(sumOfSquaredCoordinateDifferences);

            // Check if the calculated distance is an exact integer
            // Number.isInteger is preferred over `distance % 1 === 0` for clarity and robustness with floating points
            if (Number.isInteger(calculatedEuclideanDistance)) {
                integerEuclideanDistanceCounter++; // Increment the counter
            }
        }
    }

    // --- Output Result ---
    return integerEuclideanDistanceCounter;
};

// --- Main Execution Block ---

// This block handles reading input from stdin and calling the core processing function.
// It includes error handling for file system operations.
try {
    const rawDataFromStandardInput = require('fs').readFileSync('/dev/stdin', 'utf8');
    const finalResult = calculateIntegerDistancePairs(rawDataFromStandardInput);
    console.log(finalResult); // Output the final count to standard output
} catch (ioError) {
    console.error(`An error occurred during file reading or initial processing: ${ioError.message}`);
    // Exit with a non-zero status code to indicate an error
    process.exit(1);
}