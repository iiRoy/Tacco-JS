const dataStream = require("fs").readFileSync("/dev/stdin", "utf8");

// Constraint for the quadratic terms: 1 <= termX <= termY <= termZ <= 100

/**
 * Core function to compute counts for target values based on a specific quadratic equation.
 * The equation evaluated is: X^2 + Y^2 + Z^2 + XY + YZ + ZX = TargetValue.
 * This function determines how many distinct permutations of (X, Y, Z) triplets
 * satisfy the equation for each target value up to a given maximum.
 *
 * @returns {string} A newline-separated string of counts for each target value,
 *                   starting from index 1.
 */
function computeQuadraticCounts() {
    // Read the single integer input, which defines the upper bound for 'TargetValue'.
    const [maximumTarget] = parseInputTokens();

    // Basic validation for the input 'maximumTarget'.
    // It must be a positive integer within a reasonable processing range.
    if (typeof maximumTarget !== 'number' || !Number.isInteger(maximumTarget) || maximumTarget < 1 || maximumTarget > 20000) {
        console.error("Invalid or out-of-range input for maximumTarget. Expected a positive integer up to 20000.");
        // In a production scenario, one might throw an error or handle more gracefully.
        return "";
    }

    // Initialize an array to accumulate the counts.
    // The size is `maximumTarget + 1` to directly use `currentTarget` as an index.
    // All elements are pre-filled with zero.
    const tallyArray = new Array(maximumTarget + 1).fill(0);

    // Outer loop: Iterates through all possible target values for the quadratic sum.
    for (let currentTarget = 1; currentTarget <= maximumTarget; ++currentTarget) {
        // First inner loop: Iterates through possible values for the 'X' term.
        // The constraint is 1 <= X <= 100.
        for (let termX = 1; termX <= 100; ++termX) {
            const squareX = termX * termX; // Pre-calculate X^2 for efficiency.

            // Second inner loop: Iterates through possible values for the 'Y' term.
            // The constraint is X <= Y <= 100.
            for (let termY = termX; termY <= 100; ++termY) {
                const squareY = termY * termY; // Pre-calculate Y^2.

                // Third inner loop: Iterates through possible values for the 'Z' term.
                // The constraint is Y <= Z <= 100.
                for (let termZ = termY; termZ <= 100; ++termZ) {
                    const squareZ = termZ * termZ; // Pre-calculate Z^2.

                    // Calculate the sum of the quadratic expression for the current (X, Y, Z) triplet.
                    const currentCalculatedSum = squareX + squareY + squareZ +
                                                 (termX * termY) + (termY * termZ) + (termZ * termX);

                    // Optimization: If the current sum exceeds the target,
                    // increasing 'termZ' further will only make the sum larger.
                    // Thus, we can safely exit this innermost loop.
                    if (currentCalculatedSum > currentTarget) {
                        break;
                    }

                    // If the calculated sum matches the current target value.
                    if (currentCalculatedSum === currentTarget) {
                        let permutationFactor = 0; // Initialize factor for counting permutations.

                        // Determine the number of unique permutations for the triplet (X, Y, Z).
                        // Case 1: All three terms are identical (X = Y = Z).
                        // Only 1 unique permutation.
                        if (termX === termY && termY === termZ) {
                            permutationFactor = 1;
                        }
                        // Case 2: Exactly two terms are identical (e.g., X=Y != Z, X!=Y=Z, or X=Z != Y).
                        // There are 3 unique permutations for such a triplet.
                        else if (termX === termY || termY === termZ || termZ === termX) {
                            permutationFactor = 3;
                        }
                        // Case 3: All three terms are distinct (X != Y != Z).
                        // There are 6 unique permutations.
                        else {
                            permutationFactor = 6;
                        }
                        // Add the determined permutation factor to the tally for the current target.
                        tallyArray[currentTarget] += permutationFactor;

                        // Since 'currentCalculatedSum' only increases with 'termZ',
                        // we can break from this inner loop once a match is found.
                        break;
                    }
                }
            }
        }
    }

    // Format the final results into a newline-separated string.
    // The element at index 0 is typically unused, so we skip it.
    const formattedOutputLines = [];
    for (let index = 1; index < tallyArray.length; ++index) {
        formattedOutputLines.push(tallyArray[index].toString());
    }
    return formattedOutputLines.join('\n');
}

