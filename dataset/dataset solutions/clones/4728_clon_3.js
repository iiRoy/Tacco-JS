"use strict";

/**
 * This module provides a function to analyze a sequence of numbers from input
 * and determine a specific property based on their parity counts.
 * It's a Type III code clone, demonstrating significant structural and naming changes
 * while preserving the original functional outcome.
 *
 * Original intent:
 * Given an integer N and an array A of N integers,
 * count the number of odd elements. If this count is an odd number, output "NO".
 * Otherwise (if the count of odd elements is an even number), output "YES".
 */
function analyzeNumericSequence(rawInputData) {
    // Basic input validation: ensure we have a string to work with.
    if (typeof rawInputData !== 'string' || rawInputData.length === 0) {
        console.error("Input data is empty or not a valid string. Cannot proceed with analysis.");
        // Consider throwing an error or returning a specific status in a more robust system.
        return null;
    }

    // --- Data Preprocessing Stage ---

    // Split the raw input into individual lines.
    // Using a regular expression for split to handle potential variations in line endings.
    const dataSegments = rawInputData.trim().split(/\r?\n/);

    // Ensure there are at least two lines: one for count, one for numbers.
    if (dataSegments.length < 2) {
        console.error("Insufficient input lines. Expected at least two lines.");
        return null;
    }

    // Extract the specified number of elements from the first line.
    // Using parseInt with radix for robust conversion.
    const specifiedElementCount = parseInt(dataSegments[0], 10);

    // Validate the extracted count.
    if (isNaN(specifiedElementCount) || specifiedElementCount < 0) {
        console.error("Invalid or non-positive element count provided in the first line.");
        return null;
    }

    // Process the second line to get the array of numbers.
    // A helper utility to parse space-separated numerical strings.
    const parseNumberArray = (numberString) => {
        // Split by one or more whitespace characters to handle multiple spaces.
        return numberString.trim().split(/\s+/).map(val => {
            const parsed = parseInt(val, 10);
            if (isNaN(parsed)) {
                // Log a warning if a non-numeric value is found, but try to continue.
                console.warn(`Non-numeric value "${val}" encountered and will be skipped/treated as 0.`);
                return 0; // Or handle as an error, depending on strictness.
            }
            return parsed;
        });
    };

    const numericalDataArray = parseNumberArray(dataSegments[1]);

    // Optional: Cross-validate the actual array length with the specified count.
    if (numericalDataArray.length !== specifiedElementCount) {
        console.warn(`Mismatch: Expected ${specifiedElementCount} elements, but found ${numericalDataArray.length}. Proceeding with actual count.`);
    }

    // --- Core Logic: Parity Counting Stage ---

    // Initialize separate accumulators for even and odd numbers.
    let countOfEvenElements = 0;
    let countOfOddElements = 0;

    // Define a utility function for checking oddness.
    // Using the bitwise AND operator is an efficient way to check for odd numbers.
    const isValueOdd = (num) => (num & 1) === 1;

    // Iterate through the numerical data collection.
    // Using a traditional for-loop with a different iteration variable.
    for (let elementIndex = 0; elementIndex < numericalDataArray.length; ++elementIndex) {
        const currentNumericItem = numericalDataArray[elementIndex];

        // Increment the appropriate counter.
        if (isValueOdd(currentNumericItem)) {
            countOfOddElements++;
        } else {
            countOfEvenElements++;
        }
    }

    // --- Final Decision Stage ---

    // The critical condition: check if the *total count of odd elements* is itself an odd number.
    const isFinalOddCountItselfOdd = isValueOdd(countOfOddElements);

    // Output the result based on the derived condition.
    if (isFinalOddCountItselfOdd) {
        console.log('NO'); // Output 'NO' if the count of odd numbers is odd
    } else {
        console.log('YES'); // Output 'YES' if the count of odd numbers is even
    }

    // New fragment: For reusability, we can also return a boolean indicating the result.
    return !isFinalOddCountItselfOdd; // True if 'YES', false if 'NO'
}

// --- Execution Entry Point (Node.js specific) ---

// Define constants for file system operations.
const fileSystemInterface = require("fs");
const standardInputFile = "/dev/stdin";

try {
    // Read the content of the standard input file.
    const fileContentsAsString = fileSystemInterface.readFileSync(standardInputFile, "utf8");
    // Invoke the main analysis function with the obtained data.
    analyzeNumericSequence(fileContentsAsString);
} catch (fileReadError) {
    // Handle potential errors during file reading.
    console.error(`An error occurred while reading the input from "${standardInputFile}":`, fileReadError.message);
    // Exit with a non-zero status code to indicate failure in a scripting environment.
    process.exit(1);
}