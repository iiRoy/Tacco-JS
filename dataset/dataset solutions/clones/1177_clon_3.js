// This module handles the processing of numerical datasets to determine their standard deviation.
// It reads input from standard input, processes each dataset, and prints the result.

// Define a constant for the standard input file path to ensure consistency.
const STANDARD_INPUT_SOURCE_PATH = '/dev/stdin';

/**
 * Computes the arithmetic mean (average) of a collection of numerical values.
 * This function handles potential edge cases such as empty input arrays gracefully.
 * @param {number[]} numberCollection - An array containing numerical values.
 * @returns {number} The calculated arithmetic mean. Returns 0.0 if the collection is empty
 *                   to prevent division by zero and provide a sensible default.
 */
function computeArithmeticMean(numberCollection) {
    // Validate input: If the collection is null, undefined, or empty, return 0.
    if (!numberCollection || numberCollection.length === 0) {
        return 0.0;
    }

    let totalSumOfElements = 0; // Initialize an accumulator for the sum of all numbers.
    // Iterate through each numeric value within the provided collection.
    for (const individualValue of numberCollection) {
        totalSumOfElements += individualValue; // Add the current value to the running total.
    }
    // Calculate the average by dividing the total sum by the count of elements.
    return totalSumOfElements / numberCollection.length;
}

/**
 * Determines the population variance of a given dataset.
 * Variance quantifies the spread of a set of numbers from their average value.
 * @param {number[]} dataPoints - An array of numerical data points.
 * @returns {number} The calculated population variance. Returns 0.0 if the dataset is
 *                   empty or contains only a single element, as variance is not well-defined
 *                   or is zero in such cases.
 */
function determinePopulationVariance(dataPoints) {
    // Handle edge cases: A dataset must have at least two points for meaningful variance.
    // For single or no points, variance is considered zero.
    if (!dataPoints || dataPoints.length <= 1) {
        return 0.0;
    }

    // First, obtain the central tendency measure (mean) for the dataset.
    const datasetAverage = computeArithmeticMean(dataPoints);
    let cumulativeSquaredDifferences = 0; // Accumulator for the sum of squared differences.

    // Iterate through each individual data point in the array.
    for (const pointValue of dataPoints) {
        // Calculate the difference of the current point from the dataset's average.
        const deviationFromMean = pointValue - datasetAverage;
        // Square this difference and add it to the running total.
        cumulativeSquaredDifferences += (deviationFromMean * deviationFromMean);
    }

    // The population variance is the average of the squared differences.
    return cumulativeSquaredDifferences / dataPoints.length;
}

/**
 * Calculates the population standard deviation for a numerical array.
 * Standard deviation is a widely used measure of variability or dispersion.
 * It is the square root of the population variance.
 * @param {number[]} numericalArray - An array of numbers for which the standard deviation is to be computed.
 * @returns {number} The calculated population standard deviation. Returns 0.0 for an empty array.
 */
function calculateStdDev(numericalArray) {
    // Basic validation: An empty array has no deviation.
    if (!numericalArray || numericalArray.length === 0) {
        return 0.0;
    }

    // The standard deviation computation depends directly on the variance.
    const calculatedPopulationVariance = determinePopulationVariance(numericalArray);

    // It's good practice to ensure the variance isn't negative before taking a square root.
    // While mathematically variance should always be non-negative, floating-point inaccuracies
    // or malformed input could theoretically lead to a tiny negative value.
    if (calculatedPopulationVariance < 0) {
        console.error("Anomalous condition: Computed variance was negative. Returning 0 for standard deviation.");
        return 0.0; // Return 0 or handle as an error if this occurs.
    }

    // The standard deviation is simply the square root of the variance.
    return Math.sqrt(calculatedPopulationVariance);
}

// The primary execution logic is encapsulated within an Immediately Invoked Function Expression (IIFE).
// This pattern helps in creating a private scope for variables and functions, preventing global pollution.
((rawInputContentString) => {
    // Split the entire input content into an array of lines.
    // This allows sequential processing of each line.
    let parsedInputLines = rawInputContentString.split('\n');
    let currentLinePointer = 0; // A pointer to keep track of the current line being processed.

    // Begin an infinite loop, designed to process multiple datasets until a specific termination condition.
    while (true) {
        // Guard clause: Check if we have exhausted all input lines.
        if (currentLinePointer >= parsedInputLines.length) {
            break; // Exit the loop if no more input is available.
        }

        // Retrieve the current line and then advance the pointer for the next iteration.
        const lineWithElementCount = parsedInputLines[currentLinePointer++];
        // Attempt to convert the line to an integer, representing the number of elements (N) for the current dataset.
        // Trim whitespace and specify radix 10 for robust parsing.
        const expectedElementCount = parseInt(lineWithElementCount.trim(), 10);

        // Termination condition: If N is 0 or parsing resulted in NaN (indicating invalid input),
        // we consider this the end of valid data processing.
        if (isNaN(expectedElementCount) || expectedElementCount === 0) {
            break; // Terminate processing.
        }

        // Another guard clause: Ensure there's a subsequent line for the actual data.
        if (currentLinePointer >= parsedInputLines.length) {
            // This indicates a malformed input file (e.g., N specified but no data line follows).
            console.error("Error: Input ended unexpectedly after reading element count. Data line is missing.");
            break; // Exit due to input error.
        }
        const lineWithDataValues = parsedInputLines[currentLinePointer++];

        // Process the data line: split by spaces, filter out any empty strings (from multiple spaces),
        // and convert all resulting substrings into numbers.
        const currentNumericalDataset = lineWithDataValues
            .split(' ')
            .filter(segment => segment.length > 0) // Remove empty strings that might result from multiple spaces.
            .map(numericString => Number(numericString)); // Convert each string segment to a number.

        // Optional validation: Check if the actual number of elements read matches the expected count.
        // This adds robustness against potentially malformed data lines.
        if (currentNumericalDataset.length !== expectedElementCount) {
            console.warn(`Data mismatch warning: Expected ${expectedElementCount} elements but found ${currentNumericalDataset.length}. Proceeding with found data.`);
            // Depending on requirements, one might skip this dataset or throw an error here.
        }

        // Compute the standard deviation for the currently parsed dataset.
        const resultStandardDeviation = calculateStdDev(currentNumericalDataset);

        // Output the calculated standard deviation. Using process.stdout.write for direct output
        // and toFixed(8) for consistent floating-point precision, followed by a newline.
        process.stdout.write(resultStandardDeviation.toFixed(8) + '\n');
    }

})(require('fs').readFileSync(STANDARD_INPUT_SOURCE_PATH, 'utf8')); // Read the entire content of the standard input file.