// --- Global Execution and Utility Functions ---

// Split the raw input data into an array of string tokens.
// Regular expressions handle various whitespace characters and newlines.
// .filter(Boolean) removes any empty strings resulting from the split.
let processedInputTokens = dataStream.split(/[\s\n]+/).filter(Boolean);
let globalLoopSafetyCounter = 0; // Counter for the infinite loop prevention mechanism.

// Execute the main computation and print its result to the console.
const finalOperationResult = computeQuadraticCounts();
console.log(finalOperationResult);

/**
 * Extracts and parses a specified number of tokens from the global input array.
 * @param {number} requestedRows - The number of rows to read. Defaults to 1.
 * @param {number} requestedColumns - The number of columns per row. Defaults to 1.
 * @param {Function} desiredTypeConverter - A function (e.g., Number, String) to cast tokens. Defaults to Number.
 * @returns {Array|any} A 1D or 2D array of parsed values, depending on column count.
 */
function parseInputTokens(requestedRows = 1, requestedColumns = 1, desiredTypeConverter = Number) {
    const totalTokensToExtract = requestedRows * requestedColumns;
    // Remove and retrieve the required number of tokens from the beginning of the array.
    let extractedTokens = processedInputTokens.splice(0, totalTokensToExtract);

    // Apply the type conversion if the desired type is not String.
    if (desiredTypeConverter !== String) {
        extractedTokens = extractedTokens.map(desiredTypeConverter);
    }

    // If multiple columns are specified, restructure the flat array into a 2D (column-major) array.
    if (requestedColumns > 1) {
        const twoDimensionalArray = new Array(requestedColumns);
        for (let colIdx = 0; colIdx < requestedColumns; ++colIdx) {
            twoDimensionalArray[colIdx] = []; // Initialize inner array for the column.
            for (let rowIdx = 0; rowIdx < requestedRows; ++rowIdx) {
                twoDimensionalArray[colIdx].push(extractedTokens[rowIdx * requestedColumns + colIdx]);
            }
        }
        extractedTokens = twoDimensionalArray;
    }

    return extractedTokens;
}

/**
 * Transforms a boolean value into a localized 'Yes' or 'No' string.
 * @param {boolean} booleanFlag - The boolean value to convert.
 * @returns {string} 'Yes' if true, 'No' if false.
 */
function convertBooleanToAffirmative(booleanFlag) {
    return booleanFlag ? 'Yes' : 'No';
}

/**
 * Computes the sum of all numeric elements within an array.
 * @param {Array<number>} numericCollection - An array containing numbers.
 * @returns {number} The total sum of the numbers.
 */
function calculateSumOfArrayElements(numericCollection) {
    let currentTotal = 0;
    for (const numValue of numericCollection) {
        currentTotal += numValue;
    }
    return currentTotal;
}

/**
 * A safety mechanism designed to detect and prevent potential infinite loops.
 * Increments a global counter and throws an error if a predefined maximum is exceeded.
 * @param {number} maxPermittedIterations - The maximum number of iterations allowed before an error is thrown. Defaults to 100,000.
 */
function safeguardLoopExecution(maxPermittedIterations = 1e5) {
    globalLoopSafetyCounter++;
    if (globalLoopSafetyCounter >= maxPermittedIterations) {
        throw new Error("Execution halted: Loop iteration limit reached, suggesting an infinite loop.");
    }
}

