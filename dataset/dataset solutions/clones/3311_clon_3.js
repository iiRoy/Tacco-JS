function determineLCS(rawInputPayload) {
    // This function orchestrates the computation and presentation of the Longest Common Subsequence (LCS).
    // It takes raw string input, processes it, calculates the LCS, and prints the result.

    // --- Input Validation and Pre-processing ---
    // Ensure the input is a valid string payload.
    if (!rawInputPayload || typeof rawInputPayload !== 'string') {
        // In a production scenario, one might throw an error. For this context, an empty string is returned.
        console.error("Error: Input payload is missing or not a string.");
        return "";
    }

    // Normalize the input: remove leading/trailing whitespace and split into individual lines.
    const inputLineSegments = rawInputPayload.trim().split("\n");

    // Validate that there are at least two lines of input, representing the two sequences.
    if (inputLineSegments.length < 2) {
        console.error("Error: Insufficient input lines. Expected at least two distinct sequences.");
        return "";
    }

    // Extract the primary sequences from the input lines.
    // The original code implies that each line might contain additional data after a space,
    // but only the first part is relevant for the sequence itself.
    const primarySequenceRaw = inputLineSegments[0].split(" ")[0];
    const secondarySequenceRaw = inputLineSegments[1].split(" ")[0];

    // Convert the raw strings into character arrays for efficient indexed access.
    // These arrays are constant throughout the LCS calculation.
    const sequenceAlphaChars = Array.from(primarySequenceRaw);
    const sequenceBetaChars = Array.from(secondarySequenceRaw);

    // Store lengths for boundary checks and DP table dimensions.
    const lengthAlpha = sequenceAlphaChars.length;
    const lengthBeta = sequenceBetaChars.length;

    // --- Early Exit Condition: Empty Sequences ---
    // If either sequence is empty, their LCS length is 0, and the LCS itself is an empty string.
    // This optimization avoids unnecessary DP table creation and computation.
    if (lengthAlpha === 0 || lengthBeta === 0) {
        console.log(""); // Output an empty line as per problem specification for no LCS.
        return "";
    }

    // --- Dynamic Programming Table Initialization ---
    // Create a 2D array (matrix) to store LCS lengths.
    // `lcsLengthMatrix[r][c]` will hold the length of the LCS of `sequenceBetaChars[0...r-1]`
    // and `sequenceAlphaChars[0...c-1]`.
    // The dimensions are (lengthBeta + 1) rows by (lengthAlpha + 1) columns.
    // All cells are initialized to 0, which correctly handles the base cases (empty prefix).
    const lcsLengthMatrix = Array.from({ length: lengthBeta + 1 }, () =>
        new Array(lengthAlpha + 1).fill(0)
    );

    // --- Populate the Dynamic Programming Table ---
    // Iterate through each character of both sequences to fill the `lcsLengthMatrix`.
    // The loop indices `rowCursor` and `colCursor` correspond to the current
    // positions in the `lcsLengthMatrix`, effectively representing prefix lengths.
    for (let rowCursor = 1; rowCursor <= lengthBeta; rowCursor++) {
        for (let colCursor = 1; colCursor <= lengthAlpha; colCursor++) {
            // Check for a match between the current characters from both sequences.
            // Note: `sequenceBetaChars` and `sequenceAlphaChars` are 0-indexed,
            // so we use `rowCursor - 1` and `colCursor - 1` to access them.
            if (sequenceBetaChars[rowCursor - 1] === sequenceAlphaChars[colCursor - 1]) {
                // If characters match, the LCS length increases by 1,
                // extending the LCS found for the previous prefixes (diagonal element).
                lcsLengthMatrix[rowCursor][colCursor] = lcsLengthMatrix[rowCursor - 1][colCursor - 1] + 1;
            } else {
                // If characters do not match, the LCS length is the maximum of:
                // 1. LCS of `sequenceBeta` up to `rowCursor-1` and `sequenceAlpha` up to `colCursor`. (Moving up in matrix)
                // 2. LCS of `sequenceBeta` up to `rowCursor` and `sequenceAlpha` up to `colCursor-1`. (Moving left in matrix)
                lcsLengthMatrix[rowCursor][colCursor] = Math.max(
                    lcsLengthMatrix[rowCursor - 1][colCursor], // Exclude current char from sequenceBeta
                    lcsLengthMatrix[rowCursor][colCursor - 1]   // Exclude current char from sequenceAlpha
                );
            }
        }
    }

    // The total length of the LCS is found at the bottom-right cell of the matrix.
    const finalLCSLength = lcsLengthMatrix[lengthBeta][lengthAlpha];

    // --- Early Exit Condition: No Common Subsequence ---
    // If the computed LCS length is zero, there's no common subsequence.
    if (finalLCSLength === 0) {
        console.log(""); // Output an empty line.
        return "";
    }

    // --- Reconstruct the LCS String by Backtracking ---
    // We start from the bottom-right corner of the `lcsLengthMatrix` and move towards the top-left.
    let currentRowPointer = lengthBeta; // Current row index in DP table (corresponds to sequenceBeta)
    let currentColPointer = lengthAlpha; // Current column index in DP table (corresponds to sequenceAlpha)
    const constructedLCSCharacters = []; // Array to collect LCS characters in reverse order.

    // Continue backtracking as long as we are within the bounds of the matrix and haven't hit the start.
    while (currentRowPointer > 0 && currentColPointer > 0) {
        // Case 1: Characters match and contribute to the LCS.
        // This is indicated if the current cell's value is greater than the value directly above and left.
        // More robustly, if `sequenceBetaChars[currentRowPointer - 1]` matches `sequenceAlphaChars[currentColPointer - 1]`
        // AND the current DP value is exactly one more than the diagonal (top-left) value.
        if (sequenceBetaChars[currentRowPointer - 1] === sequenceAlphaChars[currentColPointer - 1] &&
            lcsLengthMatrix[currentRowPointer][currentColPointer] === lcsLengthMatrix[currentRowPointer - 1][currentColPointer - 1] + 1) {
            
            // Add the matching character to our collection.
            constructedLCSCharacters.push(sequenceAlphaChars[currentColPointer - 1]);
            // Move diagonally up-left, indicating both characters were used.
            currentRowPointer--;
            currentColPointer--;
        }
        // Case 2: Character from `sequenceBeta` (row) was skipped.
        // This happens if the LCS length is the same as the cell directly above.
        else if (lcsLengthMatrix[currentRowPointer][currentColPointer] === lcsLengthMatrix[currentRowPointer - 1][currentColPointer]) {
            // Move purely upwards in the matrix.
            currentRowPointer--;
        }
        // Case 3: Character from `sequenceAlpha` (column) was skipped.
        // This happens if the LCS length is the same as the cell directly to the left.
        else {
            // Move purely leftwards in the matrix.
            currentColPointer--;
        }
    }

    // The characters were collected in reverse order during backtracking.
    // Reverse the array and join them to form the final LCS string.
    const finalLCSString = constructedLCSCharacters.reverse().join("");

    // --- Output and Return Result ---
    console.log(finalLCSString);
    return finalLCSString; // Return for testability or further processing.
}

// Standard entry point for competitive programming environments.
// Reads all data from standard input and passes it to the main processing function.
determineLCS(require("fs").readFileSync("/dev/stdin", "utf8"));