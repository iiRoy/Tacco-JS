const TARGET_PATTERN = "ABC";
const REPLACEMENT_PATTERN = "BCA";
const PATTERN_LENGTH = TARGET_PATTERN.length; // This is 3
const REWIND_OFFSET = PATTERN_LENGTH - 1; // This is 2, for re-checking overlapping patterns

function processInputString(rawData) {
    let currentString = rawData.trim();
    let stringLength = currentString.length;
    let replacementCount = 0;

    // Early exit if the string is too short to contain the pattern
    if (stringLength < PATTERN_LENGTH) {
        console.log(replacementCount);
        return;
    }

    // Iterate through the string, checking for the pattern
    // The loop condition ensures we don't go out of bounds when slicing
    for (let currentIndex = 0; currentIndex <= stringLength - PATTERN_LENGTH; currentIndex++) {
        // Extract a segment of the string to compare with the target pattern
        const segmentToCheck = currentString.slice(currentIndex, currentIndex + PATTERN_LENGTH);

        if (segmentToCheck === TARGET_PATTERN) {
            // If the pattern is found, perform the replacement
            const prefixSegment = currentString.slice(0, currentIndex);
            const suffixSegment = currentString.slice(currentIndex + PATTERN_LENGTH);
            currentString = prefixSegment + REPLACEMENT_PATTERN + suffixSegment;

            replacementCount++;

            // Adjust the index to re-evaluate the modified part of the string.
            // This is crucial for handling overlapping patterns (e.g., "ABABC" -> "ABCA" -> "BCAA").
            // The original code uses i -= 2, which corresponds to PATTERN_LENGTH - 1.
            currentIndex -= REWIND_OFFSET;
            // Note: stringLength does not need to be updated here because TARGET_PATTERN and REPLACEMENT_PATTERN
            // have the same length (3). If lengths differed, stringLength = currentString.length; would be necessary.
        }
    }

    console.log(replacementCount);
}

// Standard input reading for competitive programming environments
processInputString(require("fs").readFileSync("/dev/stdin", "utf8"));