/**
 * Determines the largest numeric value in a given array.
 * @param {Array<number>} dataSeries - The array of numbers to search.
 * @param {number|null} startingComparisonValue - An optional initial value to compare against. If null, uses the first array element.
 * @returns {number} The maximum value found in the series.
 * @throws {Error} If the array is empty and no starting comparison value is provided.
 */
function findMaxInNumericArray(dataSeries, startingComparisonValue = null) {
    if (dataSeries.length === 0 && startingComparisonValue === null) {
        throw new Error("Cannot determine maximum from an empty array without an initial comparison value.");
    }
    let currentMaximum = (startingComparisonValue === null) ? dataSeries[0] : startingComparisonValue;
    for (const dataPoint of dataSeries) {
        if (dataPoint > currentMaximum) {
            currentMaximum = dataPoint;
        }
    }
    return currentMaximum;
}

/**
 * Determines the smallest numeric value in a given array.
 * @param {Array<number>} dataSeries - The array of numbers to search.
 * @param {number|null} startingComparisonValue - An optional initial value to compare against. If null, uses the first array element.
 * @returns {number} The minimum value found in the series.
 * @throws {Error} If the array is empty and no starting comparison value is provided.
 */
function findMinInNumericArray(dataSeries, startingComparisonValue = null) {
    if (dataSeries.length === 0 && startingComparisonValue === null) {
        throw new Error("Cannot determine minimum from an empty array without an initial comparison value.");
    }
    let currentMinimum = (startingComparisonValue === null) ? dataSeries[0] : startingComparisonValue;
    for (const dataPoint of dataSeries) {
        if (dataPoint < currentMinimum) {
            currentMinimum = dataPoint;
        }
    }
    return currentMinimum;
}

/**
 * Outputs a deep copy of an object to the console.
 * This is useful for debugging to see the object's state at a specific point
 * without being affected by subsequent modifications to references.
 * @param {any} objectToInspect - The object whose snapshot is to be logged.
 */
function printObjectSnapshot(objectToInspect) {
    console.log(JSON.parse(JSON.stringify(objectToInspect)));
}

/**
 * Performs prime factorization on a given positive integer.
 * @param {number} numberForFactorization - The integer to factorize.
 * @returns {Object<number, number>} An object mapping each prime factor to its exponent.
 */
function factorizeIntoPrimes(numberForFactorization) {
    const primeFactorExponents = {};
    let remainingValue = numberForFactorization; // Use a temporary variable for division.

    // Iterate from 2 up to the square root of the remaining value.
    for (let divisor = 2; divisor * divisor <= remainingValue; ++divisor) {
        // If 'divisor' is a factor, count its occurrences.
        if (remainingValue % divisor === 0) {
            let exponentCount = 0;
            while (remainingValue % divisor === 0) {
                remainingValue /= divisor;
                exponentCount++;
            }
            primeFactorExponents[divisor] = exponentCount;
        }
    }

    // If 'remainingValue' is still greater than 1, it must be a prime factor itself.
    if (remainingValue > 1) {
        primeFactorExponents[remainingValue] = 1;
    }

    return primeFactorExponents;
}

/**
 * Constructs a new two-dimensional array (matrix).
 * @param {number} primaryDimensionLength - The length of the outer array (number of rows).
 * @param {number} secondaryDimensionLength - The length of inner arrays (number of columns). Defaults to 0 for empty inner arrays.
 * @param {any} initialFillValue - The value to pre-fill all cells with. Defaults to 0.
 * @returns {Array<Array<any>>} The newly created 2D array.
 */
function createTwoDimensionalArray(primaryDimensionLength, secondaryDimensionLength = 0, initialFillValue = 0) {
    const matrixStructure = [];
    for (let i = 0; i < primaryDimensionLength; ++i) {
        // Create inner arrays based on secondaryDimensionLength and fillValue.
        const innerRow = secondaryDimensionLength > 0 ? new Array(secondaryDimensionLength).fill(initialFillValue) : [];
        matrixStructure.push(innerRow);
    }
    return matrixStructure;
}

