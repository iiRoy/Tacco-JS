"use strict";

const extractNumericLimit = (rawInputContent) => {
    return Number.parseInt(rawInputContent.trim().split(/\s+/)[0], 10);
};

// Recursive function to generate exponents that are powers of 2 (e.g., 2, 4, 8, ...)
const producePowerSeries = (currentGenExp, maxPossibleExp, collectedExponents = []) => {
    if (currentGenExp > maxPossibleExp) {
        return collectedExponents;
    }
    return producePowerSeries(currentGenExp * 2, maxPossibleExp, [...collectedExponents, currentGenExp]);
};

// Function to find all valid base^exponent values for a given exponent and limit
const gatherPotentValues = (specificExp, maximumBound) => {
    let currentBaseCandidate = 2;
    let validPowerList = [];
    while (true) {
        let computedProduct = Math.pow(currentBaseCandidate, specificExp);
        // Break condition: value exceeds bound, or becomes non-finite (overflow for very large numbers)
        if (computedProduct > maximumBound || !Number.isFinite(computedProduct)) {
            break;
        }
        validPowerList.push(computedProduct);
        currentBaseCandidate++;
    }
    return validPowerList;
};

const determineLargestQualifiedNumber = (sourceData) => {
    const upperNumericalCeiling = extractNumericLimit(sourceData);

    // The original logic initializes 'answer' to 1.
    // The smallest number satisfying the condition is 2^2 = 4.
    // If the input limit is less than 4, no such number can be found, so 1 is returned.
    if (upperNumericalCeiling < 4) {
        return 1;
    }

    // Determine the highest possible exponent (power of 2) for base 2
    // For example, if limit is 100, log2(100) is approx 6.64. So max exponent for base 2 is 6.
    // This implies we only need to check exponents 2 and 4 (powers of 2 up to 6).
    const highestFeasibleExp = Math.floor(Math.log2(upperNumericalCeiling));
    
    // Generate the list of relevant exponents (e.g., [2, 4] for limit 100)
    const generatedExponents = producePowerSeries(2, highestFeasibleExp);

    let foundCandidates = new Set(); // Use a Set to automatically handle duplicate values (e.g., 16 = 2^4 = 4^2)
    generatedExponents.forEach(expVal => {
        gatherPotentValues(expVal, upperNumericalCeiling).forEach(value => foundCandidates.add(value));
    });

    if (foundCandidates.size === 0) {
        return 1; // Fallback, should generally not be reached if upperNumericalCeiling >= 4
    }

    // Find the maximum value among all collected candidates
    return Math.max(...Array.from(foundCandidates));
};

const initiateExecutionFlow = (systemInput) => {
    const finalCalculatedValue = determineLargestQualifiedNumber(systemInput);
    console.log(finalCalculatedValue);
};

initiateExecutionFlow(require('fs').readFileSync('/dev/stdin', 'utf8'));