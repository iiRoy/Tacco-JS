function computeSumOfDigits(numericalValue) {
    // Ensure the input is treated as a positive number for digit summation.
    // This adds robustness for potential negative intermediate products, though not expected here.
    let absoluteValue = Math.abs(numericalValue);

    // Convert the number to a string, then split it into an array of character digits.
    // Use reduce to sum up the numerical values of these digits.
    return String(absoluteValue)
        .split('')
        .reduce((accumulator, currentDigitChar) => {
            // Convert each character back to a number before adding to the sum.
            const digit = Number(currentDigitChar);
            return accumulator + digit;
        }, 0); // Start the sum from zero.
}

// This function processes the raw input data to find the minimum digit sum.
function handleInputAndProcess(rawInputContent) {
    // --- Type III: Guard clauses for input validation ---
    if (!rawInputContent || typeof rawInputContent !== 'string' || rawInputContent.trim() === '') {
        console.error("Input data is empty or invalid. Please provide valid string input.");
        return; // Exit early if input is invalid
    }

    // --- Type II: Renaming identifiers and adjusting whitespace ---
    const contentLines = rawInputContent.trim().split('\n');

    if (contentLines.length === 0) {
        console.error("No valid lines found in the provided input. Exiting processing.");
        return;
    }

    // Extract the primary factor from the first line of input.
    // --- Type III: Intermediate variable, Type II: Using Number() instead of parseInt() ---
    const firstLineValues = contentLines.shift().split(' ');
    const primaryFactor = Number(firstLineValues[0]);

    // --- Type III: Additional validation for the primary factor ---
    if (isNaN(primaryFactor) || primaryFactor <= 0) { // Assuming K must be a positive integer
        console.error("Invalid primary factor received. It must be a positive numerical value. Exiting.");
        return;
    }

    // --- Type III: Introduce a constant for the loop limit ---
    const MAXIMUM_ITERATIONS_LIMIT = 100000;
    // --- Type III: Using Number.MAX_SAFE_INTEGER as initial maximum for finding minimum ---
    let overallMinimumDigitSum = Number.MAX_SAFE_INTEGER;

    // Iterate through a range to find multiples and calculate their digit sums.
    // --- Type II: Renaming loop variables ---
    for (let currentIteration = 1; currentIteration <= MAXIMUM_ITERATIONS_LIMIT; currentIteration++) {
        // --- Type III: Introduce an intermediate variable for the product ---
        const multipliedValue = primaryFactor * currentIteration;

        // Calculate the sum of digits using the dedicated helper function.
        const currentCalculatedSum = computeSumOfDigits(multipliedValue);

        // --- Type III: Rewrite condition using Math.min for conciseness ---
        overallMinimumDigitSum = Math.min(overallMinimumDigitSum, currentCalculatedSum);

        // --- Type III: Deletion of redundant statement.
        // The original code had `current=0;` here, which is unnecessary
        // as `currentCalculatedSum` is re-assigned each iteration.
    }

    // Output the final minimum digit sum found.
    // --- Type II: Renamed variable in output ---
    console.log(overallMinimumDigitSum);
}

// --- Type III: Added try-catch block for robust file system interaction ---
// --- Type II: Using 'node:fs' for modern Node.js standard library access ---
try {
    const fileSystemModule = require('node:fs'); // Standard library module for file operations
    const inputSourcePath = '/dev/stdin'; // Standard input file path

    // Read the file content synchronously and decode it as UTF-8.
    const fileContent = fileSystemModule.readFileSync(inputSourcePath, 'utf8');

    // Process the content obtained from the file.
    handleInputAndProcess(fileContent);
} catch (fileError) {
    // Handle potential errors during file reading.
    console.error("An error occurred while attempting to read input from /dev/stdin:", fileError.message);
    // --- Type III: Exit with an error code to indicate failure ---
    process.exit(1);
}