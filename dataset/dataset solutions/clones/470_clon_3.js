// Helper function to calculate the Greatest Common Divisor (GCD) of two non-negative integers.
// This uses the Euclidean algorithm, ensuring inputs are treated as positive for calculation.
const determineGreatestCommonDivisor = (firstValue, secondValue) => {
    let currentDividend = Math.abs(firstValue);
    let currentDivisor = Math.abs(secondValue);

    // If currentDivisor is 0, the GCD is currentDividend.
    // This also handles cases where one of the initial inputs is 0.
    if (currentDivisor === 0) {
        return currentDividend;
    }

    // The core Euclidean algorithm for finding GCD.
    // Loop continues as long as the currentDivisor is not zero.
    while (currentDivisor !== 0) {
        // Store the current divisor to become the new dividend.
        const cachedRemainder = currentDivisor;
        // Calculate the new remainder (currentDivisor).
        currentDivisor = currentDividend % currentDivisor;
        // Update the currentDividend to the previous currentDivisor.
        currentDividend = cachedRemainder;
    }
    // When currentDivisor becomes 0, currentDividend holds the GCD.
    return currentDividend;
};

// Helper function to compute the Least Common Multiple (LCM) of two integers.
// The formula used is: LCM(a, b) = |a * b| / GCD(a, b).
const computeLeastCommonMultiple = (numberOne, numberTwo) => {
    // If either number is zero, their LCM is zero by definition.
    if (numberOne === 0 || numberTwo === 0) {
        return 0;
    }
    // Calculate LCM using the GCD helper function.
    // Math.abs ensures a positive product for LCM.
    return Math.abs(numberOne * numberTwo) / determineGreatestCommonDivisor(numberOne, numberTwo);
};

// Import the Node.js File System module to read input data.
const fileSystemModule = require('fs');

// Read the entire input content from standard input (`/dev/stdin`).
// Decode it as UTF-8 and prepare it for processing.
const rawInputBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const processedInputLines = rawInputBuffer
    .trim() // Remove any leading or trailing whitespace from the whole input.
    .split('\n') // Split the content into an array of individual lines.
    .filter(line => line.length > 0); // Filter out any completely empty lines.

let currentInputLineIndex = 0; // Pointer to keep track of the next line to read from input.

