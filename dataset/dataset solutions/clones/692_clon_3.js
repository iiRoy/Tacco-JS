// This script reads numerical inputs from standard input,
// processes each number 'N' to find the minimum positive difference
// between N^3 and the sum of two other cubes (i^3 + j^3)
// where i and j are integers such that 1 <= j <= i < N.

// Import the Node.js file system module to read from stdin.
const fileSystem = require('fs');

// Read the entire content of standard input as a UTF-8 string.
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Process the raw input:
// 1. Trim any leading/trailing whitespace from the entire content.
// 2. Split the content into an array of strings, one for each line.
// 3. Filter out any empty strings that might result from splitting (e.g., trailing newlines).
let processedInputLines = rawInputContent.trim().split('\n').filter(entry => entry.length > 0);

// Initialize a variable to hold the primary number for each calculation cycle.
let primaryCalculationValue;

// Begin the main processing loop.
// The loop continues as long as there are lines left to process in the 'processedInputLines' array.
// In each iteration, it attempts to parse the next line as an integer.
// The loop terminates if the parsed integer is 0, or if the input array becomes empty.
while (processedInputLines.length > 0) {
    // Extract the next line from the beginning of the array.
    const currentLineData = processedInputLines.shift();

    // Convert the extracted line to an integer using base 10.
    primaryCalculationValue = parseInt(currentLineData, 10);

    // Validate the parsed value. If it's not a number or is zero,
    // this indicates the end of a valid processing sequence or an invalid input.
    if (isNaN(primaryCalculationValue) || primaryCalculationValue === 0) {
        // If it's zero, we break the loop as per problem specification.
        // If it's NaN, we also break, as it implies corrupted input or end of logical data.
        break;
    }

    // --- Core Calculation Logic for the current primaryCalculationValue ---

    // Calculate the cube of the primary value once to optimize performance.
    const primaryValueCube = Math.pow(primaryCalculationValue, 3);

    // This array will store all positive differences found.
    const foundDifferences = [];

    // Outer iteration: 'firstDecrementer' ranges from (primaryCalculationValue - 1) down to 1.
    // This corresponds to 'i' in the original problem statement (N-1 to 1).
    for (let firstDecrementer = primaryCalculationValue - 1; firstDecrementer >= 1; firstDecrementer--) {
        // Pre-calculate the cube of the first decrementer.
        const firstDecrementerCube = Math.pow(firstDecrementer, 3);

        // Inner iteration: 'secondDecrementer' ranges from 'firstDecrementer' down to 1.
        // This corresponds to 'j' in the original problem statement (i to 1).
        for (let secondDecrementer = firstDecrementer; secondDecrementer >= 1; secondDecrementer--) {
            // Pre-calculate the cube of the second decrementer.
            const secondDecrementerCube = Math.pow(secondDecrementer, 3);

            // Calculate the potential difference: N^3 - i^3 - j^3.
            const calculatedDifference = primaryValueCube - firstDecrementerCube - secondDecrementerCube;

            // Only add positive differences to our collection.
            if (calculatedDifference > 0) {
                foundDifferences.push(calculatedDifference);
            }
        }
    }

    // After evaluating all possible combinations for the current primary value:
    // Check if any positive differences were actually found.
    if (foundDifferences.length > 0) {
        // If found, determine the minimum value among them using the spread operator.
        const minimumResultForCurrentValue = Math.min(...foundDifferences);
        // Output the result to the console.
        console.log(minimumResultForCurrentValue);
    } else {
        // If no positive differences were found (e.g., N is too small or combinations didn't yield positive results).
        // The original `Math.min.apply(null, [])` would yield `Infinity`.
        // We explicitly log `Infinity` to maintain functional equivalence for this edge case.
        console.log(Infinity);
    }
}