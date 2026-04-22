let rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");

// Global state management for tokenized input.
// Tokens are extracted from the raw input, splitting by any whitespace and filtering out empty strings.
let parsedTokens = rawInputData.split(/\s+/).filter(Boolean);
let currentTokenReadPosition = 0; // Tracks the current position in `parsedTokens` for sequential reads.

// Constant defining the maximum number of odd-indexed (1-based) elements to inspect.
// The original code iterated 'i' from 1 to 100, stepping by 2, checking A[i-1].
// This implies checking A[0], A[2], ..., A[98]. There are 50 such elements.
const MAX_ELEMENTS_TO_EVALUATE = 50;

/**
 * Orchestrates the primary data processing flow:
 * 1. Reads an initial count 'N' from input.
 * 2. Reads a series of 'N' numbers from input.
 * 3. Counts how many of the first `MAX_ELEMENTS_TO_EVALUATE` even-indexed (0-based) elements are odd.
 * @returns {number} The total count of odd numbers found at specific indices.
 */
function analyzeNumericSeries() {
    // Step 1: Acquire the count of elements for the main series.
    // The `acquireNumericalData` function returns an array, so destructuring is used.
    const [seriesSize] = acquireNumericalData(1);

    // Guard clause: Validate the acquired series size.
    // Ensure it's a valid number and positive.
    if (typeof seriesSize !== 'number' || isNaN(seriesSize) || seriesSize <= 0) {
        console.error(`Invalid or non-positive series size encountered: ${seriesSize}. Terminating analysis.`);
        return 0; // Return 0 for invalid input to prevent further errors.
    }

    // Step 2: Retrieve the actual numeric series based on the determined size.
    const numericSequence = acquireNumericalData(seriesSize);

    // Guard clause: Ensure the sequence contains actual numbers and is a valid array.
    if (!Array.isArray(numericSequence) || numericSequence.some(val => typeof val !== 'number' || isNaN(val))) {
        console.error("The acquired numeric sequence contains non-numeric or invalid values. Aborting analysis.");
        return 0;
    }

    let oddValueCounter = 0; // Initialize a counter for odd values.

    // Step 3: Iterate and count odd numbers at specific positions.
    // The loop explicitly targets 0-based indices: 0, 2, 4, ..., 98.
    for (let currentIteration = 0; currentIteration < MAX_ELEMENTS_TO_EVALUATE; currentIteration++) {
        const targetIndex = currentIteration * 2; // Calculate the 0-based index.

        // Ensure the target index is within the bounds of the actual numeric sequence.
        if (targetIndex < numericSequence.length) {
            const currentValue = numericSequence[targetIndex];

            // Check if the current value is an odd number.
            // Using bitwise AND for parity check can be slightly more performant for integers.
            if ((currentValue & 1) !== 0) { // No need for typeof check here due to prior validation.
                oddValueCounter++;
            }
        } else {
            // Optimization: If the sequence is shorter than the number of checks,
            // we can break early as there are no more elements to inspect.
            break;
        }
    }

    return oddValueCounter;
}

// Execute the main processing logic and display the result.
let finalCalculatedResult = analyzeNumericSeries();
console.log(finalCalculatedResult);

// --- Utility Functions Section ---

/**
 * Expert commentary: This utility function is designed to extract and convert numerical data
 * from a pre-processed global token list. It supports reading a specific quantity of values.
 * It advances a global pointer `currentTokenReadPosition` after each read operation.
 * @param {number} numberOfElements - The quantity of elements to read and convert. Defaults to 1.
 * @param {Function} converterFunction - The function used to convert token strings (e.g., Number, String, parseInt). Defaults to Number.
 * @returns {Array<any>} An array containing the converted values.
 * @throws {Error} If there are insufficient input tokens for the requested operation.
 */
