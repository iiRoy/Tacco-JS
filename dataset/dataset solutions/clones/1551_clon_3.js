// This module defines a function to analyze textual data for pattern matching.
// It aims to find the minimum character differences between a target pattern
// and any substring of a larger primary string.

/**
 * Processes the raw input data to determine the minimum Hamming distance
 * between a pattern and various substrings of a source string.
 *
 * @param {string} rawInputData - The complete input string, typically from standard input.
 *                                It is expected to contain two lines:
 *                                1. The primary string (haystack).
 *                                2. The target pattern (needle).
 */
function processInputData(rawInputData) {
    // Divide the incoming data into distinct lines based on newline characters.
    const lineSegments = rawInputData.split("\n");

    // Assign the first line as the primary string to be searched.
    const primaryString = lineSegments[0];
    // Assign the second line as the target pattern to find within the primary string.
    const targetPattern = lineSegments[1];

    // Pre-calculate lengths for efficiency and readability throughout the logic.
    const primaryStringLength = primaryString.length;
    const targetPatternLength = targetPattern.length;

    // Initialize the variable to store the lowest number of mismatches found.
    // By default, assume the worst case: every character in the pattern mismatches.
    // This value also correctly handles the case where the pattern is empty (0 mismatches).
    let minMismatchCount = targetPatternLength;

    // Guard clause: If the target pattern is empty, there are no characters to compare,
    // hence the minimum mismatches are zero. Output this and exit early.
    if (targetPatternLength === 0) {
        return console.log(0);
    }

    // Guard clause: If the primary string is shorter than the target pattern,
    // it's impossible to find a substring of the same length as the pattern.
    // In this scenario, the "minimum mismatches" effectively equals the pattern's length,
    // as no valid comparison window exists. Output this and exit.
    if (primaryStringLength < targetPatternLength) {
        return console.log(minMismatchCount);
    }

    // Determine the furthest possible starting index for a substring within the primary string
    // that can still accommodate the full target pattern.
    // The loop should iterate up to and including this calculated index.
    const maxPermittedStartIndex = primaryStringLength - targetPatternLength;

    // Outer loop: Iterates through all potential starting positions
    // for aligning the target pattern within the primary string.
    for (let currentWindowStart = 0; currentWindowStart <= maxPermittedStartIndex; ++currentWindowStart) {
        // Reset the mismatch counter for the current comparison window.
        let currentWindowMismatchCount = 0;

        // Inner loop: Compares character by character within the current window.
        for (let patternCharIndex = 0; patternCharIndex < targetPatternLength; ++patternCharIndex) {
            // Retrieve the character from the primary string at the current window position.
            const charFromPrimary = primaryString.charAt(currentWindowStart + patternCharIndex);
            // Retrieve the corresponding character from the target pattern.
            const charFromPattern = targetPattern.charAt(patternCharIndex);

            // Increment the mismatch count if the characters do not match.
            if (charFromPrimary !== charFromPattern) {
                currentWindowMismatchCount++;
            }

            // Optimization: If the current window's mismatch count already equals or exceeds
            // the best mismatch count found so far, there's no need to continue checking
            // the rest of this window. It cannot yield a better result.
            if (currentWindowMismatchCount >= minMismatchCount) {
                break; // Exit the inner loop early.
            }
        }

        // After comparing all characters (or breaking early) in the current window,
        // update the overall minimum mismatch count if this window performed better.
        if (currentWindowMismatchCount < minMismatchCount) {
            minMismatchCount = currentWindowMismatchCount;
        }

        // Further Optimization: If a perfect match (zero mismatches) has been found,
        // it's impossible to achieve a better result. We can stop searching entirely.
        if (minMismatchCount === 0) {
            break; // Exit the outer loop early.
        }
    }

    // Output the final minimum mismatch count to the console.
    console.log(minMismatchCount);
}

// This section handles reading input from standard input and invoking the main processing function.
// It should not be modified to ensure compatibility with standard execution environments.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));