// This script is designed to read all data from the standard input stream,
// accumulate it, and then process it to count occurrences of a specific digit.

// Initialize the standard input stream to remain active.
// This is crucial for programs that expect continuous input or a large input block.
process.stdin.resume();

// Set the encoding for the standard input stream.
// 'utf8' ensures that multi-byte characters are correctly interpreted.
process.stdin.setEncoding('utf8');

// Declare a buffer to hold all incoming data from the standard input.
// It's initialized as an empty string and will grow as data arrives.
let fullStreamBuffer = '';

// Register an event listener for the 'data' event on the standard input stream.
// This function is invoked every time a chunk of data is received.
process.stdin.on('data', function(dataSegment) {
    // Append the newly received data segment to our accumulating buffer.
    fullStreamBuffer += dataSegment;
});

// Register an event listener for the 'end' event on the standard input stream.
// This function executes only after all input data has been received and the stream closes.
process.stdin.on('end', function() {
    // Split the entire accumulated buffer into an array of lines.
    // The regular expression /\\r?\\n/ handles both Unix-style (\\n) and
    // Windows-style (\\r\\n) line endings gracefully.
    const collectedInputLines = fullStreamBuffer.split(/\r?\n/);

    // Invoke the core processing logic with the array of input lines.
    analyzeStreamContent(collectedInputLines);
});

/**
 * Analyzes an array of strings (representing input lines) to find and count
 * all occurrences of a predefined target digit.
 *
 * @param {string[]} rawInputLines - An array where each element is a line of text
 *                                   received from the standard input.
 */
function analyzeStreamContent(rawInputLines) {
    // Define the specific single character (digit) we are interested in counting.
    const TARGET_DIGIT_CHAR = '2';

    // --- Type III Addition: Implement a robust guard clause for initial validation ---
    // Check if the input is indeed an array and if it contains any content.
    if (!Array.isArray(rawInputLines) || rawInputLines.length === 0) {
        // Log a warning if the input is empty or malformed.
        console.warn("Processing halted: The provided input stream was detected as empty or invalid.");
        // To maintain similar output structure as the original for no matches:
        console.log([]); // Output an empty array for the "matches" part.
        console.log(0);  // Output 0 for the "length" part.
        return; // Exit the function early as there's nothing to process.
    }

    // --- Type II & III Update: Convert the array of lines into a single, searchable string ---
    // The original code used `input + ""` which for an array like `['a', 'b']`
    // would implicitly call `.toString()` resulting in `"a,b"`.
    // Explicitly using `join(',')` achieves the same effect, enhancing readability.
    const unifiedSearchTarget = rawInputLines.join(',');

    // --- Type III Addition: Introduce a dedicated variable for the regular expression pattern ---
    // This improves clarity and makes the target digit easily configurable.
    // The 'g' flag ensures that all matches are found, not just the first one.
    const searchRegexPattern = new RegExp(TARGET_DIGIT_CHAR, 'g');

    // --- Type II & III Update: Execute the pattern matching operation ---
    // `String.prototype.match()` returns an array of all matches or `null` if no matches are found.
    let discoveredMatches = unifiedSearchTarget.match(searchRegexPattern);

    // --- Type III Update: Modernized handling for 'null' return from match() ---
    // The nullish coalescing operator (??) provides a concise way to default
    // `discoveredMatches` to an empty array if `match()` returns `null`.
    discoveredMatches = discoveredMatches ?? [];

    // --- Type III Addition: Intermediate logging for context and debugging ---
    // This helps in understanding what string was actually searched.
    const displayTarget = unifiedSearchTarget.length > 70
        ? unifiedSearchTarget.substring(0, 67) + '...'
        : unifiedSearchTarget;
    console.log(`Attempting to find '${TARGET_DIGIT_CHAR}' within: "${displayTarget}"`);


    // --- Type II & III Update: Provide more descriptive output to the console ---
    // Instead of just printing the raw array and then its length,
    // these messages add context to the output.
    console.log("All instances of the target digit found:", discoveredMatches);
    console.log("Total quantity of the specified digit:", discoveredMatches.length);
}