/**
 * Calculates the Greatest Common Divisor (GCD) of two non-negative integers using the Euclidean algorithm (iterative).
 * @param {number} operandA - The first non-negative integer.
 * @param {number} operandB - The second non-negative integer.
 * @returns {number} The GCD of operandA and operandB.
 */
function findGreatestCommonDivisor(operandA, operandB) {
    // Ensure inputs are non-negative.
    operandA = Math.abs(operandA);
    operandB = Math.abs(operandB);
    while (operandB !== 0) {
        const remainder = operandA % operandB;
        operandA = operandB;
        operandB = remainder;
    }
    return operandA;
}

/**
 * Calculates the Least Common Multiple (LCM) of two non-negative integers.
 * Uses the formula: LCM(a, b) = |a * b| / GCD(a, b).
 * @param {number} value1 - The first non-negative integer.
 * @param {number} value2 - The second non-negative integer.
 * @returns {number} The LCM of value1 and value2. Returns 0 if either input is 0.
 */
function findLeastCommonMultiple(value1, value2) {
    if (value1 === 0 || value2 === 0) return 0; // LCM involving 0 is 0.
    return (Math.abs(value1 * value2)) / findGreatestCommonDivisor(value1, value2);
}

/**
 * Checks if a 'candidateSubset' is entirely contained within a 'mainSet'.
 * @param {Set<any>} mainSet - The set that might contain the subset.
 * @param {Set<any>} candidateSubset - The set to check if it's a subset.
 * @returns {boolean} True if candidateSubset is a subset of mainSet, false otherwise.
 */
function isSetASubsetOfAnother(mainSet, candidateSubset) {
    for (const itemOfSubset of candidateSubset) {
        if (!mainSet.has(itemOfSubset)) {
            return false;
        }
    }
    return true;
}

/**
 * Computes the union of two sets, creating a new set containing all unique elements from both.
 * @param {Set<any>} setOne - The first set.
 * @param {Set<any>} setTwo - The second set.
 * @returns {Set<any>} A new Set representing the union.
 */
function computeSetUnion(setOne, setTwo) {
    const combinedSet = new Set(setOne); // Initialize with elements from the first set.
    for (const element of setTwo) {
        combinedSet.add(element); // Add elements from the second set.
    }
    return combinedSet;
}

/**
 * Computes the intersection of two sets, creating a new set with only common elements.
 * @param {Set<any>} setAlpha - The first set.
 * @param {Set<any>} setBeta - The second set.
 * @returns {Set<any>} A new Set representing the intersection.
 */
function computeSetIntersection(setAlpha, setBeta) {
    let commonElementsSet = new Set();
    // For efficiency, iterate over the potentially smaller set if sizes are known.
    for (const item of setBeta) {
        if (setAlpha.has(item)) {
            commonElementsSet.add(item);
        }
    }
    return commonElementsSet;
}

/**
 * Computes the symmetric difference of two sets.
 * This includes elements that are in either set, but not in their intersection.
 * @param {Set<any>} initialSet - The first set.
 * @param {Set<any>} otherSet - The second set.
 * @returns {Set<any>} A new Set representing the symmetric difference.
 */
function computeSetSymmetricDifference(initialSet, otherSet) {
    let differenceSet = new Set(initialSet);
    for (const item of otherSet) {
        if (differenceSet.has(item)) {
            differenceSet.delete(item); // If it's in both, remove it (not in symmetric difference).
        } else {
            differenceSet.add(item); // If it's only in otherSet, add it.
        }
    }
    return differenceSet;
}

/**
 * Computes the set difference (elements in `setA` that are not in `setB`).
 * @param {Set<any>} setA - The set from which elements are to be kept.
 * @param {Set<any>} setB - The set whose elements are to be removed from setA.
 * @returns {Set<any>} A new Set containing elements unique to setA.
 */
