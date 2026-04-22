function processInputData(rawDataString) {
    // Extract individual lines from the raw input string.
    // .trim() ensures no empty lines if the input has leading/trailing newlines.
    const inputLines = rawDataString.trim().split('\n');

    // Basic validation: ensure we have at least two lines for our sequences.
    if (inputLines.length < 2) {
        // In a real application, more robust error handling would be present.
        // For this context, we'll simply log a message and exit.
        console.error("Input error: Expected at least two lines of text.");
        return;
    }

    // Convert the first line into an array of characters, representing the primary sequence.
    // Using Array.from() is a clean way to get a character array from a string.
    const primarySequenceCharacters = Array.from(inputLines[0]);

    // Convert the second line into an array of characters, representing the pattern to compare against.
    const comparisonPatternCharacters = Array.from(inputLines[1]);

    // Store lengths for clarity and to avoid repeated calculations in loops.
    const primarySeqLen = primarySequenceCharacters.length;
    const patternLen = comparisonPatternCharacters.length;

    // Handle edge cases: if the pattern is empty, or longer than the primary sequence.
    // The original code's loops would naturally handle this by not running or yielding 0.
    if (patternLen === 0 || primarySeqLen < patternLen) {
        console.log(0); // No mismatches or no comparison possible
        return;
    }

    // This variable will hold the mismatch count.
    // Crucially, as per the original code's logic, it will only store the count
    // from the *last* window comparison performed.
    let finalCalculatedMismatch = 0;

    // Iterate through the primary sequence to define all possible starting points
    // for a window that matches the length of the comparison pattern.
    // 'windowStartOffset' represents the starting index of the current window in 'primarySequenceCharacters'.
    for (let windowStartOffset = 0; windowStartOffset <= (primarySeqLen - patternLen); ++windowStartOffset) {
        let currentWindowMismatchCount = 0; // Reset mismatch count for each new window.

        // Compare characters within the current window against the comparison pattern.
        // 'charIndexInPattern' is the offset within the pattern and the current window.
        for (let charIndexInPattern = 0; charIndexInPattern < patternLen; ++charIndexInPattern) {
            // If characters at corresponding positions do not match, increment the mismatch counter.
            if (comparisonPatternCharacters[charIndexInPattern] !== primarySequenceCharacters[windowStartOffset + charIndexInPattern]) {
                currentWindowMismatchCount++;
            }
        }

        // According to the original algorithm's behavior, only the mismatch count
        // from the *very last* iteration of the outer loop is relevant for the final output.
        // Therefore, we continuously update 'finalCalculatedMismatch' with the count
        // from the current window, effectively discarding previous counts.
        finalCalculatedMismatch = currentWindowMismatchCount;
    }

    // The original code included a conditional check `if (num > t.length)`.
    // This condition is logically impossible to be true, as the mismatch count
    // (num) can never exceed the length of the pattern (t.length) it's comparing against.
    // As a Type III modification, this redundant and always-false check has been removed.
    // The result is simply the final mismatch count obtained from the last window.
    console.log(finalCalculatedMismatch);
}

// Invoke the sequence processing function, reading input from standard input.
// This setup is typical for competitive programming environments in Node.js.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));