const outputChannel = console.log; // Redefine logging for potential future customization

// --- Input Handling Environment Setup ---

// Check if running in a Node.js environment and not in a test context
if (typeof process !== "undefined" && process.env.NODE_ENV !== "test") {
    let accumulatedRawInput = ''; // Buffer to store all incoming data

    // Activate standard input stream and specify character encoding
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    // Event handler for each received data segment
    process.stdin.on('data', (incomingDataSegment) => {
        // Append the new segment to the total buffer
        accumulatedRawInput = accumulatedRawInput.concat(incomingDataSegment);
    });

    // Event handler for when the input stream concludes
    process.stdin.on('end', () => {
        // Split the complete input into an array of lines,
        // robustly handling both Windows and Unix line endings.
        const structuredInputLines = accumulatedRawInput.split(/\r?\n/);
        // Pass the prepared lines to the main processing routine
        initiateDataProcessing(structuredInputLines);
    });
} else {
    // Provide a fallback or warning for non-Node.js environments or during testing
    outputChannel("Application operating outside of Node.js or in test mode. Standard input processing is inactive.");
    // Optionally, one could call initiateDataProcessing with mock data here for standalone execution.
    // Example: initiateDataProcessing(["mock_string_one", "mock_string_two", "another_mock_a", "another_mock_b"]);
}

// --- Utility Functions ---

/**
 * Determines if a given character is a lowercase English alphabet letter.
 * @param {string} charToEvaluate - The character to check.
 * @returns {boolean} True if the character is a lowercase letter, false otherwise.
 */
const isLowercaseAlphabetical = (charToEvaluate) => {
    const characterCode = charToEvaluate.charCodeAt(0);
    const codeForA = 'a'.charCodeAt(0);
    const codeForZ = 'z'.charCodeAt(0);
    return characterCode >= codeForA && characterCode <= codeForZ;
};

// --- Core Application Logic ---

/**
 * Entry point for processing a collection of input lines, grouped into pairs.
 * Each pair represents a dataset for similarity calculation.
 * @param {string[]} allAvailableLines - An array of strings, each representing an input line.
 */
function initiateDataProcessing(allAvailableLines) {
    // Implement a guard clause for empty or invalid input
    if (!allAvailableLines || allAvailableLines.length === 0) {
        outputChannel("Error: No input data provided for processing.");
        return;
    }

    // Create a mutable copy of the input lines to safely modify during processing
    let pendingLines = [...allAvailableLines];

    // Remove the very first line, often a header or count, if present and not needed.
    // This mirrors the original `lines.shift()` behavior.
    if (pendingLines.length > 0) {
        pendingLines.shift();
    }

    let processedDatasetCount = 0; // Keep track of how many datasets are processed

    // Loop until there are fewer than two lines left (not enough for a pair)
    while (pendingLines.length >= 2) {
        processedDatasetCount++;

        // Extract the next two lines as a pair for the current dataset
        // `splice(0, 2)` removes and returns the first two elements.
        const [firstRawString, secondRawString] = pendingLines.splice(0, 2);

        // Pre-process each string in the pair: filter out non-lowercase-alpha characters
        const cleanedStringPair = [firstRawString, secondRawString].map(rawEntry => {
            return rawEntry.split('').filter(isLowercaseAlphabetical).join('');
        });

        // Pass the cleaned string pair to the detailed similarity calculation function
        computePairwiseSimilarity(cleanedStringPair);
    }

    // Log any remaining lines that couldn't form a complete pair
    if (pendingLines.length > 0) {
        outputChannel(`Note: ${pendingLines.length} unprocessable line(s) remaining at the end.`);
    }
    outputChannel(`Summary: Successfully processed ${processedDatasetCount} distinct datasets.`);
}

/**
 * Performs dynamic programming to calculate a specific similarity metric between two strings.
 * The result, derived from the computed matrix, is then logged.
 * @param {string[]} stringOperands - An array containing exactly two cleaned strings for comparison.
 */
function computePairwiseSimilarity(stringOperands) {
    // Destructure the input array into named string variables for clarity
    const [alphaString, betaString] = stringOperands;

    // Retrieve lengths for iteration bounds
    const alphaLength = alphaString.length;
    const betaLength = betaString.length;

    // Guard clause: Handle cases where one or both strings are empty
    if (alphaLength === 0 || betaLength === 0) {
        outputChannel(`Similarity for ['${alphaString}', '${betaString}']: 0 (due to empty string)`);
        return;
    }

    // Initialize the 2D array (dynamic programming grid) for memoization
    const dpGrid = [];

    // Iterate through each character of the first string (rows of the DP grid)
    for (let currentAlphaIndex = 0; currentAlphaIndex < alphaLength; currentAlphaIndex++) {
        // Initialize the current row as an empty array
        dpGrid[currentAlphaIndex] = [];

        // Iterate through each character of the second string (columns of the DP grid)
        for (let currentBetaIndex = 0; currentBetaIndex < betaLength; currentBetaIndex++) {
            // Determine if the characters at the current indices are identical
            const charComparisonValue = (alphaString[currentAlphaIndex] === betaString[currentBetaIndex]) ? 1 : 0;

            // Apply the dynamic programming recurrence relation
            if (currentAlphaIndex === 0 && currentBetaIndex === 0) {
                // Base case: The very first cell (top-left corner)
                dpGrid[currentAlphaIndex][currentBetaIndex] = charComparisonValue;
            } else if (currentAlphaIndex === 0) {
                // First row: Value depends on the previous column's value and current character match
                dpGrid[currentAlphaIndex][currentBetaIndex] = Math.max(dpGrid[currentAlphaIndex][currentBetaIndex - 1], charComparisonValue);
            } else if (currentBetaIndex === 0) {
                // First column: Value depends on the previous row's value and current character match
                dpGrid[currentAlphaIndex][currentBetaIndex] = Math.max(dpGrid[currentAlphaIndex - 1][currentBetaIndex], charComparisonValue);
            } else {
                // General case: Value depends on adjacent cells (above and left)
                const valueFromAbove = dpGrid[currentAlphaIndex - 1][currentBetaIndex];
                const valueFromLeft = dpGrid[currentAlphaIndex][currentBetaIndex - 1];

                // Calculate the first part of the formula: max of neighbors plus current match
                const intermediateCalculation = Math.max(valueFromAbove, valueFromLeft) + charComparisonValue;

                // Calculate the second part of the formula: minimum of current indices plus one (a ceiling)
                const limitingFactor = Math.min(currentAlphaIndex, currentBetaIndex) + 1;

                // The final cell value is the minimum of these two calculated parts
                dpGrid[currentAlphaIndex][currentBetaIndex] = Math.min(intermediateCalculation, limitingFactor);
            }
        }
    }

    // Retrieve the final similarity score, which is the value in the bottom-right cell of the DP grid.
    // The original code used `A.pop().pop()`, implying the last element of the last row.
    const finalSimilarityScore = dpGrid[alphaLength - 1][betaLength - 1];

    // Output the computed result for the current string pair
    outputChannel(`Similarity for ['${alphaString}', '${betaString}']: ${finalSimilarityScore}`);

    // Add a non-essential validation or informational fragment (Type III addition)
    if (alphaLength > 100 || betaLength > 100) {
        outputChannel("Info: Processed pair includes very long strings. Consider performance implications.");
    }
}