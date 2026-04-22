// This module processes numerical inputs from standard input to perform division
// and extract various components of the result: integer quotient, remainder, and float quotient.

(function(rawData) {
    // --- Input Acquisition and Initial Validation ---

    // Ensure raw data is provided and is of expected type.
    // This adds a robust guard clause for unexpected input scenarios.
    if (!rawData || typeof rawData !== 'string' || rawData.trim() === '') {
        console.error("Error: No valid string input received. Please provide numerical data.");
        // Terminate execution gracefully if input is fundamentally flawed.
        return;
    }

    // Process the raw string:
    // 1. Trim leading/trailing whitespace.
    // 2. Split by one or more whitespace characters to handle various spacing.
    // 3. Filter out any empty strings that might result from multiple spaces.
    const inputTokens = rawData.trim().split(/\s+/).filter(token => token !== '');

    // Check if we have the minimum required number of tokens.
    if (inputTokens.length < 2) {
        console.error("Error: Insufficient numerical tokens provided. Expected at least two numbers.");
        return;
    }

    // Convert the string tokens into numerical values.
    // Using parseFloat for broader compatibility (integers or decimals).
    const primaryDivisor = parseFloat(inputTokens[0]); // Renamed 'a'
    const secondaryDividend = parseFloat(inputTokens[1]); // Renamed 'b'

    // Validate that the parsed values are indeed numbers.
    if (isNaN(primaryDivisor) || isNaN(secondaryDividend)) {
        console.error("Error: Failed to parse one or more inputs as valid numbers.");
        return;
    }

    // --- Core Calculation Logic ---

    // Implement a crucial guard clause: prevent division by zero.
    if (secondaryDividend === 0) {
        console.error("Error: Division operation cannot proceed with a zero divisor.");
        // Depending on specific requirements, a different output (e.g., 'Infinity')
        // might be needed instead of just an error. For this clone, erroring out is acceptable.
        return;
    }

    // Step 1: Calculate the exact floating-point division result.
    // This serves as an intermediate step and also the final float quotient.
    const preciseQuotient = primaryDivisor / secondaryDividend; // Renamed 'f'

    // Step 2: Determine the integer part of the division.
    // Using Math.floor to match the original behavior precisely, especially for negative numbers.
    const integerResult = Math.floor(preciseQuotient); // Renamed 'd'

    // Step 3: Compute the remainder of the division.
    // The modulo operator (%) correctly handles both positive and negative inputs
    // consistent with JavaScript's behavior for 'a % b'.
    const remainderValue = primaryDivisor % secondaryDividend; // Renamed 'r'

    // --- Output Generation ---

    // Present the calculated results using a modern template literal for clarity and flexibility.
    // The order of output (integer quotient, remainder, float quotient) is maintained.
    console.log(`${integerResult} ${remainderValue} ${preciseQuotient}`);

// The self-executing function immediately calls itself with the content of stdin.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));