function computeSetDifference(setA, setB) {
    let uniqueToSetA = new Set(setA);
    for (const item of setB) {
        uniqueToSetA.delete(item);
    }
    return uniqueToSetA;
}

/**
 * Generates all unique combinations of a specified size from a source array.
 * @param {Array<any>} originalArray - The array of elements to choose from.
 * @param {number} combinationSize - The number of elements in each combination.
 * @returns {Array<Array<any>>} An array where each element is a combination (an array of elements).
 */
function generateAllCombinations(originalArray, combinationSize) {
    const collectionOfCombinations = [];

    /**
     * Recursive helper to build combinations.
     * @param {Array<any>} currentCombination - The combination being built in the current recursion step.
     * @param {number} startIdx - The starting index in `originalArray` for the current selection.
     */
    function recursiveCombinationBuilder(currentCombination, startIdx) {
        // Base case: If the current combination has the desired size, add a copy to the results.
        if (currentCombination.length === combinationSize) {
            collectionOfCombinations.push([...currentCombination]);
            return;
        }

        // Pruning: If it's impossible to form a combination of the desired size
        // with the remaining elements, stop this path.
        if (currentCombination.length + (originalArray.length - startIdx) < combinationSize) {
            return;
        }

        // Recursive step: Iterate from startIdx to choose elements.
        for (let i = startIdx; i < originalArray.length; ++i) {
            currentCombination.push(originalArray[i]); // Include the current element.
            recursiveCombinationBuilder(currentCombination, i + 1); // Recurse with the next index.
            currentCombination.pop(); // Backtrack: remove the current element for the next iteration.
        }
    }

    // Initiate the recursive process.
    recursiveCombinationBuilder([], 0);
    return collectionOfCombinations;
}

/**
 * Calculates the number of permutations (ordered arrangements) of `totalElements` items
 * taken `selectedElements` at a time. P(n, r) = n! / (n-r)!
 * @param {number} totalElements - The total number of items (n).
 * @param {number} selectedElements - The number of items to choose and arrange (r).
 * @returns {number} The number of permutations. Returns 0 for invalid inputs.
 */
function computePermutations(totalElements, selectedElements) {
    if (selectedElements < 0 || selectedElements > totalElements || !Number.isInteger(totalElements) || !Number.isInteger(selectedElements)) {
        return 0; // Invalid input for permutations.
    }
    if (selectedElements === 0) return 1; // P(n, 0) = 1.

    let cumulativeProduct = 1;
    for (let i = 0; i < selectedElements; ++i) {
        cumulativeProduct *= (totalElements - i);
    }
    return cumulativeProduct;
}

/**
 * Calculates the number of combinations (unordered selections) of `totalElements` items
 * taken `selectedElements` at a time. C(n, r) = n! / (r! * (n-r)!)
 * @param {number} totalElements - The total number of items (n).
 * @param {number} selectedElements - The number of items to choose (r).
 * @returns {number} The number of combinations. Returns 0 for invalid inputs.
 */
function computeCombinations(totalElements, selectedElements) {
    if (selectedElements < 0 || selectedElements > totalElements || !Number.isInteger(totalElements) || !Number.isInteger(selectedElements)) {
        return 0; // Invalid input for combinations.
    }
    if (selectedElements === 0 || selectedElements === totalElements) return 1; // C(n, 0) = 1, C(n, n) = 1.
    // Optimization: C(n, r) = C(n, n-r). Choose the smaller 'r' for fewer iterations.
    if (selectedElements > totalElements / 2) {
        selectedElements = totalElements - selectedElements;
    }

    let numeratorPart = 1;
    let denominatorPart = 1;
    for (let i = 0; i < selectedElements; ++i) {
        numeratorPart *= (totalElements - i);
        denominatorPart *= (i + 1);
    }
    return numeratorPart / denominatorPart;
}