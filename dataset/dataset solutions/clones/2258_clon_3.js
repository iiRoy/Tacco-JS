// This program processes numerical data from standard input to calculate
// a specific aggregate sum based on combinations and range differences.
function processInputAndCompute(rawData) {
    // Define a constant for modulo operation, ensuring results stay within bounds.
    const MODULO_CONSTANT = 1000000007;

    // Validate raw input string before processing.
    if (!rawData || typeof rawData !== 'string' || rawData.trim() === '') {
        console.error("Error: Input data is empty or invalid.");
        return; // Exit if input is bad
    }

    // Step 1: Parse the raw text input into a 2D array of numbers.
    // The first line typically contains 'N K' values, subsequent lines contain data.
    const parsedNumericMatrix = convertStringMatrixToNumberMatrix(
        parseRawInputIntoLinesAndTokens(rawData)
    );

    // Basic validation for the parsed input structure.
    if (!parsedNumericMatrix || parsedNumericMatrix.length < 2) {
        console.error("Error: Insufficient data rows in input.");
        return;
    }
    if (parsedNumericMatrix[0].length < 2) {
        console.error("Error: First line must contain at least N and K values.");
        return;
    }

    // Extract problem parameters: total elements (n) and selection size (k).
    // These are typically from the first row of input.
    const totalElementsForCombinations = parsedNumericMatrix[0][0];
    const combinationSize = parsedNumericMatrix[0][1];
    const dataValuesArray = parsedNumericMatrix[1]; // The actual numbers to analyze.

    // Generate all unique combinations of 'combinationSize' indices from 'totalElementsForCombinations'.
    // These combinations represent subsets of indices to be selected from the dataValuesArray.
    const generatedCombinations = generateCombinations(totalElementsForCombinations, combinationSize);

    let cumulativeSum = 0; // Initialize accumulator for the final result.

    // Iterate through each generated combination.
    for (let currentPattern of generatedCombinations) {
        // Calculate the range difference (max - min) for the elements specified by the current pattern.
        const rangeResult = calculateRangeDifference(dataValuesArray, currentPattern);

        // Add the calculated range result to the cumulative sum, applying modulo.
        cumulativeSum = (cumulativeSum + rangeResult) % MODULO_CONSTANT;
    }

    // Output the final computed aggregate sum.
    console.log(cumulativeSum);
}

// Function to compute the difference between the maximum and minimum values
// within a given array, based on a set of 1-indexed pattern indices.
function calculateRangeDifference(sourceArray, patternIndices) {
    // If the pattern is empty, there's no range, so return 0.
    if (!patternIndices || patternIndices.length === 0) {
        return 0;
    }

    // Initialize minimum and maximum values using the first element of the pattern.
    // Adjust for 1-based indexing in the pattern.
    let currentMinimum = sourceArray[patternIndices[0] - 1];
    let currentMaximum = sourceArray[patternIndices[0] - 1];

    // Iterate through the rest of the pattern indices to find the true min and max.
    for (let i = 1; i < patternIndices.length; i++) {
        const valueAtIndex = sourceArray[patternIndices[i] - 1];
        currentMinimum = Math.min(currentMinimum, valueAtIndex);
        // Fix: The original code had a bug here, comparing 'mi' instead of 'ma'.
        // This ensures 'currentMaximum' correctly tracks the overall maximum.
        currentMaximum = Math.max(currentMaximum, valueAtIndex);
    }

    // Return the difference between the maximum and minimum values found.
    return (currentMaximum - currentMinimum);
}

// Function responsible for taking raw multi-line string input
// and transforming it into a 2D array of strings (lines and their tokens).
function parseRawInputIntoLinesAndTokens(rawTextContent) {
    // Split the input string into individual lines, handling various newline characters.
    const lines = rawTextContent.split(/\r?\n/);
    const tokenizedLines = [];

    // Process each line.
    for (const line of lines) {
        // Trim whitespace from the line and skip if it becomes empty.
        const trimmedLine = line.trim();
        if (trimmedLine === '') {
            continue;
        }
        // Split the trimmed line by space characters to get individual tokens.
        tokenizedLines.push(trimmedLine.split(" "));
    }
    return tokenizedLines;
}