function acquireNumericalData(numberOfElements = 1, converterFunction = Number) {
    // Pre-condition validation: Ensure we don't attempt to read beyond available tokens.
    if (currentTokenReadPosition + numberOfElements > parsedTokens.length) {
        throw new Error(`Insufficient input tokens. Attempted to read ${numberOfElements} elements starting from position ${currentTokenReadPosition}, but only ${parsedTokens.length - currentTokenReadPosition} are available.`);
    }

    // Extract the required number of tokens using `slice` to create a new array,
    // thereby avoiding direct modification of the `parsedTokens` array during extraction.
    const extractedTokens = parsedTokens.slice(currentTokenReadPosition, currentTokenReadPosition + numberOfElements);
    
    // Update the global index for subsequent read operations.
    currentTokenReadPosition += numberOfElements;

    // Convert tokens to the specified data type.
    // A robust mapping handles potential conversion errors by returning NaN.
    const convertedValues = extractedTokens.map(tokenString => {
        try {
            // Explicitly check for Number conversion to ensure it's not a no-op if type is already Number.
            return (converterFunction === Number) ? Number(tokenString) : converterFunction(tokenString);
        } catch (conversionError) {
            console.warn(`Data conversion failed for token '${tokenString}' using ${converterFunction.name}: ${conversionError.message}. Returning NaN.`);
            return NaN; // Indicate a failed conversion.
        }
    });

    return convertedValues;
}

/**
 * Evaluates a given boolean condition and returns a localized string representation.
 * Designed for simple Yes/No output based on truthiness.
 * @param {any} testValue - The value to evaluate for truthiness.
 * @returns {string} 'Yes' if the value is truthy, otherwise 'No'.
 */
function evaluateBooleanCondition(testValue) {
    // Explicitly cast to boolean for clarity, then use a ternary operator.
    return Boolean(testValue) ? 'Yes' : 'No';
}

/**
 * Computes the aggregate sum of all numeric values within a given collection.
 * This function ensures that only actual numbers contribute to the total.
 * @param {Array<number>} numericCollection - An array of numbers to be summed.
 * @returns {number} The cumulative sum of the elements. Returns 0 for an empty or invalid array.
 */
function sumArrayElements(numericCollection) {
    // Guard clause: Handle non-array or empty inputs gracefully.
    if (!Array.isArray(numericCollection) || numericCollection.length === 0) {
        console.debug("Attempted to sum an empty or invalid collection. Returning 0.");
        return 0;
    }

    let runningTotal = 0; // Initialize accumulator for the sum.

    // Iterate through each element, ensuring it's a number before adding.
    for (const itemValue of numericCollection) {
        if (typeof itemValue === 'number' && !isNaN(itemValue)) {
            runningTotal += itemValue;
        } else {
            console.warn(`Non-numeric value encountered in sumArrayElements: ${itemValue}. Skipping.`);
        }
    }
    return runningTotal;
}

/**
 * Identifies and returns the maximum numeric value from an array.
 * Allows for an optional initial comparison value.
 * @param {Array<number>} dataValues - The array of numbers to search through.
 * @param {number|null} initialComparisonValue - An optional starting value for comparison. If null, the first array element is used.
 * @returns {number|null} The largest number found, or null if the array is empty and no initial value was provided.
 */
function findMaximumInArray(dataValues, initialComparisonValue = null) {
    // Guard clause: Handle empty or invalid input arrays.
    if (!Array.isArray(dataValues) || dataValues.length === 0) {
        return initialComparisonValue; // Return initial value if no data to compare.
    }

    let currentMaximum = initialComparisonValue;

    // Initialize currentMaximum if not provided and array is not empty
    if (currentMaximum === null) {
        // Find the first valid number to set as initial maximum
        let firstValid = dataValues.find(val => typeof val === 'number' && !isNaN(val));
        if (firstValid === undefined) return initialComparisonValue; // No valid numbers in array
        currentMaximum = firstValid;
    }

    for (const numericItem of dataValues) {
        // Ensure the item is a valid number before comparison.
        if (typeof numericItem === 'number' && !isNaN(numericItem)) {
            if (numericItem > currentMaximum) {
                currentMaximum = numericItem;
            }
        }
    }
    return currentMaximum;
}

/**
 * Identifies and returns the minimum numeric value from an array.
 * Allows for an optional initial comparison value.
 * @param {Array<number>} dataValues - The array of numbers to search through.
 * @param {number|null} initialComparisonValue - An optional starting value for comparison. If null, the first array element is used.
 * @returns {number|null} The smallest number found, or null if the array is empty and no initial value was provided.
 */
