'use strict'; // Enforce strict parsing and error handling for cleaner code.

(function (inputDataStream) { // Self-executing anonymous function to encapsulate logic.

    // Process the raw input string: trim whitespace, split by spaces, convert to numbers.
    inputDataStream = inputDataStream
        .trim()
        .split(/\s+/)
        .map(strVal => Number(strVal));

    // Extract problem parameters from the processed input.
    const totalEntities = inputDataStream[0]; // Represents 'N' in the original problem.
    const groupSize = inputDataStream[1];   // Represents 'K' in the original problem.
    const effectiveLength = totalEntities - groupSize + 1; // Corresponds to 'L'.
    const primeModulus = (1000000000 + 7); // A large prime number for modular arithmetic, 'M'.

    /**
     * Performs modular addition of two numbers.
     * @param {number} valOne The first operand.
     * @param {number} valTwo The second operand.
     * @returns {number} The sum modulo primeModulus.
     */
    function addWithMod(valOne, valTwo) {
        return (valOne + valTwo) % primeModulus;
    }

    /**
     * Performs modular multiplication of two numbers using a custom split method to avoid overflow
     * before taking the modulo, especially for large numbers.
     * Divides each number into three 9-bit parts (approx 2^9 = 512).
     * @param {number} opA The first operand.
     * @param {number} opB The second operand.
     * @returns {number} The product modulo primeModulus.
     */
    function performModularMultiplication(opA, opB) {
        // Decompose operand A into three parts based on powers of 2^9.
        let opA_p1 = (opA >> 18); // Highest 9 bits
        let opA_p2 = (opA >> 9) - (opA_p1 << 9); // Middle 9 bits
        let opA_p3 = opA - (opA_p1 << 18) - (opA_p2 << 9); // Lowest 9 bits
        const opAParts = [opA_p3, opA_p2, opA_p1]; // Store parts in an array (low to high).

        // Decompose operand B similarly.
        let opB_p1 = (opB >> 18);
        let opB_p2 = (opB >> 9) - (opB_p1 << 9);
        let opB_p3 = opB - (opB_p1 << 18) - (opB_p2 << 9);
        const opBParts = [opB_p3, opB_p2, opB_p1]; // Store parts in an array (low to high).

        let cumulativeProduct = 0; // Accumulator for the final product.

        // Iterate through all combinations of parts from opA and opB.
        for (let idxA = 0; idxA < 3; idxA++) {
            for (let idxB = 0; idxB < 3; idxB++) {
                let currentTerm = (opAParts[idxA] * opBParts[idxB]) % primeModulus;

                // Apply appropriate power of (2^9) based on the indices.
                for (let shiftCount = 0; shiftCount < idxA + idxB; shiftCount++) {
                    currentTerm = (currentTerm * (1 << 9)) % primeModulus;
                }
                // Add the term to the cumulative product.
                cumulativeProduct = addWithMod(cumulativeProduct, currentTerm);
            }
        }
        return cumulativeProduct; // Return the final modular product.
    }

    // Initialize a 2D array to store binomial coefficients (Pascal's Triangle).
    // The size is (totalEntities + 1) x (totalEntities + 1).
    const binomialCoeffs = Array.from({ length: totalEntities + 1 }, (_, rowIndex) =>
        Array.from({ length: rowIndex + 1 }, () => 1) // Each row starts and ends with 1.
    );

    // Populate Pascal's Triangle using the recurrence relation: C(n, k) = C(n-1, k-1) + C(n-1, k).
    // This calculates combinations up to C(totalEntities, k).
    for (let currentNValue = 2; currentNValue <= totalEntities; currentNValue++) {
        for (let currentKValue = 1; currentKValue < currentNValue; currentKValue++) {
            binomialCoeffs[currentNValue][currentKValue] = addWithMod(
                binomialCoeffs[currentNValue - 1][currentKValue - 1],
                binomialCoeffs[currentNValue - 1][currentKValue]
            );
        }
    }

    // Array to store the final computed results for each iteration.
    const computedResults = [];

    // Loop 'groupSize' times to calculate the required products.
    for (let iterationIndex = 0; iterationIndex < groupSize; iterationIndex++) {
        let currentLoopValue = iterationIndex + 1; // Adjust to 1-based indexing for calculations.
        // Calculate the product of two specific binomial coefficients and store it.
        computedResults.push(
            performModularMultiplication(
                binomialCoeffs[effectiveLength][currentLoopValue],
                binomialCoeffs[groupSize - 1][currentLoopValue - 1]
            )
        );
    }

    // Output the results, each on a new line.
    console.log(computedResults.join('\n'));

// Read input from standard input using Node.js filesystem module.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));