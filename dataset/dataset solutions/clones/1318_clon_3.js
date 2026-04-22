// This file orchestrates the reading of standard input and performs a specific string analysis.
// It determines if a second input line (pattern) is a subsequence of the first input line
// concatenated with itself (effectively checking for string rotation, though not strictly).

// A dynamically growing buffer to accumulate all incoming textual data from the standard input stream.
let accumulatedInputBuffer = '';

// Acquire a specific handle to the standard input stream provided by the Node.js runtime environment.
const stdinAccessHandle = process.stdin;

// Configure the input stream to correctly decode incoming byte sequences into UTF-8 characters.
stdinAccessHandle.setEncoding('utf-8');

// Explicitly ensure the input stream is operating in a flowing mode.
// While often implicitly handled by attaching 'data' listeners, this makes the intent clear.
stdinAccessHandle.resume();

/**
 * Event listener for incrementally received chunks of data arriving on the standard input.
 * Each received data segment is appended to our accumulating buffer for later complete processing.
 * @param {string} incomingDataFragment - A portion (chunk) of the textual input data.
 */
stdinAccessHandle.on('data', (incomingDataFragment) => {
    // Utilize a template literal for string concatenation, offering a slightly different syntactic style.
    accumulatedInputBuffer = `${accumulatedInputBuffer}${incomingDataFragment}`;
});

/**
 * Executes the core string analysis logic to determine if a pattern exists within a doubled string.
 * This function encapsulates the primary business rule of the application.
 * @param {string} baseCandidateString - The foundational string (typically the first line of input).
 * @param {string} lookupPattern - The string sequence to search for (typically the second line of input).
 * @returns {boolean} True if the 'lookupPattern' is found as a substring within 'baseCandidateString' concatenated with itself, false otherwise.
 */
const performRotationalSubstringCheck = (baseCandidateString, lookupPattern) => {
    // Implement robust pre-validation to prevent runtime errors from invalid input types.
    if (typeof baseCandidateString !== 'string' || typeof lookupPattern !== 'string') {
        // Log an error to standard error stream, indicating a problem with function arguments.
        console.error("Argument type mismatch: Both base string and pattern must be valid strings.");
        return false; // Indicate a failed check due to invalid input.
    }

    // Construct the extended search space by concatenating the base string with itself.
    // Using the String.prototype.concat method for a different approach than '+' operator.
    const expandedSearchSpace = baseCandidateString.concat(baseCandidateString);

    // Leverage the modern JavaScript String.prototype.includes() method for efficient substring checking.
    // This is a cleaner and more readable alternative to checking `indexOf() !== -1`.
    return expandedSearchSpace.includes(lookupPattern);
};

/**
 * Event listener specifically for the 'end' event of the standard input stream.
 * This signifies that all input has been received. At this point, the accumulated data
 * is processed, and the final result of the string analysis is output.
 */
stdinAccessHandle.on('end', () => {
    // Enclose the entire processing logic within a try-catch block to gracefully handle unexpected errors.
    try {
        // Process the collected input buffer:
        // 1. Split the buffer into individual lines using the newline character as a delimiter.
        // 2. Map over each line to trim any leading or trailing whitespace characters.
        // 3. Filter out any lines that become empty after trimming, ensuring only meaningful lines are considered.
        const processedInputLines = accumulatedInputBuffer
            .split('\n')
            .map(lineContent => lineContent.trim())
            .filter(Boolean); // `Boolean` as a filter callback removes falsy values (e.g., empty strings).

        // Implement a critical guard clause: Verify that the input provided contains at least two distinct lines.
        // The problem requires a first line and a second line.
        if (processedInputLines.length < 2) {
            console.error("Input validation failure: Insufficient lines detected. Expected a minimum of two non-empty input lines.");
            // Output "No" as the default failure indicator when input is malformed or incomplete.
            console.log("No");
            return; // Immediately exit the event handler as processing cannot proceed meaningfully.
        }

        // Extract the primary subject string and the query subsequence from the parsed input lines.
        // These correspond to `data[0]` and `data[1]` in the original code.
        const primarySubjectString = processedInputLines[0];
        const querySubsequence = processedInputLines[1];

        // Execute the core string analysis logic by invoking the dedicated helper function.
        // Store the boolean result in an explicit variable for clarity.
        const resultIndicator = performRotationalSubstringCheck(primarySubjectString, querySubsequence);

        // Based on the boolean result, construct and output the final message to standard output.
        const finalOutputMessage = resultIndicator ? "Yes" : "No";
        console.log(finalOutputMessage);

    } catch (processingException) {
        // Catch any unforeseen exceptions that might occur during the input processing phase.
        console.error(`An unrecoverable error occurred during input stream processing: ${processingException.message}`);
        // In case of any unhandled exception, default to outputting "No" to signal failure.
        console.log("No");
    }
});