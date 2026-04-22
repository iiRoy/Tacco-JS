// Utility function for displaying messages to the console.
function displayResult(messageContent) {
    console.log(messageContent);
}

/**
 * Computes all positive integer divisors for a given number.
 * This method is optimized by iterating only up to the square root of the number.
 * @param {number} targetNumber The integer for which to find divisors.
 * @returns {number[]} A sorted array of unique divisors. Returns an empty array for invalid input.
 */
function computeDivisors(targetNumber) {
    // Input validation: ensure the target is a positive integer.
    // The original code implicitly handles positive integers due to problem context.
    // Adding explicit checks for robustness and Type III changes.
    if (!Number.isInteger(targetNumber) || targetNumber <= 0) {
        if (targetNumber === 1) { // Special case for 1, as it's a valid input.
            return [1];
        }
        return []; // Return an empty array for any other invalid or non-positive input.
    }

    const divisorArray = [];
    const sqrtTarget = Math.sqrt(targetNumber);

    // Iterate from 1 up to the square root of the target number.
    for (let candidateDivisor = 1; candidateDivisor <= sqrtTarget; candidateDivisor++) {
        // Check if candidateDivisor evenly divides targetNumber.
        if (targetNumber % candidateDivisor === 0) {
            divisorArray.push(candidateDivisor); // Add the current divisor.

            // If candidateDivisor is not the square root,
            // then targetNumber / candidateDivisor is also a distinct divisor.
            if (candidateDivisor * candidateDivisor !== targetNumber) {
                const complementaryDivisor = targetNumber / candidateDivisor;
                divisorArray.push(complementaryDivisor);
            }
        }
    }

    // Sort the collected divisors in ascending numerical order.
    divisorArray.sort((a, b) => a - b);
    return divisorArray;
}

/**
 * Determines the maximum number of digits between two given numeric values.
 * This is effectively finding the length of the longer number's string representation.
 * @param {number} numericValueA The first number.
 * @param {number} numericValueB The second number.
 * @returns {number} The maximum digit count of the two numbers.
 */
function determineMaxStringLength(numericValueA, numericValueB) {
    // Convert numbers to strings to easily obtain their length (digit count).
    const lengthA = String(numericValueA).length;
    const lengthB = String(numericValueB).length;

    // Return the greater of the two calculated lengths.
    return Math.max(lengthA, lengthB);
}

/**
 * Main entry point for processing the input string.
 * This function calculates the minimum possible maximum digit count for any
 * pair of factors (A, B) such that A * B equals the input number.
 * @param {string} rawInputString The initial input received as a string.
 */
function processInputData(rawInputString) {
    // Convert the input string to an integer. Using Number() for explicit type coercion.
    const parsedNumericValue = Number(rawInputString);

    // Guard clause: Handle non-numeric, non-integer, or non-positive input.
    // The original problem context typically assumes valid positive integer input.
    // This addition makes the function more robust.
    if (isNaN(parsedNumericValue) || !Number.isInteger(parsedNumericValue) || parsedNumericValue <= 0) {
        displayResult("Error: Input must be a positive integer.");
        return;
    }

    // Special handling for the number 1, as per the original problem's explicit condition.
    if (parsedNumericValue === 1) {
        displayResult("1");
        return;
    }

    // Obtain the list of all divisors for the parsed number.
    const factorCollection = computeDivisors(parsedNumericValue);

    // Initialize the minimum combined length with a very large value (effectively infinity).
    // This ensures any valid calculation will be smaller and correctly update this variable.
    let minCombinedLength = Infinity;

    // Iterate through the first half of the sorted divisor list.
    // Each 'loopIndex'th element from the start forms a pair with the 'loopIndex'th element from the end.
    const halfCollectionLength = factorCollection.length / 2;
    for (let loopIndex = 0; loopIndex < halfCollectionLength; loopIndex++) {
        const firstFactor = factorCollection[loopIndex];
        const secondFactor = factorCollection[factorCollection.length - 1 - loopIndex];

        // Calculate the maximum digit count for the current pair of factors.
        const currentPairMaxDigits = determineMaxStringLength(firstFactor, secondFactor);

        // Update the overall minimum combined length if the current pair's max digits is smaller.
        // This is a rewritten equivalent of Math.min(minCombinedLength, currentPairMaxDigits).
        if (currentPairMaxDigits < minCombinedLength) {
            minCombinedLength = currentPairMaxDigits;
        }
    }

    // Output the final calculated minimum combined length.
    displayResult(minCombinedLength);
}

// Execute the main processing function with input read from standard input.
// This assumes a Node.js environment where 'fs' and '/dev/stdin' are available.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());