// Function to convert a 2D array of string tokens into a 2D array of numbers.
// This is typically used after `parseRawInputIntoLinesAndTokens`.
function convertStringMatrixToNumberMatrix(stringMatrix) {
    // If the input matrix is null or empty, return an empty array.
    if (!stringMatrix || stringMatrix.length === 0) {
        return [];
    }

    // Use `map` to transform each row and each element within the row.
    const numericMatrix = stringMatrix.map(rowOfStrings => {
        // Validate if 'rowOfStrings' is an array.
        if (!Array.isArray(rowOfStrings)) {
            console.warn("Warning: Expected an array of strings, got:", rowOfStrings);
            return []; // Return an empty row to prevent errors
        }
        return rowOfStrings.map(strValue => {
            // Convert each string token to a number.
            // `Number()` is used for explicit type conversion, handles floats and integers.
            // `parseInt()` could also be used if only integers are expected.
            const num = Number(strValue);
            // Optional: Add a check for NaN if non-numeric input is possible and needs special handling.
            if (isNaN(num)) {
                console.warn(`Warning: Could not convert "${strValue}" to a number. Using 0.`);
                return 0; // Default to 0 or throw an error based on requirements
            }
            return num;
        });
    });
    return numericMatrix;
}

// Function to generate all combinations of 'selectionSize' elements
// chosen from a set of 'totalElements' (represented as numbers from 1 to totalElements).
function generateCombinations(totalElements, selectionSize) {
    const allCombinations = []; // Stores the final list of combinations.

    // Basic input validation for combination parameters.
    if (selectionSize < 0 || totalElements < 0) {
        console.warn("Combination parameters cannot be negative.");
        return allCombinations;
    }
    if (selectionSize === 0) {
        allCombinations.push([]); // Only one way to choose 0 elements: an empty set.
        return allCombinations;
    }
    if (selectionSize > totalElements) {
        return allCombinations; // Cannot choose more elements than available.
    }

    // Initialize the first combination: [1, 2, ..., selectionSize].
    let currentCombination = [];
    for (let i = 1; i <= selectionSize; i++) {
        currentCombination.push(i);
    }

    // Iteratively generate subsequent combinations.
    // This loop continues until all combinations have been found.
    while (true) {
        // Add a copy of the current combination to the results.
        allCombinations.push([...currentCombination]);

        // Find the rightmost element in the current combination that can be incremented.
        // This element is `currentCombination[adjustableIndex]`
        let adjustableIndex = selectionSize - 1;
        while (adjustableIndex >= 0 &&
               currentCombination[adjustableIndex] === totalElements - (selectionSize - 1 - adjustableIndex)) {
            adjustableIndex--;
        }

        // If no element can be incremented, it means all combinations have been generated.
        if (adjustableIndex < 0) {
            break;
        }

        // Increment the found element and update subsequent elements.
        currentCombination[adjustableIndex]++;
        for (let j = adjustableIndex + 1; j < selectionSize; j++) {
            currentCombination[j] = currentCombination[j - 1] + 1;
        }
    }

    return allCombinations;
}


// --- DO NOT EDIT BELOW THIS LINE ---
// This section handles reading from standard input and invoking the main processing function.
// It's typically used in competitive programming environments.
processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));
// Example usage with a hardcoded string input for local testing:
// processInputAndCompute("4 2\n1 1 3 4");
// Expected output for "4 2\n1 1 3 4":
// Combinations of (1,2,3,4) taken 2 at a time:
// [1,2] -> values arr[0], arr[1] -> (1,1) -> 1-1=0
// [1,3] -> values arr[0], arr[2] -> (1,3) -> 3-1=2
// [1,4] -> values arr[0], arr[3] -> (1,4) -> 4-1=3
// [2,3] -> values arr[1], arr[2] -> (1,3) -> 3-1=2
// [2,4] -> values arr[1], arr[3] -> (1,4) -> 4-1=3
// [3,4] -> values arr[2], arr[3] -> (3,4) -> 4-3=1
// Sum = (0+2+3+2+3+1) % 1000000007 = 11