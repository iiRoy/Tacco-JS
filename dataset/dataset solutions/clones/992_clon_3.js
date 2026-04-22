(function processInputAndCompute() {
    // Retrieve raw input data from the standard input stream.
    // This assumes an environment where '/dev/stdin' is available,
    // typical for competitive programming or specific Node.js setups.
    const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Perform initial validation on the raw input string.
    // Check for null, undefined, or non-string values.
    if (!rawInputContent || typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
        console.error("Error: Input data is missing or invalid. Please provide at least two numbers separated by spaces.");
        // Terminate execution gracefully if input is unusable.
        process.exit(1);
    }

    // Process the raw string:
    // 1. Trim leading/trailing whitespace.
    // 2. Split the string by one or more whitespace characters.
    // 3. Map each resulting string part to an integer, ensuring radix 10.
    //    Includes robust error checking for non-numeric parts.
    const numericOperands = rawInputContent.trim().split(/\s+/).map(strVal => {
        const parsedNumber = parseInt(strVal, 10);
        if (isNaN(parsedNumber)) {
            console.error(`Error: Found non-numeric input '${strVal}'. All inputs must be integers.`);
            // Throw an error to stop execution if any part is not a valid number.
            throw new Error("Invalid numeric input detected.");
        }
        return parsedNumber;
    });

    // Validate that at least two numbers were successfully parsed.
    if (numericOperands.length < 2) {
        console.error("Error: Insufficient numbers provided. Expected at least two integers for GCD calculation.");
        process.exit(1);
    }

    // Extract the first two numbers from the parsed array.
    // Using shift() modifies the array, but it's acceptable here as we only need the first two.
    const firstValue = numericOperands.shift();
    const secondValue = numericOperands.shift();

    // Invoke the primary function to compute the Greatest Common Divisor (GCD)
    // and display the result to the console.
    const computedGCD = computeGreatestCommonDivisor(firstValue, secondValue);
    console.log(computedGCD);
})(); // End of the self-executing anonymous function.

/**
 * Computes the Greatest Common Divisor (GCD) of two integers.
 * This function utilizes a helper to first determine all common divisors,
 * then identifies the largest among them.
 *
 * @param {number} numA - The first integer for GCD calculation.
 * @param {number} numB - The second integer for GCD calculation.
 * @returns {number} The greatest common divisor of numA and numB.
 *                   Returns 0 if both inputs are 0, or if no positive common divisors are found.
 */
function computeGreatestCommonDivisor(numA, numB) {
    // Obtain the list of all shared divisors between numA and numB.
    // This helper function handles edge cases like zero or negative inputs.
    const allSharedDivisors = enumerateCommonDivisors(numA, numB);

    // If the helper function returns an empty or null list (which it shouldn't for valid inputs,
    // as 1 is always a common divisor for non-zero numbers), return 0.
    // Math.max on an empty array would result in -Infinity, which is not desired for GCD.
    if (!allSharedDivisors || allSharedDivisors.length === 0) {
        return 0; // Default or error value for cases without common positive divisors.
    }

    // Use the spread operator to efficiently find the maximum value in the array.
    // This is a modern JavaScript equivalent to Math.max.apply(null, array).
    return Math.max(...allSharedDivisors);
}

/**
 * Determines and returns an array of all positive common divisors for two given integers.
 * This implementation first finds the GCD using the Euclidean algorithm, then generates
 * all divisors of that GCD. This set of divisors is precisely the set of all common divisors
 * of the original two numbers.
 *
 * @param {number} inputX - The first integer.
 * @param {number} inputY - The second integer.
 * @returns {number[]} An array containing all positive common divisors, sorted in ascending order.
 *                     Returns [0] if both inputX and inputY are zero.
 */
function enumerateCommonDivisors(inputX, inputY) {
    // Input sanitization: ensure we are working with integers.
    // Floats will be truncated.
    if (!Number.isInteger(inputX) || !Number.isInteger(inputY)) {
        console.warn("Warning: Non-integer values provided to enumerateCommonDivisors. Values will be floored.");
        inputX = Math.floor(inputX);
        inputY = Math.floor(inputY);
    }

    // Work with absolute values to handle negative inputs consistently,
    // as GCD is typically defined for positive integers or as abs(GCD(a,b)).
    let currentX = Math.abs(inputX);
    let currentY = Math.abs(inputY);

    // Handle special cases involving zero inputs for GCD calculation.
    if (currentX === 0 && currentY === 0) {
        // The GCD of (0, 0) is conventionally 0 or undefined.
        // Returning [0] ensures Math.max yields 0.
        return [0];
    }
    if (currentX === 0) {
        // GCD(0, N) = N. The common divisors are the divisors of N.
        // Set currentX to currentY so the subsequent divisor finding loop works correctly.
        currentX = currentY;
        currentY = 0; // Prepare for the Euclidean loop logic (though it won't run).
    } else if (currentY === 0) {
        // GCD(N, 0) = N. CurrentX already holds N.
        // No change needed; currentX is already the GCD for this case.
    } else {
        // Apply the Euclidean algorithm to find the GCD for non-zero numbers.
        // This loop continues until currentY becomes 0, at which point currentX holds the GCD.
        while (currentY !== 0) {
            const remainderTemp = currentY;
            currentY = currentX % currentY;
            currentX = remainderTemp;
        }
    }

    // At this stage, `currentX` contains the GCD of the original `inputX` and `inputY`.
    // Now, find all positive divisors of this GCD. These are precisely all the common divisors.
    const collectedFactors = [];
    const finalGCD = Math.abs(currentX); // Ensure the GCD is positive for divisor finding.

    // If the final GCD is 0 (e.g., from GCD(0,0)), return [0] as defined.
    if (finalGCD === 0) {
        return [0];
    }

    // Optimize divisor finding: iterate up to the square root of the number.
    // If 'i' divides 'finalGCD', then 'finalGCD / i' also divides 'finalGCD'.
    for (let candidateDivisor = 1; candidateDivisor * candidateDivisor <= finalGCD; candidateDivisor++) {
        if (finalGCD % candidateDivisor === 0) {
            collectedFactors.push(candidateDivisor);
            // Avoid adding the same factor twice if it's a perfect square root.
            if (candidateDivisor * candidateDivisor !== finalGCD) {
                collectedFactors.push(finalGCD / candidateDivisor);
            }
        }
    }

    // Sort the factors in ascending order for consistency, though not strictly required for Math.max.
    collectedFactors.sort((a, b) => a - b);

    return collectedFactors;
}