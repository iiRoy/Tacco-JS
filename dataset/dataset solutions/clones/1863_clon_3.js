(() => {
    "use strict";

    // --- Data Acquisition Subroutines ---

    // Read the entire standard input as a UTF-8 string.
    const rawInputContent = require("fs").readFileSync(process.stdin.fd, "utf8");
    // Split the input content by any sequence of whitespace characters
    // and filter out any resulting empty strings to get a clean array of tokens.
    const inputTokensBuffer = rawInputContent.split(/\s+/).filter(Boolean);
    let currentInputTokenPointer = 0; // Pointer to the next token to be consumed.

    /**
     * Retrieves and parses the next available token as an integer.
     * Throws an error if no more tokens are available.
     * @returns {number} The parsed integer value.
     */
    const fetchNextInteger = () => {
        if (currentInputTokenPointer >= inputTokensBuffer.length) {
            throw new Error("Attempted to read beyond end of input for an integer.");
        }
        return Number(inputTokensBuffer[currentInputTokenPointer++]);
    };

    /**
     * Retrieves the next available token as a string.
     * Throws an error if no more tokens are available.
     * @returns {string} The next string token.
     */
    const fetchNextString = () => {
        if (currentInputTokenPointer >= inputTokensBuffer.length) {
            throw new Error("Attempted to read beyond end of input for a string.");
        }
        return inputTokensBuffer[currentInputTokenPointer++];
    };

    /**
     * Retrieves and parses the next available token as a BigInt.
     * Throws an error if no more tokens are available.
     * @returns {BigInt} The parsed BigInt value.
     */
    const fetchNextBigInt = () => {
        if (currentInputTokenPointer >= inputTokensBuffer.length) {
            throw new Error("Attempted to read beyond end of input for a BigInt.");
        }
        return BigInt(inputTokensBuffer[currentInputTokenPointer++]);
    };

    /**
     * Reads a specified number of subsequent tokens.
     * @param {number} count - The number of tokens to read.
     * @param {boolean} returnAsStrings - If true, tokens are returned as strings; otherwise, as numbers.
     * @returns {Array<number|string>} An array containing the parsed tokens.
     */
    const fetchMultipleItems = (count, returnAsStrings = false) => {
        if (currentInputTokenPointer + count > inputTokensBuffer.length) {
            throw new Error(`Insufficient tokens remaining to fetch ${count} items.`);
        }
        const itemsSlice = inputTokensBuffer.slice(currentInputTokenPointer, currentInputTokenPointer + count);
        currentInputTokenPointer += count;
        return returnAsStrings ? itemsSlice : itemsSlice.map(val => Number(val));
    };

    /**
     * Reads a 2D array (matrix) of specified dimensions.
     * @param {number} rowCount - Number of rows.
     * @param {number} colCount - Number of columns per row.
     * @param {boolean} returnAsStrings - If true, matrix elements are strings; otherwise, numbers.
     * @returns {Array<Array<number|string>>} The parsed matrix.
     */
    const fetchMatrix = (rowCount, colCount, returnAsStrings = false) => {
        const matrixResult = [];
        let rIdx = 0;
        while (rIdx < rowCount) {
            const rowElements = inputTokensBuffer.slice(currentInputTokenPointer, currentInputTokenPointer + colCount);
            currentInputTokenPointer += colCount;
            matrixResult.push(returnAsStrings ? rowElements : rowElements.map(val => Number(val)));
            rIdx++;
        }
        return matrixResult;
    };

    // --- Core Mathematical Operations ---

    /**
     * Computes the greatest common divisor (GCD) of two BigInts using the Euclidean algorithm.
     * @param {BigInt} valueA - First BigInt.
     * @param {BigInt} valueB - Second BigInt.
     * @returns {BigInt} The GCD of valueA and valueB.
     */
    const computeGreatestCommonDivisor = (valueA, valueB) => {
        let tempA = valueA;
        let tempB = valueB;
        while (tempB !== 0n) {
            [tempA, tempB] = [tempB, tempA % tempB];
        }
        return tempA;
    };

    // A frequently used prime modulus for modular arithmetic.
    const PRIME_NUMBER_MODULO = 1000000007;

    /**
     * Performs modular multiplication for an arbitrary number of arguments.
     * Ensures all intermediate and final results remain within the modulo range.
     * @param {...number} factors - Numbers to be multiplied.
     * @returns {number} The modular product.
     */
    const performModularMultiplication = (...factors) => {
        if (factors.length === 0) return 1;
        let runningProduct = factors[0] % PRIME_NUMBER_MODULO;
        let currentFactorIndex = 1;
        while (currentFactorIndex < factors.length) {
            runningProduct = (runningProduct * (factors[currentFactorIndex] % PRIME_NUMBER_MODULO)) % PRIME_NUMBER_MODULO;
            currentFactorIndex++;
        }
        // Ensure the result is always positive.
        return (runningProduct + PRIME_NUMBER_MODULO) % PRIME_NUMBER_MODULO;
    };

    // Caches for precomputed combinatorics values.
    let factorialCache = [];
    let inverseFactorialCache = [];

    /**
     * Precomputes factorials and their modular inverses up to a specified upper bound.
     * This function is part of the original utility set but not directly used in the main logic of *this specific* problem.
     * @param {number} upperLimit - The maximum number for precomputation.
     */
    const setupCombinatoricsCache = (upperLimit) => {
        factorialCache.length = upperLimit + 1;
        factorialCache[0] = 1;
        factorialCache[1] = 1;

        let numCounter = 2;
        while (numCounter <= upperLimit) {
            factorialCache[numCounter] = performModularMultiplication(factorialCache[numCounter - 1], numCounter);
            numCounter++;
        }

        inverseFactorialCache.length = upperLimit + 1;
        inverseFactorialCache[0] = 1;
        inverseFactorialCache[1] = 1;
        inverseFactorialCache[upperLimit] = calculateModularInverse(factorialCache[upperLimit]);

        numCounter = upperLimit;
        while (numCounter > 2) {
            inverseFactorialCache[numCounter - 1] = performModularMultiplication(inverseFactorialCache[numCounter], numCounter);
            numCounter--;
        }
    };

    /**
     * Calculates the modular multiplicative inverse of a number 'val' modulo PRIME_NUMBER_MODULO.
     * Uses the Extended Euclidean Algorithm.
     * @param {number} val - The number whose inverse is to be found.
     * @returns {number} The modular inverse.
     */
    const calculateModularInverse = (val) => {
        let currentModulus = PRIME_NUMBER_MODULO;
        let x0 = 0, x1 = 1; // Coefficients for the extended Euclidean algorithm
        let a = currentModulus, b = val;
        let quotientTerm;

        while (b !== 0) {
            quotientTerm = Math.floor(a / b);
            [a, b] = [b, a % b];
            [x0, x1] = [x1, x0 - quotientTerm * x1];
        }
        // Ensure the result is positive.
        x0 %= currentModulus;
        return (x0 < 0) ? (x0 + currentModulus) : x0;
    };

    /**
     * Computes (base^exponent) % PRIME_NUMBER_MODULO using binary exponentiation (exponentiation by squaring).
     * @param {number} baseVal - The base number.
     * @param {number} expVal - The exponent.
     * @returns {number} The result of baseVal^expVal modulo PRIME_NUMBER_MODULO.
     */
    const computeModularExponentiation = (baseVal, expVal) => {
        let finalResult = 1;
        let base = baseVal % PRIME_NUMBER_MODULO;
        let exponent = expVal;

        while (exponent > 0) {
            if (exponent % 2 === 1) { // If exponent is odd
                finalResult = performModularMultiplication(base, finalResult);
            }
            base = performModularMultiplication(base, base); // Square the base
            exponent = Math.floor(exponent / 2); // Halve the exponent
        }
        return finalResult;
    };

    /**
     * Calculates "n choose r" (combinations) modulo PRIME_NUMBER_MODULO.
     * Requires `setupCombinatoricsCache` to have been called for relevant `n`.
     * @param {number} n - Total items.
     * @param {number} r - Items to choose.
     * @returns {number} The nCr value modulo PRIME_NUMBER_MODULO.
     */
    const calculateCombinationsMod = (n, r) => {
        if (r < 0 || r > n) return 0;
        return performModularMultiplication(factorialCache[n], inverseFactorialCache[r], inverseFactorialCache[n - r]);
    };

    /**
     * Calculates "n permute r" (permutations) modulo PRIME_NUMBER_MODULO.
     * Requires `setupCombinatoricsCache` to have been called for relevant `n`.
     * @param {number} n - Total items.
     * @param {number} r - Items to arrange.
     * @returns {number} The nPr value modulo PRIME_NUMBER_MODULO.
     */
    const calculatePermutationsMod = (n, r) => {
        if (r < 0 || r > n) return 0;
        return performModularMultiplication(factorialCache[n], inverseFactorialCache[n - r]);
    };

    /**
     * Ensures a number is positive and within the modulo range.
     * Useful for final results that might be negative due to subtraction.
     * @param {number} value - The number to normalize.
     * @returns {number} The normalized value.
     */
    const ensurePositiveModulo = (value) => {
        return (Number(value) % PRIME_NUMBER_MODULO + PRIME_NUMBER_MODULO) % PRIME_NUMBER_MODULO;
    };

    // --- Main Algorithm Implementation ---

    /**
     * Implements the core logic to solve the problem based on input pairs.
     * @returns {number} The final computed answer modulo PRIME_NUMBER_MODULO.
     */
    const executeProblemSolution = () => {
        const numberOfPairs = fetchNextInteger();

        let countZeroAOnly = 0; // Counts pairs (0, B) where B != 0
        let countZeroBOnly = 0; // Counts pairs (A, 0) where A != 0
        let countBothZeros = 0;  // Counts pairs (0, 0)

        // Using JavaScript's Map for handling BigInt keys robustly.
        // Outer Map: BigInt (normalized 'a') -> Inner Map
        // Inner Map: String (normalized 'b') -> Count (number)
        const aggregatedPairData = new Map();
        const listOfUniqueFirstComponents = []; // Stores distinct positive 'a' BigInts

        let currentPairIndex = 0;
        while (currentPairIndex < numberOfPairs) {
            let componentA = fetchNextBigInt();
            let componentB = fetchNextBigInt();

            // First, categorize and count special cases:
            if (componentA === 0n && componentB === 0n) {
                countBothZeros++;
                currentPairIndex++;
                continue;
            }
            if (componentA === 0n) {
                countZeroAOnly++;
                currentPairIndex++;
                continue;
            }
            if (componentB === 0n) {
                countZeroBOnly++;
                currentPairIndex++;
                continue;
            }

            // For non-special pairs, normalize them by dividing by their GCD.
            const commonDivisor = computeGreatestCommonDivisor(componentA, componentB);
            componentA /= commonDivisor;
            componentB /= commonDivisor;

            // Ensure the first component (componentA) is always positive.
            // If componentA is negative, flip signs of both components.
            if (componentA < 0n) {
                componentA = -componentA;
                componentB = -componentB;
            }

            // Store the normalized pair and its count in the map structure.
            // If componentA is new, initialize its inner map and add to the unique components list.
            if (!aggregatedPairData.has(componentA)) {
                aggregatedPairData.set(componentA, new Map());
                listOfUniqueFirstComponents.push(componentA);
            }
            const innerComponentMap = aggregatedPairData.get(componentA);
            const stringifiedB = String(componentB); // Use string for inner map keys, mirroring original object behavior.

            innerComponentMap.set(stringifiedB, (innerComponentMap.get(stringifiedB) || 0) + 1);

            currentPairIndex++;
        }

        // Calculate the initial part of the solution for pairs (0,B) and (A,0).
        // These two groups are mutually exclusive in terms of selection (cannot pick from both).
        // The total ways to choose a subset from either group is (2^countZeroAOnly - 1) + (2^countZeroBOnly - 1) + 1
        // which simplifies to 2^countZeroAOnly + 2^countZeroBOnly - 1.
        // The result includes the empty set of choices.
        let overallSolutionAccumulator = (computeModularExponentiation(2, countZeroAOnly) + computeModularExponentiation(2, countZeroBOnly) - 1 + PRIME_NUMBER_MODULO) % PRIME_NUMBER_MODULO;

        // Iterate through the unique positive 'a' values (first components) collected.
        for (const currentFirstComponent of listOfUniqueFirstComponents) {
            const innerMapForCurrentA = aggregatedPairData.get(currentFirstComponent);

            // Iterate through all 'b' values (second components) associated with this 'a'.
            for (const secondComponentKey of innerMapForCurrentA.keys()) {
                const currentSecondComponentVal = BigInt(secondComponentKey); // Convert string key back to BigInt.

                let modularTermForGroup = 0; // This term will be multiplied into overallSolutionAccumulator.

                // Logic to handle pairs (A,B) and their conflicting counterparts (-B,A).
                // Normalized pairs are always (a,b) where a > 0.
                // A pair (a,b) conflicts with (-b,a).

                if (currentSecondComponentVal < 0n) {
                    // Current pair group is (currentFirstComponent, currentSecondComponentVal) where currentFirstComponent > 0 and currentSecondComponentVal < 0.
                    // Its conflicting counterpart is (-currentSecondComponentVal, currentFirstComponent).
                    // To avoid double-counting and ensure correct combination of choices, we only process one "side" of such conflicting groups.
                    // If the complementary group exists and has a positive first component (which it will, as -currentSecondComponentVal is positive),
                    // then we delegate its processing to when that complementary first component is iterated in the outer loop.
                    const complementFirstComponent = -currentSecondComponentVal;
                    const complementSecondComponentKey = String(currentFirstComponent); // Corresponding 'b' for the complement.

                    if (aggregatedPairData.has(complementFirstComponent)) {
                        const complementInnerMap = aggregatedPairData.get(complementFirstComponent);
                        if (complementInnerMap.has(complementSecondComponentKey)) {
                            // If the complementary pair exists, we skip processing the current pair.
                            // It will be processed when 'complementFirstComponent' is the outer loop's key.
                            continue;
                        }
                    }
                }

                // Calculate the number of ways to choose from the current group (currentFirstComponent, currentSecondComponentVal).
                const countOfCurrentPairGroup = innerMapForCurrentA.get(secondComponentKey);
                modularTermForGroup = computeModularExponentiation(2, countOfCurrentPairGroup); // Ways to choose from this group, including empty set.

                // If currentSecondComponentVal is positive, check for its explicit complementary group.
                // The complementary group would be (currentSecondComponentVal, -currentFirstComponent).
                if (currentSecondComponentVal > 0n) {
                    const complementFirstComponent = currentSecondComponentVal;
                    const complementSecondComponentKey = String(-currentFirstComponent); // String key for the negative component.

                    if (aggregatedPairData.has(complementFirstComponent)) {
                        const complementInnerMap = aggregatedPairData.get(complementFirstComponent);
                        if (complementInnerMap.has(complementSecondComponentKey)) {
                            const countOfComplementPairGroup = complementInnerMap.get(complementSecondComponentKey);
                            // If both the current group and its complement exist, they conflict.
                            // The total non-conflicting ways to choose from these two groups (including empty set) is:
                            // (Ways from current group) + (Ways from complement group) - 1 (to correct for double-counted empty set).
                            modularTermForGroup = (modularTermForGroup + computeModularExponentiation(2, countOfComplementPairGroup) - 1 + PRIME_NUMBER_MODULO) % PRIME_NUMBER_MODULO;
                        }
                    }
                }
                // Multiply the calculated term for this group (or combined groups) into the overall solution.
                overallSolutionAccumulator = performModularMultiplication(overallSolutionAccumulator, modularTermForGroup);
            }
        }

        // Final result adjustment:
        // overallSolutionAccumulator currently holds the total number of ways to choose from non-(0,0) pairs,
        // INCLUDING the empty set of choices.
        // Subtract 1 to get only non-empty choices from these groups.
        // Add countBothZeros: this implies each (0,0) pair itself constitutes a valid choice of one pair.
        // This is a specific interpretation of the problem's final counting requirement.
        let finalComputedAnswer = (overallSolutionAccumulator - 1 + countBothZeros);
        // Ensure the final result is positive and within the modulo range.
        return ensurePositiveModulo(finalComputedAnswer);
    };

    // Execute the main solution function.
    const finalProblemResult = executeProblemSolution();

    // Print the result if it's explicitly not undefined (which it always will be here).
    if (finalProblemResult !== undefined) {
        console.log(finalProblemResult);
    }

})(); // End of the Immediately Invoked Function Expression (IIFE)