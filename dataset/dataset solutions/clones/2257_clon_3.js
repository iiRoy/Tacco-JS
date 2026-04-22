// This module processes a given input string to calculate a specific combinatorial difference.
function processInputData(rawData) {
    // A large prime number used for modulo operations to keep results within bounds.
    const modulusConstant = 1000000007;

    // First, convert the raw string input into a structured array of string arrays.
    // Then, parse all elements in this structure into integers.
    const numericDataMatrix = convertToNumericMatrix(parseRawInputIntoStringMatrix(rawData));

    // Extract problem parameters from the first line of input.
    const totalElementsCount = numericDataMatrix[0][0];
    const selectionSize = numericDataMatrix[0][1];

    // The core list of numbers for calculations, extracted from the second line.
    let numberSet = numericDataMatrix[1];

    // Sort the numbers in descending order to facilitate calculations for maximum and minimum sums.
    // The comparison function ensures 'a' comes before 'b' if 'a' is greater than 'b'.
    numberSet.sort((firstVal, secondVal) => secondVal - firstVal);

    // Initialize an object to hold the accumulated sums for maximum and minimum scenarios.
    const accumulatedSums = {
        maximumPossible: 0,
        minimumPossible: 0
    };

    // Calculate the maximum sum: Iterate through the sorted list, considering elements that contribute to the largest sum.
    // The loop runs from the first element up to the point where 'k' elements can still be selected from the remaining.
    for (let currentIdx = 0; currentIdx <= numberSet.length - selectionSize; currentIdx++) {
        const currentNumber = numberSet[currentIdx];
        // Calculate C(n-1-i, k-1) where n is totalElementsCount, i is currentIdx.
        // This represents the number of ways to choose k-1 other elements from the remaining n-1-i elements.
        const combinationsCount = calculateBinomialCoefficient(totalElementsCount - currentIdx - 1, selectionSize - 1);
        accumulatedSums.maximumPossible = (accumulatedSums.maximumPossible + (currentNumber * combinationsCount));
    }

    // Calculate the minimum sum: Iterate through the sorted list, focusing on elements that contribute to the smallest sum.
    // This loop starts from the (k-1)-th element (0-indexed) because the smallest k elements will be at the end of the sorted list.
    for (let currentIdx = selectionSize - 1; currentIdx < numberSet.length; currentIdx++) {
        const currentNumber = numberSet[currentIdx];
        // Calculate C(i, k-1) where i is currentIdx.
        // This represents the number of ways to choose k-1 elements from the i elements encountered so far (including current).
        const combinationsCount = calculateBinomialCoefficient(currentIdx, selectionSize - 1);
        accumulatedSums.minimumPossible = (accumulatedSums.minimumPossible + (currentNumber * combinationsCount));
    }

    // The final result is the difference between the maximum and minimum sums, taken modulo the modulusConstant.
    // Ensure the result is non-negative using (x % m + m) % m pattern, as JavaScript's % can return negative for negative inputs.
    let finalResult = (accumulatedSums.maximumPossible - accumulatedSums.minimumPossible);
    finalResult = (finalResult % modulusConstant + modulusConstant) % modulusConstant;

    console.log(finalResult); // Output the computed result.
}

/**
 * Computes the binomial coefficient C(n, k), which is "n choose k".
 * This function calculates the number of ways to choose k items from a set of n distinct items.
 * @param {number} totalItems - The total number of items (n).
 * @param {number} itemsToChoose - The number of items to choose (k).
 * @returns {number} The binomial coefficient C(n, k).
 */
function calculateBinomialCoefficient(totalItems, itemsToChoose) {
    // Edge cases for combinations.
    if (itemsToChoose < 0 || itemsToChoose > totalItems) {
        return 0; // Cannot choose a negative number of items or more items than available.
    }
    if (itemsToChoose === 0 || itemsToChoose === totalItems) {
        return 1; // There's one way to choose 0 items (choose nothing) or all n items.
    }
    // Optimization: C(n, k) = C(n, n-k). Choose the smaller k for fewer iterations.
    if (itemsToChoose > totalItems / 2) {
        itemsToChoose = totalItems - itemsToChoose;
    }

    let productNumerator = 1; // Stores n * (n-1) * ... * (n-k+1)
    let productDenominator = 1; // Stores k * (k-1) * ... * 1

    // Calculate the products for the numerator and denominator.
    // This avoids calculating full factorials, which can overflow quickly.
    for (let currentStep = 0; currentStep < itemsToChoose; currentStep++) {
        productNumerator *= (totalItems - currentStep);
        productDenominator *= (currentStep + 1);
    }
    // Return the result of the division.
    // Note: In competitive programming contexts, this often needs modular inverse if modulus is involved,
    // but the original code implies direct division is acceptable, potentially due to problem constraints
    // or the nature of intermediate products.
    return productNumerator / productDenominator;
}

/**
 * Converts a raw multi-line string input into a 2D array (matrix) of strings.
 * Each line becomes a row, and elements separated by spaces become columns.
 * @param {string} rawStringInput - The entire input as a single string.
 * @returns {string[][]} A 2D array where each inner array represents a line split by spaces.
 */
function parseRawInputIntoStringMatrix(rawStringInput) {
    const lineStrings = rawStringInput.trim().split("\n"); // Split by newline, trim to handle empty lines.
    const stringMatrixResult = [];

    // Iterate over each line to split it by spaces.
    for (let lineIndex = 0; lineIndex < lineStrings.length; lineIndex++) {
        if (lineStrings[lineIndex].length > 0) { // Only process non-empty lines
            stringMatrixResult.push(lineStrings[lineIndex].split(" "));
        }
    }
    return stringMatrixResult;
}

/**
 * Transforms a 2D array of strings into a 2D array of numbers.
 * Each string element is parsed into an integer.
 * @param {string[][]} stringMatrix - A 2D array of strings.
 * @returns {number[][]} A 2D array of numbers.
 */
function convertToNumericMatrix(stringMatrix) {
    // Use map for a more functional and concise transformation.
    return stringMatrix.map(rowOfStrings => {
        return rowOfStrings.map(strElement => parseInt(strElement, 10)); // Base 10 for parseInt.
    });
}

// The following line should not be edited according to the problem statement.
// It's responsible for reading standard input and invoking the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));