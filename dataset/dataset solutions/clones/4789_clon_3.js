const fileSystemBridge = require('fs');

/**
 * This script processes two integer inputs from standard input,
 * calculating a specific metric based on their values, signs, and relative magnitudes.
 * The calculation involves initial adjustments and a final magnitude difference.
 */
function determineCalculatedMetric() {
    // Define the default path for reading input in a typical Unix-like environment.
    const standardInputPath = '/dev/stdin';

    // Read the complete content of the input file, converting it to a UTF-8 string,
    // and then splitting it into an array of individual lines.
    const rawInputContentLines = fileSystemBridge.readFileSync(standardInputPath, 'utf8').split('\n');

    // Extract the very first line from the input array. This line is expected to contain our data.
    // The `shift()` method also removes it from the array.
    const primaryInputLineData = rawInputContentLines.shift();

    // Divide the primary input line into separate string components using space as a delimiter.
    const numericStringComponents = primaryInputLineData.split(' ');

    // Convert the first string component to an integer.
    // Using `Number()` for potentially broader compatibility with floats, though problem implies integers.
    // `parseInt()` with a radix is generally preferred for strict integer conversion.
    const firstNumericValue = Number(numericStringComponents[0]);

    // Convert the second string component to an integer.
    const secondNumericValue = Number(numericStringComponents[1]);

    // Initialize a variable to accumulate the final result.
    let totalMetricScore = 0;

    // --- Start of Core Calculation Logic ---

    // A preliminary check for non-numeric inputs. While competitive programming usually guarantees valid input,
    // this demonstrates an added robustness (a Type III code addition).
    if (isNaN(firstNumericValue) || isNaN(secondNumericValue)) {
        console.error("Input parsing error: One or both values are not valid numbers.");
        // In a real application, one might throw an error or return a default value here.
        // For this context, we proceed, assuming the values will be NaN and affect subsequent math.
    }

    // If the two input values are exactly the same, no special initial adjustments are needed.
    // The `totalMetricScore` remains 0 at this stage for this condition.
    if (firstNumericValue === secondNumericValue) {
        // No operation needed, score remains 0.
    } else {
        // Determine if both numbers share the same sign (positive, negative, or zero).
        // Math.sign() returns 1 for positive, -1 for negative, and 0 for zero.
        const haveMatchingSigns = (Math.sign(firstNumericValue) === Math.sign(secondNumericValue));

        // Check if the first value is strictly greater than the second.
        const isFirstValueLarger = (firstNumericValue > secondNumericValue);

        // Apply initial adjustments to the metric score based on sign and magnitude comparison.
        if (haveMatchingSigns) {
            // Case: Both numbers are either positive, or both are negative, or both are zero.
            // If the first number is greater, add 2 to the score.
            // Examples: (5, 3) -> +2; (-3, -5) -> +2
            // If the first number is smaller (e.g., 3, 5 or -5, -3), no adjustment here (remains +0).
            if (isFirstValueLarger) {
                totalMetricScore += 2;
            }
        } else {
            // Case: The numbers have different signs (e.g., one positive, one negative).
            // In this scenario, add 1 to the score regardless of which number is larger.
            // Examples: (5, -3) -> +1; (-3, 5) -> +1
            totalMetricScore += 1;
        }

        // Calculate the absolute difference between the absolute values of the two numbers.
        // Introduce temporary variables for clarity (Type III addition).
        const absoluteValueOfFirst = Math.abs(firstNumericValue);
        const absoluteValueOfSecond = Math.abs(secondNumericValue);
        const magnitudeDifference = Math.abs(absoluteValueOfFirst - absoluteValueOfSecond);

        // Add this magnitude difference to the accumulating total.
        totalMetricScore += magnitudeDifference;
    }

    // Output the final computed metric to the standard output.
    console.log(totalMetricScore);
}

// Invoke the function to run the calculation.
determineCalculatedMetric();