const InputDataService = (function() {
    // Helper function to safely convert a string token to an integer.
    // Throws an error for invalid number formats.
    const parseNumericToken = (strValue) => {
        const parsedNum = Number(strValue);
        if (isNaN(parsedNum)) {
            throw new Error(`Data parsing error: Expected a numeric value, received "${strValue}".`);
        }
        return parsedNum;
    };

    // Class responsible for reading and parsing input data line by line.
    class DataStreamProcessor {
        constructor(rawInputContent) {
            // Process raw input: split into lines, trim whitespace, and filter out any empty lines.
            this._sourceDataLines = rawInputContent.split('\n')
                                            .map(line => line.trim())
                                            .filter(line => line.length > 0);
            this._currentLinePosition = 0; // Tracks the index of the current line being processed.
            // Stores an array of tokens (parts) from the current line.
            // This allows reading multiple values from a single line sequentially.
            this._currentLineTokens = [];
        }

        // Internal helper to split a line string into tokens (words) and optionally convert them to numbers.
        _tokenizeAndConvertLine(lineString, asStrings = false) {
            // Split by one or more whitespace characters, filtering out any empty strings resulting from multiple spaces.
            const tokens = lineString.split(/\s+/).filter(Boolean);
            return asStrings ? tokens : tokens.map(parseNumericToken);
        }

        // Reads and returns a single value (number or string) from the input stream.
        // It consumes values from the right-hand side of the current line, then moves to the next line.
        getValue(returnAsString = false) {
            // If the current line's tokens are exhausted or this is the first read for a new line.
            if (this._currentLineTokens.length === 0) {
                // Check for end of input to prevent out-of-bounds access.
                if (this._currentLinePosition >= this._sourceDataLines.length) {
                    throw new Error("Input stream exhausted. No more values to read.");
                }
                const rawLine = this._sourceDataLines[this._currentLinePosition];
                // The original logic read values from right to left using `reverse().pop()`. We replicate this.
                this._currentLineTokens = this._tokenizeAndConvertLine(rawLine, true).reverse();
                // Important: The line position is NOT advanced here. It advances only when the line is fully consumed.
            }

            const extractedToken = this._currentLineTokens.pop(); // Retrieve the rightmost token.

            // If the current line is now empty of tokens, advance to the next line.
            if (this._currentLineTokens.length === 0) {
                this._currentLinePosition++;
            }

            return returnAsString ? extractedToken : parseNumericToken(extractedToken);
        }

        // Reads an entire line from the input stream and returns its values as an array.
        // This method bypasses the single-value token buffer and directly processes a full line.
        getLineValuesArray(returnStrings = false) {
            if (this._currentLinePosition >= this._sourceDataLines.length) {
                throw new Error("Input stream exhausted. No more lines to read.");
            }
            const lineToParse = this._sourceDataLines[this._currentLinePosition++];
            this._currentLineTokens = []; // Clear any partially consumed tokens from previous `getValue` calls.
            return this._tokenizeAndConvertLine(lineToParse, returnStrings);
        }

        // Reads a specified number of lines, where each line is expected to contain a single value.
        // Returns an array of these single values.
        getSingleColumnArray(numberOfRows, returnStrings = false) {
            const collectedItems = [];
            for (let i = 0; i < numberOfRows; i++) {
                if (this._currentLinePosition >= this._sourceDataLines.length) {
                    throw new Error(`Input stream exhausted. Expected ${numberOfRows} lines, but only ${i} were found.`);
                }
                const lineData = this._sourceDataLines[this._currentLinePosition++];
                this._currentLineTokens = []; // Clear current line tokens.
                const parsedItem = this._tokenizeAndConvertLine(lineData, returnStrings)[0]; // Assume one value per line.
                collectedItems.push(parsedItem);
            }
            return collectedItems;
        }

        // Reads a specified number of lines, parsing each into an array of values,
        // and returns a 2D array (matrix).
        getMatrixOfValues(numMatrixRows, returnStrings = false) {
            const matrixResult = [];
            for (let i = 0; i < numMatrixRows; i++) {
                matrixResult.push(this.getLineValuesArray(returnStrings)); // Reuses `getLineValuesArray`.
            }
            return matrixResult;
        }
    }

    // The factory function that creates and returns a new DataStreamProcessor instance.
    return (inputString) => new DataStreamProcessor(inputString);
})();

// --- Application Logic ---

