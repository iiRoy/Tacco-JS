const displayResult = (valueToPrint) => {
    console.log(valueToPrint);
};

// --- Environment-specific input acquisition block ---
// This section handles reading input data when executed in a Node.js environment.
// It checks for the global 'process' object, which is indicative of Node.js.
if (typeof process !== "undefined" && process.stdin) {
    let receivedInputBuffer = ''; // Accumulates incoming data chunks from stdin.

    // Resume standard input stream to listen for data.
    // Ensure the encoding is set for proper string interpretation.
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    // Register a listener for 'data' events: append each chunk to the buffer.
    process.stdin.on('data', (dataChunk) => {
        receivedInputBuffer += dataChunk;
    });

    // Register a listener for the 'end' event: once all data is received,
    // invoke the primary data processing pipeline.
    process.stdin.on('end', () => {
        initiateDataProcessing(receivedInputBuffer);
    });
} else {
    // This block would typically contain fallback input mechanisms for non-Node.js environments.
    // For this specific problem context, we assume a Node.js-like execution environment.
    // console.warn("Running in a non-Node.js environment or 'process.stdin' is unavailable. " +
    //              "Input data must be provided by other means.");
}

/**
 * Helper function to safely parse a string row into an array of numbers.
 * It handles potential non-numeric values and ensures proper integer conversion.
 * @param {string} rowText - The string containing space-separated numbers.
 * @returns {number[]} An array of numerical values, or an empty array if parsing fails.
 */
const parseNumericRow = (rowText) => {
    // Basic validation: ensure rowText is a non-empty string.
    if (typeof rowText !== 'string' || rowText.trim() === '') {
        return [];
    }
    // Split the string by spaces, convert each part to an integer using base 10,
    // and then filter out any results that are not valid numbers (e.g., NaN).
    return rowText.split(' ').map(str => parseInt(str.trim(), 10)).filter(num => !isNaN(num));
};

/**
 * The initial function to prepare the raw input string for core analysis.
 * It handles line splitting, removal of specific header/footer lines, and sanitization.
 * @param {string} rawInputString - The complete input received from the environment.
 */
function initiateDataProcessing(rawInputString) {
    // Guard clause: If the input string is empty or just whitespace, there's nothing to process.
    if (!rawInputString || rawInputString.trim().length === 0) {
        // displayResult("No input data provided for processing."); // Optional: inform user
        return;
    }

    // Split the input string into individual lines, handling both Unix and Windows newlines.
    let contentLines = rawInputString.split(/\r?\n/);

    // Filter out any lines that are empty or contain only whitespace after splitting.
    contentLines = contentLines.filter(line => line.trim() !== '');

    // The problem's specific input format dictates removing the very first and last lines
    // after initial splitting and cleaning. These are often structural headers/footers.
    if (contentLines.length > 0) {
        contentLines.shift(); // Discard the initial line.
    }
    if (contentLines.length > 0) {
        contentLines.pop();  // Discard the final line.
    }

    // After preprocessing, hand off the cleaned lines to the main analytical function.
    performSequenceAnalysis(contentLines);
}

// --- Core Logic Block ---

/**
 * The primary function responsible for analyzing numerical sequences from prepared input lines.
 * It converts string lines to numerical arrays, groups them into datasets,
 * calculates differences, applies filtering rules, and sums the remaining values.
 * @param {string[]} inputLineStrings - An array of cleaned string lines, ready for parsing.
 */
