function calculateSpecialNumberCount(inputValue) {
    // This module is designed to compute the total count of positive integers
    // up to a specified upper bound that have an odd number of digits.
    // For example, numbers like 1, 5, 103, 54321 all have an odd number of digits.

    // The raw input is expected to be a string, potentially containing
    // whitespace and other elements. It's first converted to a string,
    // trimmed, and then split into an array of strings.
    const processedInputSegments = String(inputValue).trim().split(" ");

    // Input validation: Check if any valid numeric input was provided.
    // If the array is empty or the first segment is an empty string,
    // it indicates a lack of proper input data.
    if (processedInputSegments.length === 0 || !processedInputSegments[0]) {
        console.error("Error: No valid numeric input string was supplied for processing.");
        return; // Terminate execution or handle error as appropriate.
    }

    // Attempt to convert the first segment of the input string array into a base-10 integer.
    // This explicitly uses parseInt with a radix of 10 for reliable conversion.
    const targetCeiling = parseInt(processedInputSegments[0], 10);

    // Further validation: Ensure the parsed value is a finite, positive integer.
    // Non-numeric inputs, negative numbers, or zero are considered invalid for this calculation.
    if (isNaN(targetCeiling) || targetCeiling < 1 || !Number.isFinite(targetCeiling)) {
        console.error(`Error: The provided numeric ceiling is invalid or non-positive: '${processedInputSegments[0]}'.`);
        return;
    }

    // Initialize a variable to accumulate the final count of numbers
    // that meet the odd-digit criterion.
    let accumulatedOddDigitNumbers = 0;

    // A utility function to compute powers of 10.
    // This helps in dynamically determining digit range boundaries without hardcoding.
    const retrievePowerOfTen = (exponentValue) => {
        // Guard against non-positive exponents, returning 0 as a safe default.
        if (exponentValue < 0) {
            console.warn("Warning: Attempted to calculate power of 10 with a negative exponent.");
            return 0;
        }
        return Math.pow(10, exponentValue);
    };

    // Determine the maximum number of digits the targetCeiling has.
    // This guides the iteration to cover all relevant digit lengths.
    const maxDigitsInTarget = String(targetCeiling).length;

    // Iterate through each possible number of digits, from 1 up to the maximum digits
    // present in the targetCeiling.
    for (let currentDigitLength = 1; currentDigitLength <= maxDigitsInTarget; currentDigitLength++) {
        // Calculate the inclusive lower bound for numbers having 'currentDigitLength' digits.
        // E.g., for 1 digit, lower bound is 1 (10^0). For 3 digits, lower bound is 100 (10^2).
        const currentLowerBound = retrievePowerOfTen(currentDigitLength - 1);
        
        // Calculate the inclusive upper bound for numbers having 'currentDigitLength' digits.
        // E.g., for 1 digit, upper bound is 9 (10^1 - 1). For 3 digits, upper bound is 999 (10^3 - 1).
        const currentUpperBound = retrievePowerOfTen(currentDigitLength) - 1;

        // Only consider digit lengths that are odd (1, 3, 5, etc.) for our count.
        if (currentDigitLength % 2 !== 0) {
            // Determine the effective upper limit for the current range.
            // It's the smaller of the targetCeiling or the natural upper bound for numbers
            // with 'currentDigitLength' digits.
            const effectiveRangeUpper = Math.min(targetCeiling, currentUpperBound);

            // If the effective upper limit is greater than or equal to the current lower bound,
            // it means there are numbers in this odd-digit range that contribute to the total.
            if (effectiveRangeUpper >= currentLowerBound) {
                // Add the count of numbers within this specific odd-digit range.
                // The count is (effective upper bound - lower bound + 1).
                accumulatedOddDigitNumbers += (effectiveRangeUpper - currentLowerBound + 1);
            }
        }
    }

    // Display the final computed count to the standard output.
    console.log(accumulatedOddDigitNumbers);
}

// Standard boilerplate for competitive programming environments:
// This section reads data from standard input and passes it to the main processing function.
// It is typically left untouched to ensure compatibility with automated testing systems.
const fileIOManager = require("fs");
const standardInputDevicePath = "/dev/stdin";
const characterEncodingScheme = "utf8";

// Synchronously read the entire content of the standard input stream.
const rawDataFromInput = fileIOManager.readFileSync(standardInputDevicePath, characterEncodingScheme);

// Execute the primary calculation logic with the obtained input data.
calculateSpecialNumberCount(rawDataFromInput);