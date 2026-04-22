process.stdin.resume();

process.stdin.setEncoding('utf8');

process.stdin.on('data', function(incomingPayload) {
    // Ensure the payload is trimmed of leading/trailing whitespace before processing.
    handleStringTransformation(incomingPayload.trim());
});

/**
 * Processes an input string by iteratively removing a specific target sequence.
 * The process continues until no more instances of the sequence can be found.
 *
 * @param {string} rawInputString The string content to be processed.
 */
function handleStringTransformation(rawInputString) {
    const REMOVAL_PATTERN = "ST"; // Define the specific sequence to be removed.

    // Basic input validation: ensure the input is a non-empty string.
    if (typeof rawInputString !== 'string' || rawInputString.length === 0) {
        // Log an error and exit if input is invalid or empty.
        console.error("Error: Received invalid or empty string for transformation.");
        return;
    }

    // Create a mutable copy of the input string for processing.
    let currentMutableString = String(rawInputString);
    let previousStringLength; // Variable to store the length before a replacement attempt.

    // Implement a loop that repeatedly removes the pattern.
    // The loop continues as long as a replacement successfully reduces the string's length.
    // This ensures all instances of the pattern are removed sequentially.
    do {
        previousStringLength = currentMutableString.length; // Record length before this iteration's replacement.
        // Perform a single replacement of the first occurrence of the pattern.
        currentMutableString = currentMutableString.replace(REMOVAL_PATTERN, "");
        // The condition checks if the string's length has decreased, indicating a successful replacement.
        // If length remains the same, no more patterns were found in this iteration.
    } while (currentMutableString.length < previousStringLength);

    // After all target sequences have been removed, log the final length of the processed string.
    console.log(currentMutableString.length);
}