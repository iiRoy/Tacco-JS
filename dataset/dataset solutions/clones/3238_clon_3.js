// This script processes a multi-line string input to compute a specific similarity metric.
// The input format expects:
// 1. An integer representing the length of character sequences to compare.
// 2. Three subsequent lines, each containing a character sequence.

/**
 * Computes a character difference score from the provided raw input string.
 * The score increments based on the uniqueness of characters at each corresponding position
 * across three designated lines of text.
 *
 * @param {string} rawInputString - The complete multi-line input data.
 */
function processTextComparison(rawInputString) {
    // Divide the input into an array of strings, one for each line.
    const allInputLines = rawInputString.split("\n");

    // Extract the number of elements to process from the first line.
    // Using Number() for type conversion, which handles parsing similar to parseInt.
    const comparisonLength = Number(allInputLines[0]);

    // --- Type III: Add validation and guard clauses ---
    // Validate the parsed length. If it's not a number or is negative,
    // we cannot proceed meaningfully.
    if (isNaN(comparisonLength) || comparisonLength < 0) {
        // In a real application, this might throw an error or log to stderr.
        // For this clone, we'll log an error and return, mimicking an early termination.
        console.error("Error: Invalid comparison length provided. Must be a non-negative integer.");
        return;
    }

    // Ensure there are enough lines in the input for the comparison.
    // We need at least 4 lines: 1 for length, 3 for character sequences.
    if (allInputLines.length < 4) {
        console.error("Error: Insufficient input lines. Expected at least 4 lines (length + 3 data lines).");
        return;
    }

    // Convert the relevant input lines into arrays of their individual characters.
    // These will be used for character-by-character comparison.
    const primarySeqChars = allInputLines[1].split('');
    const secondarySeqChars = allInputLines[2].split('');
    const tertiarySeqChars = allInputLines[3].split('');

    // Initialize the accumulator for the difference score.
    let accumulatedScore = 0; // Renamed 'count' to 'accumulatedScore'

    // Iterate through the character sequences up to the specified comparison length.
    for (let charPosition = 0; charPosition < comparisonLength; charPosition++) {
        // --- Type III: Introduce intermediate variables for clarity ---
        const charAtPrimary = primarySeqChars[charPosition];
        const charAtSecondary = secondarySeqChars[charPosition];
        const charAtTertiary = tertiarySeqChars[charPosition];

        // --- Type III: Rewrite core logic using a Set for unique character count ---
        // This replaces the nested if-else structure with a more declarative approach.
        // The comparison `==` in JS handles `undefined` values, and `Set` will treat
        // `undefined` as a distinct value. This behavior aligns with the original code.
        const currentChars = [charAtPrimary, charAtSecondary, charAtTertiary];
        const distinctCharSet = new Set(currentChars);
        const numberOfUnique = distinctCharSet.size;

        // The scoring logic derived from the original conditions:
        // - If 1 unique char (all three characters are identical): score increments by 0.
        // - If 2 unique chars (two characters are identical, one is different): score increments by 1.
        // - If 3 unique chars (all three characters are distinct): score increments by 2.
        // This is mathematically equivalent to `numberOfUnique - 1`.
        accumulatedScore += (numberOfUnique - 1);
    }

    // Output the final calculated score.
    // The output format is kept identical to the original implementation.
    console.log(accumulatedScore);
}

// --- DO NOT EDIT BELOW THIS LINE ---
// This section handles reading input from standard in and invoking the main processing function.
// It ensures compatibility with typical competitive programming environments.
processTextComparison(require("fs").readFileSync("/dev/stdin", "utf8"));