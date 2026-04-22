/*
 * This module processes a series of numerical queries from standard input.
 * Each query involves calculations based on two input numbers.
 */
function ProcessInput(inputDataString) {
    // Split the entire input string into individual lines for easier parsing
    const inputLines = inputDataString.split('\n');

    // The first line indicates the total count of operations to perform
    const numQueries = parseInt(inputLines[0], 10);

    // Loop through each query entry
    for (let queryIndex = 0; queryIndex < numQueries; queryIndex++) {
        // Parse the current query line, which contains two space-separated numeric values
        // Convert string values to integer numbers using `parseInt` for explicit type conversion
        const currentPair = inputLines[queryIndex + 1].split(' ').map(val => parseInt(val, 10));

        // Determine the greater and lesser values from the parsed pair
        const largerValue = Math.max(currentPair[0], currentPair[1]);
        const smallerValue = Math.min(currentPair[0], currentPair[1]);

        // Execute a multi-step calculation involving a custom large number multiplication
        // followed by a custom large number square root extraction, then decrementing the result
        const computedRoot = calculateLargeSquareRoot(multiplyLargeNumbers(smallerValue, largerValue)) - 1;

        // Initialize the final outcome with a base calculation
        let finalResult = (smallerValue - 1) * 2;

        // Apply a conditional adjustment to the outcome
        if (smallerValue < largerValue - 1) {
            finalResult++;
        }

        // Further modify the outcome based on the computed root, ensuring non-negative values
        finalResult += Math.max(computedRoot - smallerValue, 0) * 2;

        // Perform a final conditional adjustment based on a specific division and equality test
        if (Math.floor(smallerValue / computedRoot * largerValue) === computedRoot) {
            finalResult--;
        }

        // Print the calculated final result for the current query to the console
        console.info(finalResult);
    }
}

/**
 * Computes the integer part of the square root of a very large number provided as a string.
 * This implementation is designed to handle numbers exceeding JavaScript's standard `Number` precision.
 * The algorithm mimics a manual long division method for square roots.
 * @param {string} numberAsString - The large number represented as a string.
 * @returns {number} The integer square root, rounded up if there's any remainder.
 */
function calculateLargeSquareRoot(numberAsString) {
    const stringLength = numberAsString.length;
    let currentRemainder; // Holds the current segment of the number being processed
    let currentRoot;      // Accumulates the digits of the square root

    // Initialize the first segment for calculation based on the string's length parity
    if (stringLength % 2 !== 0) { // If length is odd, take the first digit
        currentRemainder = parseInt(numberAsString[0], 10);
    } else { // If length is even, take the first two digits
        currentRemainder = parseInt(numberAsString.substring(0, 2), 10);
    }

    // Determine the initial digit of the square root
    currentRoot = Math.floor(Math.sqrt(currentRemainder));

    // Update the remainder and set up the divisor part for subsequent steps
    currentRemainder -= currentRoot * currentRoot;
    let divisorPart = currentRoot;

    // Iterate through the remaining pairs of digits in the input string
    // The starting position of the digit pairs depends on whether the string length is odd or even
    for (let digitPos = (stringLength % 2 === 0 ? 2 : 1); digitPos < stringLength; digitPos += 2) {
        // Prepare the divisor part for the current step according to the algorithm's specific rule
        divisorPart = (divisorPart + (divisorPart % 10)) * 10;

        // Bring down the next two digits to append to the current remainder
        currentRemainder = currentRemainder * 100 + parseInt(numberAsString.substring(digitPos, digitPos + 2), 10);

        // Find the largest possible digit candidate for the current root position
        // This candidate, when added to divisorPart and multiplied by itself, must not exceed currentRemainder
        let digitCandidate;
        for (digitCandidate = 1; digitCandidate <= 9; digitCandidate++) {
            if (currentRemainder - (divisorPart + digitCandidate) * digitCandidate < 0) {
                break;
            }
        }
        digitCandidate--; // Decrement to get the correct digit that satisfies the condition

        // Append the found digit to the accumulating square root
        currentRoot = currentRoot * 10 + digitCandidate;

        // Subtract the product from the current remainder
        currentRemainder -= (divisorPart + digitCandidate) * digitCandidate;

        // Update the divisor part for the next iteration by adding the found digit
        divisorPart += digitCandidate;
    }

    // If there is any non-zero remainder after all calculations, increment the root
    // This effectively makes the function return `ceil(sqrt(N))` for non-perfect squares.
    if (currentRemainder > 0) {
        currentRoot++;
    }

    return currentRoot;
}

/**
 * Multiplies two integers (each less than 2^32) and returns their product as a string.
 * This approach is used to handle results that might exceed JavaScript's `Number.MAX_SAFE_INTEGER`.
 * It splits one factor into parts to perform multiplication and manage carries.
 * @param {number} factorX - The first integer factor.
 * @param {number} factorY - The second integer factor.
 * @returns {string} The product of factorX and factorY as a string.
 */
function multiplyLargeNumbers(factorX, factorY) {
    const fiveDigitBase = 100000; // A base value for splitting numbers (10^5)

    // Calculate the product of the lower part of factorX and factorY
    let lowPartProduct = (factorX % fiveDigitBase) * factorY;

    // Calculate the product of the higher part of factorX and factorY,
    // and add any carry-over from the lower part product
    let highPartProduct = Math.floor(factorX / fiveDigitBase) * factorY + Math.floor(lowPartProduct / fiveDigitBase);

    // Keep only the lower 5 digits of the low part product
    lowPartProduct %= fiveDigitBase;

    // Format the resulting parts into a string
    if (highPartProduct > 0) {
        // If there's a significant high part, pad the low part with leading zeros to 5 digits
        lowPartProduct = ('00000' + lowPartProduct).slice(-5);
    } else {
        // If the high part is zero, it won't be displayed, so clear its string representation
        highPartProduct = '';
    }

    // Concatenate the high and low parts to form the final string product
    return highPartProduct + lowPartProduct;
}

// Initiate the program by reading the entire content of standard input
// and passing it to the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));