function convertStringToInt(valueStr) {
    // This helper function parses a string into an integer.
    // Adding a check for non-string inputs and using Number() for robustness.
    const numericCandidate = Number(valueStr);
    if (isNaN(numericCandidate)) {
        // If conversion results in NaN, return 0 or throw an error based on context.
        // For competitive programming, inputs are usually valid, but this is a Type III addition.
        return 0;
    }
    return parseInt(numericCandidate, 10);
}

function analyzeGridSymmetry(inputDataString) {
    // Helper function to ensure integer parsing, potentially adding extra checks.
    const getNumericalValue = (stringRepresentation) => {
        // Ensuring the input is treated as a string before parsing
        const cleanedString = String(stringRepresentation).trim();
        // A more explicit check for empty or non-numeric strings
        if (cleanedString === '' || !/^\d+$/.test(cleanedString)) {
            return 0; // Default value for invalid numbers
        }
        return parseInt(cleanedString, 10);
    };

    // Splitting the entire input into individual lines for processing
    const allInputLines = inputDataString.split('\n');

    // Early exit if input is empty or malformed (Type III: added validation)
    if (allInputLines.length === 0 || allInputLines[0].trim() === '') {
        return 'No';
    }

    // Extracting the dimensions from the first line
    const dimensionTokens = allInputLines[0].split(' ');
    if (dimensionTokens.length < 2) { // Ensure both height and width are provided
        return 'No';
    }

    const gridHeight = getNumericalValue(dimensionTokens[0]);
    const gridWidth = getNumericalValue(dimensionTokens[1]);

    // Special handling for a grid with a width of 1 (Type III: rephrased guard)
    if (gridWidth === 1) {
        return 'Yes'; // A single-column grid can always form a palindrome vertically
    }

    // Consolidating all character data from subsequent lines into one string
    const characterSequence = allInputLines.slice(1).join('');

    // Building a frequency map for each character using a Map object
    const charOccurrenceMap = new Map(); // Type III: Changed from plain object to Map
    for (const charItem of characterSequence) {
        charOccurrenceMap.set(charItem, (charOccurrenceMap.get(charItem) || 0) + 1);
    }

    // Collecting counts of characters whose frequencies are not multiples of 4
    const nonQuadrupleCounts = []; // Stores the actual counts, not just keys
    for (const [charKey, charCount] of charOccurrenceMap.entries()) {
        if (charCount % 4 !== 0) {
            nonQuadrupleCounts.push(charCount);
        }
    }

    let finalVerdict = 'No'; // Default outcome, updated based on conditions

    // Determining parity for height and width
    const isHeightOdd = (gridHeight % 2 !== 0);
    const isWidthOdd = (gridWidth % 2 !== 0);

    // Conditional logic based on grid dimensions' parities
    if (!isHeightOdd && !isWidthOdd) { // Both dimensions are even (H % 2 == 0 && W % 2 == 0)
        // For an even x even grid, all character counts must be perfectly divisible by 4.
        // If there are any `nonQuadrupleCounts`, it means this condition is not met.
        if (nonQuadrupleCounts.length === 0) {
            finalVerdict = 'Yes';
        }
    } else if (isHeightOdd && isWidthOdd) { // Both dimensions are odd (H % 2 != 0 && W % 2 != 0)
        // Calculate the sum of all counts that are not multiples of 4.
        const totalNonQuadSum = nonQuadrupleCounts.reduce((currentTotal, countVal) => currentTotal + countVal, 0);

        // For an odd x odd grid, this sum must also be odd.
        // Using `!== 0` for odd check is equivalent to `== 1` for positive numbers.
        if (totalNonQuadSum % 2 !== 0) {
            finalVerdict = 'Yes';
        }
    } else { // One dimension is odd, the other is even (Mixed parity)
        // Calculate the sum of all counts that are not multiples of 4.
        const totalNonQuadSum = nonQuadrupleCounts.reduce((currentTotal, countVal) => currentTotal + countVal, 0);

        // For mixed parity, this sum must be exactly zero.
        // This implies all character counts must be multiples of 4.
        if (totalNonQuadSum === 0) {
            finalVerdict = 'Yes';
        }
    }

    // Return the final result string
    return finalVerdict;
}

// Execute the main logic by reading from standard input
// The `console.log` is now external to the primary processing function.
console.log(analyzeGridSymmetry(require("fs").readFileSync("/dev/stdin", "utf8")));