function findMinimumInArray(dataValues, initialComparisonValue = null) {
    // Guard clause: Handle empty or invalid input arrays.
    if (!Array.isArray(dataValues) || dataValues.length === 0) {
        return initialComparisonValue; // Return initial value if no data to compare.
    }

    let currentMinimum = initialComparisonValue;

    // Initialize currentMinimum if not provided and array is not empty
    if (currentMinimum === null) {
        // Find the first valid number to set as initial minimum
        let firstValid = dataValues.find(val => typeof val === 'number' && !isNaN(val));
        if (firstValid === undefined) return initialComparisonValue; // No valid numbers in array
        currentMinimum = firstValid;
    }

    for (const numericItem of dataValues) {
        // Ensure the item is a valid number before comparison.
        if (typeof numericItem === 'number' && !isNaN(numericItem)) {
            if (numericItem < currentMinimum) {
                currentMinimum = numericItem;
            }
        }
    }
    return currentMinimum;
}

/**
 * Outputs a deep clone (snapshot) of a given JavaScript object to the console.
 * Useful for inspecting object states without mutation side effects.
 * @param {any} targetObject - The object or value to be logged.
 */
function displayObjectSnapshot(targetObject) {
    try {
        // JSON.parse(JSON.stringify()) creates a deep copy for JSON-serializable objects.
        // This effectively provides a snapshot, preventing future modifications from altering the logged output.
        console.log(JSON.parse(JSON.stringify(targetObject)));
    } catch (error) {
        console.error(`Failed to create or display object snapshot: ${error.message}`);
        // Fallback to direct log if snapshot fails (e.g., due to circular references).
        console.log(targetObject);
    }
}

/**
 * Decomposes a positive integer into its prime factors, returning them as an object
 * where keys are prime factors and values are their corresponding powers.
 * @param {number} inputNumber - The positive integer to factorize.
 * @returns {Object<number, number>} An object representing the prime factorization.
 */
function decomposeIntoPrimeFactors(inputNumber) {
    // Guard clause: Handle non-positive or non-integer inputs.
    if (typeof inputNumber !== 'number' || !Number.isInteger(inputNumber) || inputNumber <= 1) {
        console.warn(`Invalid input for prime factorization: ${inputNumber}. Returning empty object.`);
        return {};
    }

    const primeFactorCounts = {}; // Stores prime factors and their powers.
    let workingNumber = inputNumber; // Use a mutable copy for factorization.

    // Iterate from 2 up to the square root of the working number.
    // This optimization reduces the number of division checks.
    for (let currentDivisor = 2; currentDivisor * currentDivisor <= workingNumber; currentDivisor++) {
        if (workingNumber % currentDivisor === 0) {
            let count = 0; // Count occurrences of the current prime factor.
            while (workingNumber % currentDivisor === 0) {
                workingNumber /= currentDivisor;
                count++;
            }
            primeFactorCounts[currentDivisor] = count;
        }
    }

    // If after the loop, workingNumber is still greater than 1, it means
    // the remaining workingNumber itself is a prime factor.
    if (workingNumber > 1) {
        primeFactorCounts[workingNumber] = 1;
    }

    return primeFactorCounts;
}

/**
 * Constructs a new two-dimensional array (matrix) with specified dimensions and initial values.
 * @param {number} xDimension - The number of rows (or outer array length).
 * @param {number} yDimension - The number of columns (or inner array length). Defaults to 0 (empty inner arrays).
 * @param {any} initialFillValue - The value to initialize each cell with. Defaults to 0.
 * @returns {Array<Array<any>>} A new 2D array.
 */
function constructTwoDimensionalArray(xDimension, yDimension = 0, initialFillValue = 0) {
    // Input validation for dimensions.
    if (typeof xDimension !== 'number' || !Number.isInteger(xDimension) || xDimension < 0) {
        console.error(`Invalid xDimension: ${xDimension}. Must be a non-negative integer.`);
        return [];
    }
    if (typeof yDimension !== 'number' || !Number.isInteger(yDimension) || yDimension < 0) {
        console.error(`Invalid yDimension: ${yDimension}. Must be a non-negative integer.`);
        return [];
    }

    const outerArray = [];
    for (let rowIndex = 0; rowIndex < xDimension; rowIndex++) {
        let innerArray;
        if (yDimension > 0) {
            // Create an inner array with `yDimension` elements, filled with `initialFillValue`.
            innerArray = Array(yDimension).fill(initialFillValue);
        } else {
            // If yDimension is 0, create an empty inner array.
            innerArray = [];
        }
        outerArray.push(innerArray);
    }

    return outerArray;
}

