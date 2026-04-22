function processInputString(rawData) {
    // Declare constants for the pattern matching and replacement operations.
    // Using constants enhances readability and maintainability.
    const TARGET_SEQUENCE_PATTERN = "ABC";
    const REPLACEMENT_STRING_VALUE = "BCA";
    const PATTERN_LENGTH = TARGET_SEQUENCE_PATTERN.length; // This will be 3.

    // Robust input handling: Ensure rawData is treated as a string and trimmed.
    // Handles cases where rawData might be null, undefined, or not a string.
    let currentWorkingText = String(rawData || "").trim();

    // Cache the length of the string for performance within the loop.
    let evaluatedTextLength = currentWorkingText.length;

    // Initialize a counter to track the number of successful transformations.
    let transformationCounter = 0;

    // Early exit guard clause: If the text is shorter than the pattern, no matches are possible.
    if (evaluatedTextLength < PATTERN_LENGTH) {
        console.log(0); // Output zero as no transformations occurred.
        return; // Terminate function execution.
    }

    // Iterate through the string to find occurrences of the target pattern.
    // The loop condition ensures we always have enough characters remaining to form the pattern.
    for (let charIndex = 0; charIndex <= evaluatedTextLength - PATTERN_LENGTH; charIndex++) {
        // Extract a segment of the string at the current position for comparison.
        const segmentToCheck = currentWorkingText.substring(charIndex, charIndex + PATTERN_LENGTH);

        // Check if the extracted segment exactly matches the target pattern.
        if (segmentToCheck === TARGET_SEQUENCE_PATTERN) {
            // If a match is found, perform the string transformation.

            // 1. Isolate the portion of the string preceding the matched pattern.
            const leadingSegment = currentWorkingText.slice(0, charIndex);

            // 2. Isolate the portion of the string following the matched pattern.
            const trailingSegment = currentWorkingText.slice(charIndex + PATTERN_LENGTH);

            // 3. Concatenate the segments with the replacement string in between.
            // This forms the new state of the string after one transformation.
            currentWorkingText = leadingSegment + REPLACEMENT_STRING_VALUE + trailingSegment;

            // Increment the total count of transformations.
            transformationCounter++;

            // Crucial step for handling overlapping patterns:
            // After a replacement (e.g., "ABC" -> "BCA"), the 'B' from the new 'BCA'
            // could potentially be the start of a new "ABC" sequence.
            // By decrementing the index, we effectively re-evaluate the character
            // at the start of the *new* 'BCA' and potentially the character before it.
            // For PATTERN_LENGTH = 3, this means charIndex -= 2.
            // The loop's natural increment (charIndex++) will then move it one position forward relative to the adjusted index.
            // This ensures patterns like "AABC" correctly become "ABCA" then "BCABCA", finding both "ABC"s.
            charIndex -= (PATTERN_LENGTH - 1);

            // Note: In this specific problem, PATTERN_LENGTH and REPLACEMENT_STRING_VALUE.length are the same (3).
            // If they were different, 'evaluatedTextLength' would need to be updated here:
            // evaluatedTextLength = currentWorkingText.length;
        }
    }

    // Output the final tally of transformations.
    console.log(transformationCounter);
}

// --- Application Entry Point ---
// This block handles reading input from the standard input stream,
// which is common in competitive programming environments.
try {
    // Attempt to read the entire content from /dev/stdin synchronously.
    // '/dev/stdin' is a standard Unix path for the standard input.
    // 'utf8' specifies the character encoding for the input.
    const fileInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

    // Invoke the main processing function with the obtained input.
    processInputString(fileInputContent);
} catch (errorCondition) {
    // If any error occurs during file reading or initial processing,
    // log the error details for debugging purposes.
    console.error("An issue was encountered while processing input:", errorCondition.message);
    // As a fallback, output 0 transformations if input cannot be read or processed.
    console.log(0);
}