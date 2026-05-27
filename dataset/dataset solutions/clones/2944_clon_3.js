'use strict';

// Helper function to compute modular inverse using the Extended Euclidean Algorithm.
// This function replicates the exact behavior of the original inline code,
// including potential runtime errors if 'num' is 0 or not coprime to 'mod'.
function computeModularInverse(numToInvert, modulusValue) {
    let remainderSequence = [modulusValue, numToInvert];
    let quotientSequence = [];

    // The original code would encounter a runtime error (division by zero)
    // if numToInvert is 0, as modulusValue % 0 is invalid.
    // This exact behavior is preserved.
    while (remainderSequence[remainderSequence.length - 1] !== 1) {
        let currentDividend = remainderSequence[remainderSequence.length - 2];
        let currentDivisor = remainderSequence[remainderSequence.length - 1];
        let calculatedRemainder = currentDividend % currentDivisor;
        let calculatedQuotient = Math.floor(currentDividend / currentDivisor);

        remainderSequence.push(calculatedRemainder);
        quotientSequence.push(calculatedQuotient);
    }

    // Coefficients for the Bezout's identity (ax + by = gcd(a,b))
    let coefficients = [-quotientSequence.pop(), 1];

    while (quotientSequence.length > 0) {
        coefficients.push(coefficients[coefficients.length - 2] - coefficients[coefficients.length - 1] * quotientSequence.pop());
    }

    // The modular inverse is the second to last coefficient, adjusted to be positive.
    let inverseCoefficient = coefficients[coefficients.length - 2];
    return (inverseCoefficient % modulusValue + modulusValue) % modulusValue;
}

// Helper function for the common calculation pattern: (A + B + C) * 2 - D
const calculateCombinedTerm = (termA, termB, termC, termD) => {
    return (termA + termB + termC) * 2 - termD;
};

(function(rawInputString) {
    // Parse and process input data
    const numericInputs = rawInputString.trim().split(/\s+/).map(str => parseInt(str, 10));

    const firstInputVal = numericInputs[0];
    const secondInputVal = numericInputs[1];

    // Determine N, M, and K based on problem logic
    const valN = Math.min(firstInputVal, secondInputVal);
    const valM = Math.max(firstInputVal, secondInputVal);
    const valK = numericInputs[2];

    // Define the modulo constant
    const MOD_PRIME = Math.pow(10, 9) + 7;

    let accumulatedResult = 0;

    // Introduce constants for common fractional multipliers
    const FRACTION_ONE_SIXTH = 1 / 6;
    const FRACTION_ONE_HALF = 1 / 2;

    // First calculation phase: loop for iterD from 1 to valN-1
    for (let iterD = 1; iterD <= valN - 1; iterD++) {
        // Intermediate variables for clarity
        const dPlus1 = iterD + 1;
        const dPlus2 = iterD + 2;
        const nMinusDMinus1 = valN - iterD - 1;
        const mMinusDMinus1 = valM - iterD - 1;

        let currentTermA = FRACTION_ONE_SIXTH * dPlus1 * dPlus2 * (iterD * 3);
        let currentTermB = (nMinusDMinus1 + mMinusDMinus1) * FRACTION_ONE_HALF * dPlus1 * dPlus2;
        let currentTermC = nMinusDMinus1 * mMinusDMinus1 * dPlus1;
        let currentTermD = (valN - iterD) + (valM - iterD);

        accumulatedResult += iterD * calculateCombinedTerm(currentTermA, currentTermB, currentTermC, currentTermD);
        accumulatedResult %= MOD_PRIME;
    }

    // Second calculation phase: loop for iterD from valN to valM-1
    for (let iterD = valN; iterD <= valM - 1; iterD++) {
        // Intermediate variables for clarity
        const nVal = valN;
        const nPlus1 = valN + 1;
        const mMinusDMinus1 = valM - iterD - 1;

        let currentTermA = FRACTION_ONE_SIXTH * nVal * nPlus1 * (valN + 2);
        let currentTermB = mMinusDMinus1 * FRACTION_ONE_HALF * nVal * nPlus1;
        let currentTermC = 0; // Explicitly zero as per original logic
        let currentTermD = (valM - iterD);

        accumulatedResult += iterD * calculateCombinedTerm(currentTermA, currentTermB, currentTermC, currentTermD);
        accumulatedResult %= MOD_PRIME;
    }

    // Third calculation phase: loop for iterD from valM to valN+valM-2
    for (let iterD = valM; iterD <= valN + valM - 2; iterD++) {
        // Helper variable 'tempA' for the calculation
        const tempA = valN + valM - 1 - iterD;
        const tempAPlus1 = tempA + 1;
        const tempAPlus2 = tempA + 2;

        let currentTermA = FRACTION_ONE_SIXTH * tempA * tempAPlus1 * tempAPlus2;
        let currentTermB = 0; // Explicitly zero
        let currentTermC = 0; // Explicitly zero
        let currentTermD = 0; // Explicitly zero

        accumulatedResult += iterD * calculateCombinedTerm(currentTermA, currentTermB, currentTermC, currentTermD);
        accumulatedResult %= MOD_PRIME;
    }

    // Apply the combination factor: (N*M-2)C(K-2)
    // This section calculates: accumulatedResult * Product_{i=0 to K-3} [ (N*M-2-K) / i ] mod MOD_PRIME
    // Note: The original code's multiplication factor (N*M-2-K) is preserved,
    // even if it appears to be a potential typo for a standard combination formula.
    // The modular inverse calculation will crash if loopIndex is 0, matching original behavior.
    const loopUpperLimit = valK - 2;
    if (loopUpperLimit > 0) { // Guard clause: loop only runs if K-2 is positive
        for (let loopIndex = 0; loopIndex < loopUpperLimit; loopIndex++) {
            // Multiply by the numerator part
            accumulatedResult = (accumulatedResult * (valN * valM - 2 - valK)) % MOD_PRIME;

            // Divide by the denominator part (loopIndex) using modular inverse
            const inverseOfLoopIndex = computeModularInverse(loopIndex, MOD_PRIME);
            accumulatedResult = (accumulatedResult * inverseOfLoopIndex) % MOD_PRIME;
        }
    }

    // Ensure the final result is non-negative before printing
    accumulatedResult = (accumulatedResult + MOD_PRIME) % MOD_PRIME;

    console.log(accumulatedResult);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