/**
 * Computes the greatest common divisor (GCD) of two non-negative integers using the Euclidean algorithm.
 * @param {number} numA - The first non-negative integer.
 * @param {number} numB - The second non-negative integer.
 * @returns {number} The greatest common divisor of numA and numB. Returns 0 if inputs are invalid.
 */
function computeGreatestCommonDivisor(numA, numB) {
    // Input validation for non-negative integers.
    if (typeof numA !== 'number' || !Number.isInteger(numA) || numA < 0 ||
        typeof numB !== 'number' || !Number.isInteger(numB) || numB < 0) {
        console.error(`Invalid input for GCD: ${numA}, ${numB}. Both must be non-negative integers.`);
        return 0; // Or throw an error.
    }

    // Base case for the Euclidean algorithm.
    if (numB === 0) {
        return numA;
    }
    // Recursive step.
    return computeGreatestCommonDivisor(numB, numA % numB);
}

/**
 * Calculates the least common multiple (LCM) of two non-negative integers.
 * Utilizes the formula: LCM(a, b) = |a * b| / GCD(a, b).
 * @param {number} val1 - The first non-negative integer.
 * @param {number} val2 - The second non-negative integer.
 * @returns {number} The least common multiple of val1 and val2. Returns 0 if inputs are invalid or GCD is 0.
 */
function calculateLeastCommonMultiple(val1, val2) {
    // Input validation.
    if (typeof val1 !== 'number' || !Number.isInteger(val1) || val1 < 0 ||
        typeof val2 !== 'number' || !Number.isInteger(val2) || val2 < 0) {
        console.error(`Invalid input for LCM: ${val1}, ${val2}. Both must be non-negative integers.`);
        return 0;
    }

    // Handle edge case where one or both numbers are zero.
    if (val1 === 0 || val2 === 0) {
        return 0;
    }

    const commonDivisor = computeGreatestCommonDivisor(val1, val2);
    // Avoid division by zero if GCD somehow returns 0 (which it shouldn't for non-zero inputs).
    if (commonDivisor === 0) {
        console.error(`GCD returned 0 for non-zero inputs ${val1}, ${val2}. Cannot compute LCM.`);
        return 0;
    }

    // Use Math.abs to ensure positive product, though inputs are already non-negative.
    // Divide first to prevent potential overflow for very large numbers before multiplying.
    return (val1 / commonDivisor) * val2;
}

/**
 * Checks if a `candidateSubset` is a subset of a `mainSet`.
 * This means all elements of `candidateSubset` must be present in `mainSet`.
 * @param {Set<any>} mainSet - The set to check against (the potential superset).
 * @param {Set<any>} candidateSubset - The set to check if it's a subset.
 * @returns {boolean} True if `candidateSubset` is a subset of `mainSet`, false otherwise.
 */
function isSubsetOfSet(mainSet, candidateSubset) {
    // Input validation: Ensure both arguments are Set instances.
    if (!(mainSet instanceof Set) || !(candidateSubset instanceof Set)) {
        console.error("Invalid input for isSubsetOfSet: Both arguments must be Set objects.");
        return false;
    }

    // Optimization: An empty set is always a subset of any set.
    if (candidateSubset.size === 0) {
        return true;
    }
    // Optimization: If the subset is larger than the main set, it cannot be a subset.
    if (candidateSubset.size > mainSet.size) {
        return false;
    }

    // Iterate through each element of the potential subset.
    for (let element of candidateSubset) {
        // If any element is not found in the main set, it's not a subset.
        if (!mainSet.has(element)) {
            return false;
        }
    }
    return true; // All elements were found.
}

