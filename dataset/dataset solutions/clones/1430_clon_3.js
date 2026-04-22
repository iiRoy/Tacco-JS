/**
 * Processes a stream of textual input to determine the total occurrences
 * of a predefined search pattern across multiple lines.
 * This function is designed to read input sequentially until a specific
 * end-of-text marker is encountered.
 *
 * @param {string} rawInput The complete input text, expected to be
 *                          a multi-line string where the first line
 *                          is the search pattern and subsequent lines
 *                          are text segments, ending with a sentinel.
 */
function analyzeInputSegments(rawInput) {
    // Define a constant for the termination signal, enhancing clarity and maintainability.
    const TEXT_STREAM_TERMINATOR = "END_OF_TEXT";

    // Implement a preliminary guard clause: check for null, undefined, or empty input.
    if (rawInput === null || rawInput === undefined || rawInput.trim().length === 0) {
        console.error("Error: The provided input data is entirely empty or invalid.");
        return; // Exit early if input is not viable.
    }

    // Split the raw input string into an array of individual lines.
    // Using `let` as the array will be modified by `shift()`.
    let inputLinesQueue = rawInput.split("\n");

    // Extract the primary search pattern from the very first line of the input.
    // `shift()` removes the first element and returns it, modifying `inputLinesQueue`.
    const searchPattern = inputLinesQueue.shift();

    // Another critical validation: ensure the search pattern itself is not empty or missing.
    if (searchPattern === null || searchPattern === undefined || searchPattern.length === 0) {
        console.error("Error: The search pattern is missing or an empty string. Cannot perform analysis.");
        return; // Exit early if the pattern is invalid.
    }

    // Pre-calculate the length of the search pattern. This avoids repeated calculations
    // within the inner loop and improves performance.
    const patternCharacterCount = searchPattern.length;

    // Initialize a counter to accumulate the total number of matches found globally.
    let globalMatchTally = 0;

    // Fetch the first actual text segment to begin processing.
    let currentTextSegment = inputLinesQueue.shift();

    // Main loop: Continue processing text segments until the designated terminator is found.
    // This structure mirrors the original `while(str != "END_OF_TEXT")`.
    while (currentTextSegment !== TEXT_STREAM_TERMINATOR) {
        // Add a robustness check: if a line is unexpectedly missing before the terminator.
        if (currentTextSegment === undefined || currentTextSegment === null) {
            console.warn("Warning: Input stream ended prematurely or contained undefined lines before the terminator.");
            break; // Break gracefully if the stream is malformed.
        }

        // Initialize the starting index for searching within the current segment.
        // This pointer moves forward as matches are found.
        let scanBeginIndex = 0;
        // Cache the length of the current text segment for efficient boundary checks.
        const segmentTotalLength = currentTextSegment.length;

        // Inner loop: Iteratively find all occurrences of the pattern within `currentTextSegment`.
        // Using `while(true)` with explicit `break` for flexibility in termination conditions.
        while (true) {
            // Locate the next occurrence of the `searchPattern` starting from `scanBeginIndex`.
            // `indexOf(substring, fromIndex)` is generally more efficient than `substr().indexOf()`.
            let matchFoundAtIndex = currentTextSegment.indexOf(searchPattern, scanBeginIndex);

            // Check if no further occurrences were found in this segment.
            // If `matchFoundAtIndex` is -1, it means the pattern was not found.
            if (matchFoundAtIndex === -1) {
                break; // Exit the inner loop; no more matches in this segment.
            }

            // Increment the global counter for each successful match.
            globalMatchTally++;

            // Advance the starting point for the next search.
            // This ensures we look for matches *after* the current one, preventing re-counting
            // the same match and correctly handling consecutive matches.
            scanBeginIndex = matchFoundAtIndex + patternCharacterCount;

            // Optional: Add an explicit check if the scan index has moved past the end of the segment.
            // While `indexOf` would eventually return -1, this can be a clearer termination path.
            if (scanBeginIndex >= segmentTotalLength) {
                break; // No more room for patterns in this segment.
            }
        }

        // Prepare for the next iteration: retrieve the subsequent line from the input queue.
        currentTextSegment = inputLinesQueue.shift();
    }

    // After processing all segments, output the final accumulated count.
    console.log(globalMatchTally);
}

// --- Execution Entry Point ---
// This block handles reading input from standard input and invoking the main analysis function.
try {
    // Define the standard input file path as a constant.
    const STANDARD_INPUT_SOURCE = "/dev/stdin";

    // Utilize Node.js's 'fs' module to synchronously read the entire content
    // of the standard input file, ensuring UTF-8 encoding for text.
    const fileContentsBuffer = require("fs").readFileSync(STANDARD_INPUT_SOURCE, "utf8");

    // Invoke the main processing function with the read file content.
    analyzeInputSegments(fileContentsBuffer);

} catch (ioError) {
    // Implement robust error handling for file system operations.
    // This is a Type III addition for increased resilience.
    console.error(`An I/O error occurred while attempting to read from stdin: ${ioError.message}`);
    // Optionally, terminate the process with an error code.
    process.exit(1);
}