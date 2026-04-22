function ProcessInputData(rawSourceContent) {
    // Parse the raw input string into an array of individual lines.
    // This assumes lines are separated by newline characters.
    const contentSegments = rawSourceContent.split("\n");

    // Validate the basic input structure:
    // We expect at least two lines for the primary sequence and the pattern.
    if (contentSegments.length < 2) {
        console.error("Error: Insufficient input lines. At least two lines are required for comparison.");
        // Return a distinct error code or throw an exception for invalid input.
        return -1;
    }

    // Convert the first line into a character array for the main sequence.
    const mainSequenceChars = contentSegments[0].split('');
    // Convert the second line into a character array for the comparison pattern.
    const comparisonPatternChars = contentSegments[1].split('');

    // Store lengths of sequences for optimized loop conditions and clarity.
    const mainLength = mainSequenceChars.length;
    const patternLength = comparisonPatternChars.length;

    // Edge case handling: If the pattern is longer than the main sequence,
    // no valid comparison can be made. The minimum mismatches would effectively
    // be all characters of the pattern if it were hypothetically compared.
    if (patternLength > mainLength) {
        // Return patternLength as a logical "maximum mismatch" if no actual comparison is possible.
        // This implicitly means the pattern cannot fit within the main sequence.
        return patternLength;
    }

    // Initialize a variable to track the globally minimum number of discrepancies found.
    // We use Number.MAX_SAFE_INTEGER to ensure any valid mismatch count will be smaller.
    let globalMinimumDiscrepancies = Number.MAX_SAFE_INTEGER;

    // Outer loop: Iterate through all possible starting positions within the main sequence.
    // The loop continues as long as there is enough space in the main sequence
    // to accommodate the entire comparison pattern.
    for (let offsetInMain = 0; offsetInMain <= mainLength - patternLength; ++offsetInMain) {
        // Initialize a counter for discrepancies within the current window (substring).
        let currentWindowDiscrepancyCount = 0;

        // Inner loop: Compare characters of the pattern with the corresponding
        // characters in the current window of the main sequence.
        for (let charPositionInPattern = 0; charPositionInPattern < patternLength; ++charPositionInPattern) {
            // Check if the character at the current position in the main sequence's window
            // is different from the character at the same position in the pattern.
            if (mainSequenceChars[offsetInMain + charPositionInPattern] !== comparisonPatternChars[charPositionInPattern]) {
                currentWindowDiscrepancyCount += 1; // Increment the mismatch counter.
            }
        }

        // After comparing the current window, update the global minimum if
        // the current window has fewer discrepancies.
        if (currentWindowDiscrepancyCount < globalMinimumDiscrepancies) {
            globalMinimumDiscrepancies = currentWindowDiscrepancyCount;
        }

        // Optimization: If a perfect match (0 discrepancies) is found,
        // we can stop early as no better result is possible.
        if (globalMinimumDiscrepancies === 0) {
            break;
        }
    }

    // Return the overall minimum number of character mismatches found.
    return globalMinimumDiscrepancies;
}

// --- Application Entry Point ---
// Read the entire content of the standard input file as a UTF-8 string.
const sourceFileContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Call the main processing function with the read content.
const finalComparisonResult = ProcessInputData(sourceFileContent);

// Output the computed result to the console,
// but only if the input was valid and processing occurred without errors.
if (finalComparisonResult !== -1) {
    console.log(finalComparisonResult);
}