/**
 * Computes the union of two Set objects.
 * The union contains all unique elements present in either set.
 * @param {Set<any>} setA - The first Set.
 * @param {Set<any>} setB - The second Set.
 * @returns {Set<any>} A new Set representing the union of setA and setB.
 */
function performSetUnion(setA, setB) {
    // Input validation.
    if (!(setA instanceof Set) || !(setB instanceof Set)) {
        console.error("Invalid input for performSetUnion: Both arguments must be Set objects.");
        return new Set();
    }
    
    // Create a new Set initialized with all elements from setA.
    const unionResult = new Set(setA);
    // Add all elements from setB to the new Set. Duplicates are automatically handled by Set.
    for (const element of setB) {
        unionResult.add(element);
    }
    return unionResult;
}

/**
 * Computes the intersection of two Set objects.
 * The intersection contains elements that are common to both sets.
 * @param {Set<any>} set1 - The first Set.
 * @param {Set<any>} set2 - The second Set.
 * @returns {Set<any>} A new Set representing the intersection of set1 and set2.
 */
function obtainSetIntersection(set1, set2) {
    // Input validation.
    if (!(set1 instanceof Set) || !(set2 instanceof Set)) {
        console.error("Invalid input for obtainSetIntersection: Both arguments must be Set objects.");
        return new Set();
    }

    const intersectionResult = new Set();
    // Iterate over the smaller set for efficiency.
    const [smallerSet, largerSet] = set1.size < set2.size ? [set1, set2] : [set2, set1];

    for (let item of smallerSet) {
        if (largerSet.has(item)) {
            intersectionResult.add(item);
        }
    }
    return intersectionResult;
}

/**
 * Determines the symmetric difference of two Set objects.
 * The symmetric difference contains elements that are in either set, but not in their intersection.
 * @param {Set<any>} firstSet - The first Set.
 * @param {Set<any>} secondSet - The second Set.
 * @returns {Set<any>} A new Set representing the symmetric difference.
 */
function determineSymmetricDifference(firstSet, secondSet) {
    // Input validation.
    if (!(firstSet instanceof Set) || !(secondSet instanceof Set)) {
        console.error("Invalid input for determineSymmetricDifference: Both arguments must be Set objects.");
        return new Set();
    }

    const symDiffResult = new Set();

    // Add elements from firstSet that are not in secondSet.
    for (let elementA of firstSet) {
        if (!secondSet.has(elementA)) {
            symDiffResult.add(elementA);
        }
    }

    // Add elements from secondSet that are not in firstSet.
    for (let elementB of secondSet) {
        if (!firstSet.has(elementB)) {
            symDiffResult.add(elementB);
        }
    }
    return symDiffResult;
}

/**
 * Calculates the difference between two Set objects (elements in `mainSet` but not in `subtractSet`).
 * @param {Set<any>} mainSet - The set from which elements are removed.
 * @param {Set<any>} subtractSet - The set containing elements to remove from `mainSet`.
 * @returns {Set<any>} A new Set representing the difference.
 */
function calculateSetDifference(mainSet, subtractSet) {
    // Input validation.
    if (!(mainSet instanceof Set) || !(subtractSet instanceof Set)) {
        console.error("Invalid input for calculateSetDifference: Both arguments must be Set objects.");
        return new Set();
    }

    const differenceResult = new Set(mainSet); // Start with a copy of the main set.
    for (let elementToRemove of subtractSet) {
        differenceResult.delete(elementToRemove); // Remove elements found in the subtract set.
    }
    return differenceResult;
}

/**
 * Generates all unique combinations of a specified count from a given array of elements.
 * Uses a recursive backtracking approach to build combinations.
 * @param {Array<any>} sourceArray - The array from which to draw elements.
 * @param {number} combinationSize - The number of elements to include in each combination.
 * @returns {Array<Array<any>>} An array of arrays, where each inner array is a combination.
 */