// Main loop to process multiple sets of fraction calculations.
// The loop continues as long as there are lines remaining in the input buffer.
while (currentInputLineIndex < processedInputLines.length) {
    // Read the number of fraction pairs for the current test case.
    // Use Number() for explicit type conversion and fall back to 0 if parsing fails.
    const numberOfFractionPairs = Number(processedInputLines[currentInputLineIndex++]) || 0;

    // A value of 0 for numberOfFractionPairs signals the end of input data.
    if (numberOfFractionPairs === 0) {
        break; // Exit the main processing loop.
    }

    // Array to store the simplified form of each fraction [numerator, denominator].
    const normalizedFractionData = [];

    // Loop to parse, simplify, and store each fraction pair for the current test case.
    for (let fractionCounter = 0; fractionCounter < numberOfFractionPairs; ++fractionCounter) {
        // Retrieve the current line string containing the fraction components (e.g., "1 2").
        const fractionStringRepresentation = processedInputLines[currentInputLineIndex++];
        const fractionComponents = fractionStringRepresentation
            .split(/\s+/) // Split by one or more whitespace characters for robustness.
            .map(val => Number(val)) // Convert string parts to numbers.
            .filter(val => !isNaN(val)); // Remove any non-numeric results from parsing.

        // Basic validation: ensure exactly two numeric components were parsed.
        if (fractionComponents.length !== 2) {
            console.error(`Input Error: Invalid fraction format on line ${currentInputLineIndex}. Expected two numbers.`);
            continue; // Skip this malformed fraction and proceed to the next.
        }

        let currentNumerator = fractionComponents[0];
        let currentDenominator = fractionComponents[1];

        // Critical validation: check for zero denominator to prevent division by zero errors.
        if (currentDenominator === 0) {
            console.error(`Runtime Warning: Zero denominator detected for fraction ${currentNumerator}/${currentDenominator}. Skipping this fraction.`);
            continue; // Skip this invalid fraction.
        }

        // Calculate the Greatest Common Divisor to simplify the fraction.
        const commonDivisorForSimplification = determineGreatestCommonDivisor(currentNumerator, currentDenominator);

        // Store the simplified fraction in the array.
        normalizedFractionData.push([
            currentNumerator / commonDivisorForSimplification,
            currentDenominator / commonDivisorForSimplification
        ]);
    }

    // If no valid fractions were successfully processed for this set, skip to the next input set.
    if (normalizedFractionData.length === 0) {
        console.error("Processing Alert: No valid fractions found for this input set. Moving to next set.");
        continue;
    }

    // --- Stage 1: Compute the Least Common Multiple (LCM) of all simplified denominators. ---
    let combinedDenominatorsLCM = 1; // Initialize LCM accumulator to 1.
    for (const singleFraction of normalizedFractionData) {
        const denominatorPart = singleFraction[1];
        // Only include non-zero denominators in LCM calculation.
        if (denominatorPart !== 0) {
             combinedDenominatorsLCM = computeLeastCommonMultiple(combinedDenominatorsLCM, denominatorPart);
        } else {
             // If a zero denominator somehow made it here, the LCM becomes 0, indicating an issue.
             combinedDenominatorsLCM = 0;
             break; // Stop further LCM computation if an invalid denominator is found.
        }
    }

    // If the combinedDenominatorsLCM is 0, it indicates an error with the input fractions.
    if (combinedDenominatorsLCM === 0) {
        console.error("Critical Error: Cannot determine a common LCM for denominators. Skipping this set.");
        continue;
    }

    // --- Stage 2: Scale each numerator to an integer value using the combined denominator LCM. ---
    // This effectively converts all fractions to a common denominator and extracts their scaled numerators.
    const integerEquivalentNumerators = normalizedFractionData.map(fractionItem => {
        const numeratorValue = fractionItem[0];
        const denominatorValue = fractionItem[1];
        // Defensive check against division by zero, though ideally caught earlier.
        if (denominatorValue === 0) {
             console.warn(`Warning: Encountered zero denominator during numerator scaling for ${numeratorValue}/${denominatorValue}. Resulting scaled value will be 0.`);
             return 0; // Return 0 for invalid fractions.
        }
        return numeratorValue * (combinedDenominatorsLCM / denominatorValue);
    });

    // Filter out any zero values that might have resulted from invalid fractions or zero numerators.
    const effectiveScaledNumerators = integerEquivalentNumerators.filter(val => val !== 0);
    // If after filtering, no valid scaled numerators remain, skip this set.
    if (effectiveScaledNumerators.length === 0) {
        console.error("Processing Alert: No effective scaled numerators to process. Moving to next set.");
        continue;
    }

    // --- Stage 3: Calculate the LCM of these newly obtained integer scaled numerators. ---
    let ultimateOverallLCM = 1; // Initialize LCM accumulator to 1.
    for (const currentScaledNumber of effectiveScaledNumerators) {
        // Only compute LCM with non-zero numbers.
        if (currentScaledNumber !== 0) {
             ultimateOverallLCM = computeLeastCommonMultiple(ultimateOverallLCM, currentScaledNumber);
        } else {
            // If any scaled number is zero, the ultimate LCM effectively becomes zero.
            ultimateOverallLCM = 0;
            break; // Stop if a zero is found.
        }
    }

    // --- Stage 4: Output the final computed values. ---
    // For each valid scaled numerator, print the ultimateOverallLCM divided by it.
    effectiveScaledNumerators.forEach(scaledResult => {
        // Prevent division by zero in the final output step.
        if (scaledResult !== 0) {
            console.log(ultimateOverallLCM / scaledResult);
        } else {
            console.warn("Output Warning: Cannot perform division by zero for a scaled numerator. Skipping output for this value.");
        }
    });
}