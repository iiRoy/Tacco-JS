const fileSystem = require('fs');

// Define a constant for the termination condition to improve readability
const END_OF_INPUT_SIGNAL = "0 0";

// Helper function to safely parse a number from a string
// Adds a guard for non-numeric values
function parseNumericValue(stringValue) {
    const numeric = Number(stringValue);
    if (isNaN(numeric)) {
        console.error(`Warning: Encountered non-numeric value "${stringValue}". Defaulting to 0.`);
        return 0; // Default to 0 or throw an error, depending on desired robustness
    }
    return numeric;
}

// Function to read a specific number of segment lengths from the input buffer
// This encapsulates repetitive input reading logic
function extractSegmentMeasures(count, sourceBuffer) {
    // Validate the count to prevent errors with negative or very large counts
    if (count < 0 || !Number.isInteger(count)) {
        console.error(`Error: Invalid segment count provided: ${count}. Returning empty array.`);
        return [];
    }

    const measures = new Array(count);
    for (let k = 0; k < count; k++) {
        const nextLine = sourceBuffer.shift();
        if (nextLine === undefined) {
            console.error(`Error: Expected ${count} segments but ran out of input lines.`);
            // Fill remaining with 0 or throw error
            for (let remaining = k; remaining < count; remaining++) {
                measures[remaining] = 0;
            }
            return measures;
        }
        measures[k] = parseNumericValue(nextLine);
    }
    return measures;
}

// Function to calculate frequencies of all possible contiguous subarray sums
// Uses a Map for better performance and type safety with numeric keys compared to plain objects
function computeContiguousSumFrequencies(numericSegments) {
    const sumFrequencyMap = new Map(); // Stores sum -> count mappings

    for (let startIdx = 0; startIdx < numericSegments.length; startIdx++) {
        let currentWindowSum = 0; // Accumulator for the current contiguous subarray sum
        for (let endIdx = startIdx; endIdx < numericSegments.length; endIdx++) {
            currentWindowSum += numericSegments[endIdx]; // Extend the window by one element
            // Increment frequency for this sum, initializing to 0 if not present
            sumFrequencyMap.set(currentWindowSum, (sumFrequencyMap.get(currentWindowSum) || 0) + 1);
        }
    }
    return sumFrequencyMap;
}

// Main execution block starts here
try {
    // Read the entire standard input and prepare it
    const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
    let processedInputLines = rawInputContent.trim().split("\n");

    // Process input data line by line until termination signal
    while (processedInputLines.length > 0) {
        let configurationLine = processedInputLines.shift();

        // Check for the termination condition
        if (configurationLine === END_OF_INPUT_SIGNAL) {
            break;
        }

        // Basic validation for the configuration line
        if (!configurationLine || configurationLine.trim() === '') {
            // Skip empty or malformed lines, but log for debugging
            console.warn("Skipping empty or malformed configuration line.");
            continue;
        }

        // Parse the two dimension values from the configuration line
        const dimensionTokens = configurationLine.split(" ");
        if (dimensionTokens.length !== 2) {
            console.error(`Invalid dimension line format: "${configurationLine}". Expected two numbers. Skipping.`);
            continue;
        }

        const primaryDimensionCount = parseNumericValue(dimensionTokens[0]);
        const secondaryDimensionCount = parseNumericValue(dimensionTokens[1]);

        // Validate dimension counts before proceeding to read segments
        if (primaryDimensionCount <= 0 && secondaryDimensionCount <= 0) {
            // If both dimensions are zero, there can be no matching sums.
            // This is an optimization and also handles cases where negative counts might have been parsed to 0.
            console.log(0);
            continue;
        }


        // Read the actual segment lengths for both dimensions
        const verticalSegmentLengths = extractSegmentMeasures(primaryDimensionCount, processedInputLines);
        const horizontalSegmentLengths = extractSegmentMeasures(secondaryDimensionCount, processedInputLines);

        // Calculate the frequency maps for contiguous sums for both sets of segments
        const verticalSumOccurrences = computeContiguousSumFrequencies(verticalSegmentLengths);
        const horizontalSumOccurrences = computeContiguousSumFrequencies(horizontalSegmentLengths);

        let totalMatchingSumPairs = 0; // Counter for the final result

        // Iterate through the sums found in the vertical segments
        for (const [sumValue, countInVertical] of verticalSumOccurrences.entries()) {
            // Check if the current sum also exists in the horizontal segments
            if (horizontalSumOccurrences.has(sumValue)) {
                const countInHorizontal = horizontalSumOccurrences.get(sumValue);
                // Multiply their frequencies and add to the total
                totalMatchingSumPairs += countInVertical * countInHorizontal;
            }
        }

        // Output the total count for the current test case
        console.log(totalMatchingSumPairs);
    }
} catch (error) {
    // Catch any unexpected errors during file reading or processing
    console.error("An unhandled error occurred during execution:", error.message);
    // Optionally, exit with a non-zero code to indicate failure
    process.exit(1);
}