function generateCombinations(sourceArray, combinationSize) {
    // Input validation.
    if (!Array.isArray(sourceArray) || combinationSize < 0 || !Number.isInteger(combinationSize)) {
        console.error("Invalid input for generateCombinations: sourceArray must be an array, combinationSize a non-negative integer.");
        return [];
    }
    if (combinationSize > sourceArray.length) {
        console.warn(`Combination size (${combinationSize}) exceeds array length (${sourceArray.length}). No combinations possible.`);
        return [];
    }
    if (combinationSize === 0) {
        return [[]]; // There's one way to choose 0 elements: choose nothing.
    }

    const allCombinations = [];

    /**
     * Recursive helper function to build combinations.
     * @param {Array<any>} currentCombination - The combination being built so far.
     * @param {number} startIndex - The starting index in `sourceArray` for the current recursion level.
     */
    function findCombinationsRecursive(currentCombination, startIndex) {
        // Base case: If the current combination has reached the desired size, add it to results.
        if (currentCombination.length === combinationSize) {
            allCombinations.push([...currentCombination]); // Push a copy to avoid mutation issues.
            return;
        }

        // Recursive step: Iterate through available elements from `startIndex`.
        for (let i = startIndex; i < sourceArray.length; i++) {
            currentCombination.push(sourceArray[i]); // Add current element.
            findCombinationsRecursive(currentCombination, i + 1); // Recurse with next element.
            currentCombination.pop(); // Backtrack: remove last element to explore other paths.
        }
    }

    findCombinationsRecursive([], 0); // Start the recursion with an empty combination and index 0.
    return allCombinations;
}

/**
 * Calculates the number of permutations (arrangements) of `r` items chosen from a set of `n` items.
 * Formula: P(n, r) = n! / (n-r)! = n * (n-1) * ... * (n-r+1)
 * @param {number} totalItems - The total number of items (n).
 * @param {number} itemsToChoose - The number of items to choose (r).
 * @returns {number} The number of permutations. Returns 0 for invalid inputs.
 */
function computePermutations(totalItems, itemsToChoose) {
    // Input validation: Ensure valid non-negative integers and r <= n.
    if (typeof totalItems !== 'number' || !Number.isInteger(totalItems) || totalItems < 0 ||
        typeof itemsToChoose !== 'number' || !Number.isInteger(itemsToChoose) || itemsToChoose < 0 ||
        itemsToChoose > totalItems) {
        console.error(`Invalid input for permutations: P(${totalItems}, ${itemsToChoose}). Check constraints.`);
        return 0;
    }

    let permutationResult = 1;
    // Calculate n * (n-1) * ... * (n-r+1)
    for (let k = 0; k < itemsToChoose; k++) {
        permutationResult *= (totalItems - k);
    }
    return permutationResult;
}

/**
 * Calculates the number of combinations (selections) of `r` items chosen from a set of `n` items.
 * Formula: C(n, r) = P(n, r) / r! = n! / (r! * (n-r)!)
 * @param {number} totalItems - The total number of items (n).
 * @param {number} itemsToSelect - The number of items to select (r).
 * @returns {number} The number of combinations. Returns 0 for invalid inputs.
 */
function calculateCombinations(totalItems, itemsToSelect) {
    // Input validation.
    if (typeof totalItems !== 'number' || !Number.isInteger(totalItems) || totalItems < 0 ||
        typeof itemsToSelect !== 'number' || !Number.isInteger(itemsToSelect) || itemsToSelect < 0) {
        console.error(`Invalid input for combinations: C(${totalItems}, ${itemsToSelect}). Check constraints.`);
        return 0;
    }
    // Handle edge cases for combinations.
    if (itemsToSelect === 0 || itemsToSelect === totalItems) {
        return 1;
    }
    if (itemsToSelect > totalItems) {
        return 0;
    }

    // Optimization: C(n, r) = C(n, n-r)
    // Calculate C(n, min(r, n-r)) to potentially reduce calculations.
    itemsToSelect = Math.min(itemsToSelect, totalItems - itemsToSelect);

    let combinationNumerator = 1;
    let combinationDenominator = 1;

    // Calculate (n * (n-1) * ... * (n-r+1)) / (r * (r-1) * ... * 1)
    for (let k = 0; k < itemsToSelect; k++) {
        combinationNumerator *= (totalItems - k);
        combinationDenominator *= (k + 1);
    }

    // Ensure integer result, as combinations must be integers.
    return Math.round(combinationNumerator / combinationDenominator);
}