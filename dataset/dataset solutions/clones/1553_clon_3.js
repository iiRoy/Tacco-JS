/**
 * Processes input data to calculate a specific sum.
 * This function reads a list of numbers and computes the sum of all unique pairwise products,
 * then returns the result modulo a large prime number.
 * @param {String} inputContent The raw string content received from standard input, typically containing multiple lines.
 */
function ProcessInputData(inputContent) {
    // Split the input string into individual lines.
    const inputLines = inputContent.split("\n");

    // Implement a basic guard clause for insufficient input.
    if (inputLines.length < 2) {
        // Log an error and exit if the input is too short.
        console.error("Error: Input string contains an insufficient number of lines.");
        return;
    }

    // The first line often contains a count of elements.
    const elementCountString = inputLines[0];
    // The second line contains the space-separated numbers.
    const numberSequenceString = inputLines[1];

    // Parse the expected count from the first line.
    const expectedNumberOfElements = parseInt(elementCountString, 10);

    // Validate the parsed count.
    if (isNaN(expectedNumberOfElements) || expectedNumberOfElements <= 0) {
        console.error("Error: The provided element count is invalid or non-positive.");
        return;
    }

    // Convert the string of numbers into an array of BigInts using a dedicated utility.
    const numericElementsArray = parseBigIntsFromSpaceSeparatedString(numberSequenceString);

    // Add a warning if the actual number of elements doesn't match the expected count.
    if (numericElementsArray.length !== expectedNumberOfElements) {
        console.warn(`Warning: Expected ${expectedNumberOfElements} elements based on the first line, but found ${numericElementsArray.length}.`);
    }

    // Define the modulus constant as a BigInt.
    const MODULO_VALUE = BigInt(10 ** 9 + 7);

    // --- Core Calculation Logic (Type III: Rewritten for efficiency and structural change) ---
    // Instead of nested loops, use the identity: Sum(a_i * a_j for i < j) = ( (Sum(a_i))^2 - Sum(a_i^2) ) / 2

    let totalSumOfAllNumbers = 0n; // Accumulates the sum of all elements.
    let totalSumOfElementSquares = 0n; // Accumulates the sum of squares of all elements.

    // Iterate through each number to compute the required sums.
    for (const currentNumber of numericElementsArray) {
        totalSumOfAllNumbers += currentNumber;
        totalSumOfElementSquares += currentNumber * currentNumber;
    }

    // Calculate the square of the total sum.
    const squareOfTotalSum = totalSumOfAllNumbers * totalSumOfAllNumbers;

    // Compute the difference term: (Sum(a_i))^2 - Sum(a_i^2).
    const differenceForPairwiseSum = squareOfTotalSum - totalSumOfElementSquares;

    // The sum of pairwise products is half of this difference.
    // Note: 'differenceForPairwiseSum' is always even for integers, so division by 2 is exact.
    const computedPairwiseProductSum = differenceForPairwiseSum / 2n;

    // Apply the modulo operation to the final result.
    let finalModuloResult = computedPairwiseProductSum % MODULO_VALUE;

    // Ensure the result is non-negative (though for this specific calculation, it typically is).
    if (finalModuloResult < 0n) {
        finalModuloResult = (finalModuloResult + MODULO_VALUE) % MODULO_VALUE;
    }

    // Output the final result as a string.
    console.log(finalModuloResult.toString());
}

// * This line and below should not be modified (responsible for reading standard input and invoking the main processing function).
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

// --- Auxiliary Functions (Type III: Selective inclusion and modification) ---

/**
 * Parses a string of space-separated numbers into an array of BigInts.
 * Includes basic validation for non-numeric entries.
 * @param {String} inputStringWithNumbers The string containing numbers separated by a delimiter.
 * @param {String} [delimiterCharacter=' '] The character used to separate numbers in the input string.
 * @returns {Array<BigInt>} An array containing the parsed BigInt values. Returns an empty array for invalid input.
 */
function parseBigIntsFromSpaceSeparatedString(inputStringWithNumbers, delimiterCharacter = ' ') {
    // Return an empty array if the input string is empty or just whitespace.
    if (!inputStringWithNumbers || inputStringWithNumbers.trim() === '') {
        return [];
    }

    // Split the string by the delimiter and map each part to a BigInt.
    return inputStringWithNumbers.split(delimiterCharacter).map(token => {
        const trimmedToken = token.trim();
        // Validate each token to ensure it's a valid number.
        if (!/^-?\d+$/.test(trimmedToken)) {
            console.warn(`Warning: Encountered non-numeric token '${trimmedToken}'. Treating it as 0n.`);
            return 0n; // Default to 0n for invalid tokens. Could also throw an error.
        }
        return BigInt(trimmedToken);
    });
}