let standardInputContent;
try {
    // Attempt to read input from standard input, typical in competitive programming environments.
    const fileSystem = require("fs");
    standardInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
} catch (error) {
    // Enhanced error handling for input reading.
    console.error("Critical Error: Failed to read input from /dev/stdin. Details:", error.message);
    process.exit(1); // Exit with an error code.
}

// Create an instance of our input data service.
const dataInputReader = InputDataService(standardInputContent);

// Execute the primary algorithm and print the result.
console.log(computePowerOfTwoSumPairs());

// Main function encapsulating the problem's core logic.
function computePowerOfTwoSumPairs() {
    // Read the total count of elements.
    const declaredElementCount = dataInputReader.getValue();

    // Read the array of numbers for processing.
    const numericDataArray = dataInputReader.getLineValuesArray();

    // Type III Addition: Input validation guard clause.
    if (numericDataArray.length !== declaredElementCount) {
        console.error(`Validation Error: Declared element count (${declaredElementCount}) does not match actual array length (${numericDataArray.length}).`);
        return -1; // Indicate an error state.
    }

    // Use a Map to store frequencies, which is generally more robust for arbitrary keys than plain objects.
    const elementFrequencyMap = new Map();

    // Populate the frequency map for all numbers in the input array.
    // Type III Update: Using `for...of` loop and Map methods.
    for (const numberValue of numericDataArray) {
        elementFrequencyMap.set(numberValue, (elementFrequencyMap.get(numberValue) || 0) + 1);
    }

    // Sort the array in descending order. This helps in optimizing the power-of-two search.
    numericDataArray.sort((valA, valB) => valB - valA);

    // Pre-calculate powers of two.
    // The original code started with [2] and generated up to a[0].
    // Let's generate enough powers to cover sums up to at least twice the maximum value.
    const powersOfTwoList = [];
    let currentPowerIteration = 1; // Starting with 2^0 = 1, then multiplying.
    const maximumInputValue = numericDataArray[0]; // Largest element after sorting.

    // Type III Update: More explicit generation of powers of two.
    // Ensures we have powers of two that are at least `maximumInputValue` and potentially up to `2 * maximumInputValue`.
    // The loop condition is chosen to generate powers of two relevant for sums.
    while (currentPowerIteration <= (maximumInputValue * 2)) {
        powersOfTwoList.push(currentPowerIteration);
        // Type III Addition: Guard against potential numeric overflow for very large inputs.
        if (currentPowerIteration > Number.MAX_SAFE_INTEGER / 2) {
            console.warn("Warning: Power of two calculation approaching Number.MAX_SAFE_INTEGER. Potential precision issues for extremely large inputs.");
            break;
        }
        currentPowerIteration *= 2;
    }

    // `currentPowerIdx` (renamed from 'u') will track the relevant power of two.
    // Initialize it to point to the largest generated power of two.
    let currentPowerIdx = powersOfTwoList.length - 1;

    let totalPairCount = 0; // Accumulator for the final answer.

    // Iterate through each number in the sorted input array to find pairs.
    // Type III Update: Using `for...of` loop for clarity.
    for (const currentNumber of numericDataArray) {
        // Decrement the count for the current number in the frequency map.
        // This marks it as "used" for potential pairing, crucial for correct self-pairing (e.g., 2+2=4).
        elementFrequencyMap.set(currentNumber, elementFrequencyMap.get(currentNumber) - 1);

        // Type III Update: Refined logic for adjusting `currentPowerIdx`.
        // This loop finds the smallest power of two `powersOfTwoList[currentPowerIdx]`
        // such that `powersOfTwoList[currentPowerIdx]` is greater than or equal to `currentNumber`.
        // This ensures `targetComplement` will be non-negative.
        while (currentPowerIdx > 0 && powersOfTwoList[currentPowerIdx - 1] >= currentNumber) {
            currentPowerIdx--;
        }

        // Calculate the value needed to sum with `currentNumber` to reach the chosen power of two.
        const targetComplement = powersOfTwoList[currentPowerIdx] - currentNumber;

        // Type III Addition & Update: More explicit checks for complement validity.
        // Check if the `targetComplement` is non-negative and exists in the map with a count greater than zero.
        if (targetComplement >= 0 && elementFrequencyMap.has(targetComplement) && elementFrequencyMap.get(targetComplement) > 0) {
            // Decrement the count for the complement (as it's now "used") and increment the total pair count.
            elementFrequencyMap.set(targetComplement, elementFrequencyMap.get(targetComplement) - 1);
            totalPairCount++;
        }
    }

    return totalPairCount;
}