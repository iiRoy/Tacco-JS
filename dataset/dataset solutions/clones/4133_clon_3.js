const calculateSumOfDigits = (numericValue) => {
    let digitAccumulator = 0;
    let temporaryNumber = numericValue; // Working copy of the number

    while (temporaryNumber > 0) {
        digitAccumulator += temporaryNumber % 10; // Add the last digit
        temporaryNumber = Math.floor(temporaryNumber / 10); // Remove the last digit
    }
    return digitAccumulator;
};

// Orchestrates the main logic based on provided string input
function executeDataProcessing(rawInputString) {
    // --- Input Validation and Parsing (Type III: Added Guard Clauses & Robust Parsing) ---
    if (typeof rawInputString !== 'string' || rawInputString.trim() === '') {
        console.error("Error: Input must be a non-empty string.");
        return; // Exit early
    }

    const inputTokens = rawInputString.trim().split(/\s+/); // More robust splitting
    if (inputTokens.length < 3) {
        console.error("Error: Insufficient parameters provided. Expected N, A, B.");
        return; // Exit early
    }

    // Parse numerical parameters with explicit base 10 and Number constructor/unary plus
    const upperLimitExclusive = Number(inputTokens[0]); // Renamed 'n' to 'upperLimitExclusive'
    const minDigitSumThreshold = +inputTokens[1];       // Renamed 'a' to 'minDigitSumThreshold'
    const maxDigitSumThreshold = Number(inputTokens[2]); // Renamed 'b' to 'maxDigitSumThreshold'

    // Validate parsed numbers (Type III: Added validation)
    if (isNaN(upperLimitExclusive) || isNaN(minDigitSumThreshold) || isNaN(maxDigitSumThreshold) || upperLimitExclusive < 1) {
        console.error("Error: Invalid numerical parameters. N, A, B must be valid numbers, and N must be at least 1.");
        return; // Exit early
    }

    // --- Sequence Generation (Type III: Rewritten Array Initialization) ---
    // Create an array containing numbers from 1 up to 'upperLimitExclusive'
    const sequentialNumbers = Array.from({ length: upperLimitExclusive }, (_, index) => index + 1); // Renamed 'array'

    // --- Filtering and Index Collection (Type III: Used Helper Function, Intermediate Variable) ---
    const eligibleEntryIndices = []; // Renamed 'result_array'
    // Iterate through each number in our sequence
    for (let currentSequenceIndex = 0; currentSequenceIndex < upperLimitExclusive; currentSequenceIndex++) { // Renamed 'j'
        const numberInFocus = sequentialNumbers[currentSequenceIndex]; // Intermediate variable for clarity

        // Calculate the sum of digits using our dedicated helper function
        const computedDigitSum = calculateSumOfDigits(numberInFocus); // Renamed 'sum' (contextual)

        // Check if the calculated digit sum falls within the specified bounds
        if (computedDigitSum >= minDigitSumThreshold && computedDigitSum <= maxDigitSumThreshold) {
            eligibleEntryIndices.push(currentSequenceIndex); // Store the index if criteria met
        }
        // No need to reset 'computedDigitSum' as it's scoped to each iteration or returned by helper
    }

    // --- Final Summation (Type III: Rewritten with Array.prototype.reduce) ---
    // Calculate the total sum of the original numbers corresponding to the eligible indices
    const overallAccumulatedSum = eligibleEntryIndices.reduce((currentTotal, indexToSum) => { // Renamed 'fin_sum'
        // Add the actual number from the sequentialNumbers array at the current index
        return currentTotal + sequentialNumbers[indexToSum];
    }, 0); // Initialize accumulator to 0

    // --- Output Result ---
    console.log(overallAccumulatedSum);
}

// --- Entry Point (Type III: Encapsulated in IIFE for better scope, added error handling) ---
(function() {
    try {
        const fileSystem = require('fs');
        const standardInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
        executeDataProcessing(standardInputContent);
    } catch (err) {
        console.error("An error occurred during input reading or processing:", err.message);
        // Optionally, provide more context or exit with a non-zero status
        // process.exit(1);
    }
})();