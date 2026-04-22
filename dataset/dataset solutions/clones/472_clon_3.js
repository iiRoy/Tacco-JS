// Helper function to determine the greatest common divisor (GCD) of two numbers.
// This function implements the Euclidean algorithm for calculating GCD.
function determineCommonDivisor(firstValue, secondValue) {
    // A robust GCD function should handle potential negative inputs,
    // so we take the absolute value of both numbers. This is a new guard.
    let currentLarge = Math.abs(firstValue);
    let currentSmall = Math.abs(secondValue);

    // Ensure 'currentLarge' always holds the larger value initially for consistent algorithm flow.
    // This explicitly replaces the Math.max/min from the original, making it a rewrite.
    if (currentLarge < currentSmall) {
        // Using ES6 destructuring for a cleaner swap.
        [currentLarge, currentSmall] = [currentSmall, currentLarge];
    }

    // The core of the Euclidean algorithm.
    // The loop continues as long as the smaller number is not zero.
    // Changed condition from '!= 0' to '> 0' for clarity with positive integers.
    while (currentSmall > 0) {
        // Calculate the remainder when the larger number is divided by the smaller.
        // Introducing a named variable 'remainder' for clarity.
        let remainder = currentLarge % currentSmall;
        // The smaller number becomes the new larger number.
        currentLarge = currentSmall;
        // The remainder becomes the new smaller number.
        currentSmall = remainder;
    }
    // When 'currentSmall' becomes zero, 'currentLarge' holds the GCD.
    return currentLarge;
}

// Helper function to compute the least common multiple (LCM) of two numbers.
// It leverages the relationship: LCM(a, b) = (a * b) / GCD(a, b).
function calculateLeastCommonMultiple(valA, valB) {
    // Guard clause: If either value is zero, their LCM is typically considered zero
    // in contexts involving positive integers, or undefined.
    if (valA === 0 || valB === 0) {
        return 0;
    }
    // To prevent potential integer overflow with very large numbers,
    // it's safer to divide by GCD first before multiplying.
    // This is a subtle rewrite for robustness.
    return (valA / determineCommonDivisor(valA, valB)) * valB;
}

// Acquire the file system module. Storing it in a constant variable is a Type III change.
const fileSystemHandler = require('fs');

// Read the entire content from standard input, decode as UTF-8.
const rawInputContent = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');

// Pre-process the input:
// 1. Trim leading/trailing whitespace.
// 2. Split the content into an array of lines based on newline characters.
// 3. Filter out any empty strings that might result from splitting or trimming,
//    ensuring only lines with actual content are processed. This is a new fragment.
let processedInputLines = rawInputContent.trim().split("\n").filter(line => line.length > 0);

// Main processing loop: iterates through test cases.
// It continues indefinitely until a specific termination condition is met.
while (true) {
    // Extract the number of fraction pairs for the current test case.
    // Use parseInt with radix for explicit and safe type conversion.
    const currentPairCount = parseInt(processedInputLines.shift(), 10);

    // Termination condition: if the extracted count is 0, exit the loop.
    if (currentPairCount === 0) {
        break;
    }

    // An array to hold fractions after they have been simplified.
    // Each fraction is stored as [numerator, denominator].
    let simplifiedFractionList = [];

    // Loop through each of the 'currentPairCount' lines to process fraction pairs.
    for (let currentPairIndex = 0; currentPairIndex < currentPairCount; currentPairIndex++) {
        // Read a line, split it by space, and convert both parts to numbers.
        const fractionComponents = processedInputLines.shift().split(" ").map(Number);

        // Input validation: ensure exactly two numeric components were parsed.
        // This is a new guard clause.
        if (fractionComponents.length !== 2 || isNaN(fractionComponents[0]) || isNaN(fractionComponents[1])) {
            // In a real scenario, one might log an error or skip, or throw.
            // For this clone, we'll just skip to the next pair if malformed.
            continue;
        }

        const numeratorValue = fractionComponents[0];
        const denominatorValue = fractionComponents[1];

        // Calculate the GCD of the numerator and denominator to reduce the fraction to its simplest form.
        const commonFactor = determineCommonDivisor(numeratorValue, denominatorValue);

        // Store the simplified fraction in the list.
        simplifiedFractionList.push([numeratorValue / commonFactor, denominatorValue / commonFactor]);
    }

    // --- Step 1: Calculate the LCM of all denominators from the simplified fractions. ---
    // Initialize the common denominator LCM. If the list is empty, LCM remains 0.
    let currentCommonDenomLCM = simplifiedFractionList.length > 0 ? 1 : 0;

    // Iterate through the list of simplified fractions.
    // Using a 'for...of' loop for iteration, which is a rewrite of 'forEach'.
    for (const currentFraction of simplifiedFractionList) {
        // The denominator is the second element of the fraction array.
        currentCommonDenomLCM = calculateLeastCommonMultiple(currentCommonDenomLCM, currentFraction[1]);
    }

    // --- Step 2: Scale the numerators to this common denominator. ---
    // This step transforms each fraction a/b into (a * currentCommonDenomLCM / b) / currentCommonDenomLCM.
    // We only store the new numerator part.
    let scaledNumerators = simplifiedFractionList.map(fractionEntry => {
        // Guard against division by zero if a denominator somehow became zero.
        if (fractionEntry[1] === 0) {
            // Depending on problem requirements, might return 0, Infinity, or throw an error.
            return 0; // Returning 0 as a placeholder for a problematic fraction.
        }
        return fractionEntry[0] * (currentCommonDenomLCM / fractionEntry[1]);
    });

    // --- Step 3: Calculate the LCM of these newly scaled numerators. ---
    // This is the final LCM required for the problem's output.
    let finalOverallLCM = scaledNumerators.length > 0 ? 1 : 0;

    // Using the 'reduce' method for a more functional and concise way to calculate the LCM
    // across the array of scaled numerators. This is a rewrite of a forEach loop.
    finalOverallLCM = scaledNumerators.reduce((accumulatorLCM, currentNumerator) => {
        return calculateLeastCommonMultiple(accumulatorLCM, currentNumerator);
    }, finalOverallLCM); // Ensure the initial value for reduce is correctly passed.

    // --- Step 4: Output the final results. ---
    // For each scaled numerator, print the final overall LCM divided by that numerator.
    // Using a 'for...of' loop for the final output, another rewrite.
    for (const individualScaledNumerator of scaledNumerators) {
        // Another guard: prevent division by zero if a scaled numerator is 0.
        if (individualScaledNumerator === 0) {
            // Depending on context, might output "0", "Infinity", or an error.
            console.log("0");
        } else {
            console.log(finalOverallLCM / individualScaledNumerator);
        }
    }
}