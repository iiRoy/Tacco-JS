const retrieveDigitCount = (valueToCheck) => {
    // If the value is zero, it has one digit.
    if (valueToCheck === 0) {
        return 1;
    }
    // Convert the absolute value of the number to a string and return its length.
    // This correctly handles negative numbers and ensures consistent digit counting.
    return String(Math.abs(valueToCheck)).length;
};

const analyzeFactorDigitSpans = (rawInputData) => {
    // Attempt to parse the input string into an integer with base 10.
    const targetInteger = Number.parseInt(rawInputData, 10);

    // --- Input Validation and Edge Cases ---
    // Ensure the parsed value is a valid positive integer.
    // The problem context implies positive integers, so handle non-positive or non-numeric inputs.
    if (Number.isNaN(targetInteger) || targetInteger <= 0) {
        console.error("Error: Input must be a positive integer.");
        return; // Exit the function gracefully.
    }

    // Special case for 1: Its only factor pair is (1,1), max length is 1.
    if (targetInteger === 1) {
        console.log(1);
        return;
    }

    // --- Initialization ---
    // Initialize the variable to store the shortest maximum digit span found so far.
    // It's initially set to the digit count of the target integer itself,
    // as (1, targetInteger) is always a factor pair.
    let shortestMaxDigitSpan = retrieveDigitCount(targetInteger);

    // Pre-calculate the square root of the target integer.
    // We only need to iterate up to the square root to find all unique factor pairs (a, b).
    // If 'a' is a factor, 'targetInteger / a' is also a factor.
    const iterationLimit = Math.sqrt(targetInteger);

    // --- Factor Iteration and Comparison ---
    // Loop through potential divisors starting from 1 up to and including the square root.
    // Using 'let' for the loop counter as it's modified within the loop's scope.
    for (let currentCandidate = 1; currentCandidate <= iterationLimit; currentCandidate++) {
        // Check if the current candidate is a perfect divisor of the target integer.
        if (targetInteger % currentCandidate === 0) {
            // If it is a divisor, calculate its corresponding pair factor.
            const correspondingFactor = targetInteger / currentCandidate;

            // Determine the number of digits for both factors in the pair using the helper.
            const digitsInFirstFactor = retrieveDigitCount(currentCandidate);
            const digitsInSecondFactor = retrieveDigitCount(correspondingFactor);

            // Find the maximum digit count within this specific factor pair.
            const currentPairMaxDigits = Math.max(digitsInFirstFactor, digitsInSecondFactor);

            // Update the overall shortest maximum digit span if a smaller one is found.
            // This ensures we always store the minimum of these maximums.
            if (currentPairMaxDigits < shortestMaxDigitSpan) {
                shortestMaxDigitSpan = currentPairMaxDigits;
            }
        }
    }

    // --- Output Result ---
    // Print the final calculated result to standard output.
    // Using a template literal for clarity in output formatting.
    console.log(`${shortestMaxDigitSpan}`);
};

// --- Execution Entry Point ---
// Read input from standard input using Node.js file system module.
// Ensure the input is treated as UTF-8 encoded text.
try {
    const systemInput = require("fs").readFileSync("/dev/stdin", "utf8");
    // Call the main processing function with the read input, after trimming any leading/trailing whitespace.
    analyzeFactorDigitSpans(systemInput.trim());
} catch (error) {
    // Basic error handling for issues during file reading or other unexpected runtime errors.
    console.error(`An error occurred during input processing: ${error.message}`);
}