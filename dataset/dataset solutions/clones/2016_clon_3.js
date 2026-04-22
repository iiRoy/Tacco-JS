// This function computes all positive integer factors (divisors) for a given number.
// It includes 1 and the number itself in the returned list.
// The implementation uses a Set to automatically handle duplicate factors that might arise
// from processing numbers that are perfect squares (e.g., factor '6' for '36' would be found twice).
// Finally, the factors are converted to a sorted array for consistent output order.
function obtainAllPositiveFactors(subjectNumber) {
    // Input validation: Factors are typically defined for positive integers.
    // For non-positive or non-integer inputs, an empty array is returned,
    // except for the special case of 1 which correctly returns [1].
    if (typeof subjectNumber !== 'number' || !Number.isInteger(subjectNumber) || subjectNumber < 1) {
        // The number 1 has only one positive factor, which is 1 itself.
        if (subjectNumber === 1) {
            return [1];
        }
        // For any other non-positive or non-integer input, return an empty set of factors.
        return [];
    }

    // A Set ensures that each factor is stored only once, naturally handling duplicates.
    const discoveredFactorsCollection = new Set();
    discoveredFactorsCollection.add(1); // 1 is always a factor of any positive integer.

    // Calculate the square root once to optimize the loop condition.
    const numberSquareRoot = Math.sqrt(subjectNumber);

    // Iterate through potential divisors starting from 2 up to the square root of the number.
    // This approach leverages the property that factors come in pairs (d, N/d).
    for (let potentialDivisor = 2; potentialDivisor <= numberSquareRoot; potentialDivisor++) {
        // If 'potentialDivisor' perfectly divides 'subjectNumber', it's a factor.
        if (subjectNumber % potentialDivisor === 0) {
            discoveredFactorsCollection.add(potentialDivisor); // Add the current divisor.
            // Also add its complementary factor (subjectNumber / potentialDivisor).
            discoveredFactorsCollection.add(subjectNumber / potentialDivisor);
        }
    }

    // The number itself is always a factor (unless it's 1, which is already handled).
    // This ensures that N is included in its list of factors, consistent with the original.
    if (subjectNumber > 1) {
        discoveredFactorsCollection.add(subjectNumber);
    }

    // Convert the Set of unique factors into an array and sort it numerically in ascending order.
    const orderedFactorsList = Array.from(discoveredFactorsCollection).sort((a, b) => a - b);
    return orderedFactorsList;
}

// Helper function to repeatedly divide a number by a specific factor
// until it is no longer divisible by that factor.
// This effectively removes all occurrences of the factor from the number.
function reduceNumberByFactorCompletely(initialValue, factorToReduce) {
    // Basic validation for the factor: it must be a positive integer.
    // A factor of 1 does not reduce the value and would lead to an infinite loop if not handled.
    if (typeof factorToReduce !== 'number' || !Number.isInteger(factorToReduce) || factorToReduce < 1) {
        return initialValue; // Return original value for invalid factors.
    }
    // Optimization for factor 1: it has no effect on division.
    if (factorToReduce === 1) {
        return initialValue;
    }

    let currentReducedTarget = initialValue;
    // Keep dividing as long as the current target value remains divisible by the factor.
    while (currentReducedTarget % factorToReduce === 0) {
        currentReducedTarget /= factorToReduce;
    }
    return currentReducedTarget;
}

// Main execution block: This immediately-invoked function expression (IIFE)
// handles reading input, performing calculations, and outputting the result.
(function processInputAndCalculateFinalResult(rawInputString) {
    // Robust input validation: Check if input is a non-empty string.
    if (typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
        console.error("Input error: The provided input is invalid or empty. Please provide a single positive integer.");
        return; // Terminate execution if input is invalid.
    }

    // Parse the input string into an integer, removing any leading/trailing whitespace.
    const primaryInputNumber = Number(rawInputString.trim());

    // Further validation for the parsed number: ensure it's a positive integer.
    if (!Number.isInteger(primaryInputNumber) || primaryInputNumber < 1) {
        console.error("Input error: The input value must be a positive integer.");
        return;
    }

    // --- Calculation Part 1: Count of specific divisors for (N-1) ---
    // This corresponds to `subOnly` in the original code.
    // It counts positive factors of (N-1), excluding the factor '1'.
    let countFactorsExcludingOneForPrevious = 0;
    // Only proceed if (N-1) is a positive integer, as factors are defined for positive numbers.
    if (primaryInputNumber - 1 >= 1) {
        const factorsOfPredecessor = obtainAllPositiveFactors(primaryInputNumber - 1);
        // Subtract 1 from the total count to exclude the factor '1'.
        countFactorsExcludingOneForPrevious = factorsOfPredecessor.length - 1;
    }
    // If primaryInputNumber is 1, then primaryInputNumber - 1 is 0.
    // In this case, `countFactorsExcludingOneForPrevious` remains 0,
    // which aligns with a common interpretation for N=1 in such problems.

    // --- Calculation Part 2: Count of special divisors for N ---
    // This corresponds to `divIncluded` in the original code.
    let specialDivisorConditionCount = 0;

    // Get all positive factors of the primary input number, excluding '1'.
    // The original code had a subtle bug here by using `.shift()`, which extracts and returns
    // only the first element (which is '1'), leading to an infinite loop for d=1.
    // `.slice(1)` correctly provides all factors except the first one ('1').
    const relevantFactorsOfPrimaryNumber = obtainAllPositiveFactors(primaryInputNumber).slice(1);

    // Iterate through each factor (d) of N (excluding 1) to check specific conditions.
    for (const currentFactorCandidate of relevantFactorsOfPrimaryNumber) {
        // Step 1: Reduce the primary number by repeatedly dividing by the current factor.
        const valueAfterReduction = reduceNumberByFactorCompletely(primaryInputNumber, currentFactorCandidate);

        // Condition A: Check if the primary number was purely a power of the current factor.
        // (e.g., if N=8 and currentFactorCandidate=2, valueAfterReduction=1).
        const isPurePowerOfFactor = (valueAfterReduction === 1);

        // Condition B: Check if the current factor is a divisor of (valueAfterReduction - 1).
        // This involves finding factors of (valueAfterReduction - 1) and checking for presence.
        // The `obtainAllPositiveFactors` function handles non-positive inputs by returning an empty array.
        const isFactorOfReducedMinusOne = obtainAllPositiveFactors(valueAfterReduction - 1).includes(currentFactorCandidate);

        // If either of the conditions (A or B) is met, increment the special count.
        if (isPurePowerOfFactor || isFactorOfReducedMinusOne) {
            specialDivisorConditionCount++;
        }
    }

    // Output the final sum of the two calculated counts.
    // The original code had inconsistent casing in its console.log statement; this is corrected.
    console.log(countFactorsExcludingOneForPrevious + specialDivisorConditionCount);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));