function performSequenceAnalysis(inputLineStrings) {
    // Guard clause: If no meaningful lines remain after initial preprocessing, exit.
    if (!inputLineStrings || inputLineStrings.length === 0) {
        // displayResult("No valid data lines remaining for sequence analysis."); // Optional: inform user
        return;
    }

    // A specific requirement of this problem format is to discard yet another first line
    // from the already processed list of input strings.
    if (inputLineStrings.length > 0) {
        inputLineStrings.shift();
    }

    // Transform each remaining string line into an array of numbers using the helper function.
    // This creates an array of arrays, where each inner array contains parsed numerical values.
    const numericDataRows = inputLineStrings.map(parseNumericRow);

    const structuredDataCollections = []; // This array will hold grouped pairs of numeric arrays.

    // Group the numeric data rows into pairs for subsequent processing.
    // Each 'dataset' for analysis consists of two consecutive rows from the input.
    // The loop continues as long as there are at least two rows available to form a pair.
    while (numericDataRows.length >= 2) {
        const currentDataPair = [];
        // Extract the first two rows from the `numericDataRows` array.
        // `splice(0, 2)` removes and returns the first two elements.
        const [firstRowCandidate, secondRowCandidate] = numericDataRows.splice(0, 2);

        // Add the extracted rows to the current pair, ensuring they are valid arrays.
        currentDataPair.push(Array.isArray(firstRowCandidate) ? firstRowCandidate : []);
        currentDataPair.push(Array.isArray(secondRowCandidate) ? secondRowCandidate : []);

        // Only add a pair to the collections if it genuinely contains two elements.
        if (currentDataPair.length === 2) {
            structuredDataCollections.push(currentDataPair);
        }
    }

    // Iterate through each structured data collection (which should be a pair of arrays)
    // to perform the main calculation logic.
    for (const currentCollection of structuredDataCollections) {
        // Robust check: Ensure the collection is indeed a pair of arrays.
        if (currentCollection.length < 2 || !Array.isArray(currentCollection[0]) || !Array.isArray(currentCollection[1])) {
            // displayResult("Skipping malformed data collection due to insufficient or invalid elements."); // Optional warning
            displayResult(0); // Output 0 for malformed data to maintain consistent output format.
            continue;
        }

        // The second element of the first array in the pair acts as a threshold value
        // that determines how many largest differences to retain later.
        const retentionThreshold = currentCollection[0][1];

        // Guard against invalid or non-positive threshold values.
        // A threshold must be a number and at least 1 for slicing logic to make sense.
        if (typeof retentionThreshold !== 'number' || isNaN(retentionThreshold) || retentionThreshold < 1) {
            displayResult(0); // If threshold is invalid, output 0.
            continue;
        }

        const calculatedDeltaValues = []; // This array will store the differences between consecutive elements.
        const numericSequenceToAnalyze = currentCollection[1]; // The actual sequence of numbers from the second array in the pair.

        // Calculate differences between adjacent elements in the `numericSequenceToAnalyze`.
        // The loop starts from the second element (index 1) to correctly compute `current - previous`.
        for (let idx = 1; idx < numericSequenceToAnalyze.length; idx++) {
            const currentElement = numericSequenceToAnalyze[idx];
            const previousElement = numericSequenceToAnalyze[idx - 1];

            // Ensure both elements are valid numbers before calculating their difference.
            if (typeof currentElement === 'number' && typeof previousElement === 'number' &&
                !isNaN(currentElement) && !isNaN(previousElement)) {
                calculatedDeltaValues.push(currentElement - previousElement);
            }
        }

        // Sort the calculated differences in descending order, so the largest differences come first.
        calculatedDeltaValues.sort((valA, valB) => valB - valA);

        // Apply the retention threshold: keep only a specific subset of the largest differences.
        // The original logic uses `ppow - 1` as the starting index for slicing.
        // This effectively removes the `retentionThreshold - 1` largest differences, keeping the rest.
        const relevantDifferences = calculatedDeltaValues.slice(retentionThreshold - 1);

        // If there are any differences remaining after filtering, sum them up.
        if (relevantDifferences.length > 0) {
            // Calculate the sum using `reduce`. An explicit initial value of 0 is provided
            // to ensure correctness even if `relevantDifferences` contained edge cases or was empty (though guarded).
            const totalSumOfDifferences = relevantDifferences.reduce((accumulator, currentVal) => accumulator + currentVal, 0);
            displayResult(totalSumOfDifferences);
        } else {
            // If no relevant differences remain (e.g., the array was empty, or all were filtered out), output 0.
            displayResult(0);
        }
    }
}