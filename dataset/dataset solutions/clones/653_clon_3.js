// --- Core System Input Configuration ---
// Activates the standard input stream, ensuring it doesn't close prematurely.
process.stdin.resume();

// Specifies the character encoding for data received via standard input.
process.stdin.setEncoding("utf8");

// --- Application Constants & Utilities ---

// Regular expression pattern to identify and capture two integer values
// separated by one or more whitespace characters within a line.
const NUMERIC_PAIR_MATCHER_PATTERN = /^(\d+)\s+(\d+)$/;

// Establishes a strict limit on the number of input lines permitted per data segment.
// Exceeding this limit will result in program termination.
const MAXIMUM_SIMULTANEOUS_LINES = 2;

/**
 * Processes a single input string, attempting to extract two numeric operands,
 * calculate their sum, and return the result.
 *
 * @param {string} inputStringContent - The textual content of a single line to be parsed.
 * @returns {number | null} The computed sum of the two numbers, or `null` if parsing fails.
 */
function deriveSumFromLine(inputStringContent) {
    // Execute the regular expression against the input string to find numeric pairs.
    const matchComponents = NUMERIC_PAIR_MATCHER_PATTERN.exec(inputStringContent);

    // Validate the outcome of the regex match. A successful match should yield
    // an array with the full match and two capturing groups (for the two numbers).
    if (!matchComponents || matchComponents.length !== 3) {
        // If the pattern doesn't align, or not precisely two numbers are found,
        // it indicates an invalid input format for this line.
        return null;
    }

    // Convert the captured string representations of numbers into base-10 integers.
    const operandOne = parseInt(matchComponents[1], 10);
    const operandTwo = parseInt(matchComponents[2], 10);

    // Perform a sanity check to ensure both parsed values are indeed valid numbers.
    if (isNaN(operandOne) || isNaN(operandTwo)) {
        // If conversion results in NaN, log an internal error and consider the line unprocessable.
        console.error(`Internal Parsing Error: Failed to convert captured strings to numbers for line "${inputStringContent}".`);
        return null;
    }

    // Return the cumulative sum of the two successfully parsed operands.
    return operandOne + operandTwo;
}

/**
 * Dispatches a given value to the standard output stream, appending a newline character.
 *
 * @param {any} valueToEmit - The data to be written to standard output.
 */
function sendResultToOutput(valueToEmit) {
    process.stdout.write(String(valueToEmit) + '\n');
}

// --- Main Input Event Handler ---

// Attaches an event listener to the standard input stream for 'data' events.
// This function will be invoked whenever a new chunk of data is received.
process.stdin.on("data", (incomingPayload) => {
    // Process the incoming data payload by splitting it into individual lines.
    // The `.filter(Boolean)` step ensures that any empty lines (e.g., from
    // trailing newlines or multiple consecutive newlines) are discarded.
    const delineatedInputSegments = incomingPayload.split('\n').filter(Boolean);

    // Implement a critical check to enforce the maximum line limit.
    // This directly mirrors the original code's aggressive termination behavior
    // when faced with an excessive number of lines in a single input chunk.
    if (delineatedInputSegments.length > MAXIMUM_SIMULTANEOUS_LINES) {
        console.error(`FATAL ERROR: Input segment contains ${delineatedInputSegments.length} lines, ` +
                      `exceeding the allowed maximum of ${MAXIMUM_SIMULTANEOUS_LINES}. Program will terminate.`);
        // Exit the process with a non-zero status code to indicate an error.
        process.exit(1);
    }

    // Iterate through each valid line segment that was successfully extracted.
    for (const currentSegment of delineatedInputSegments) {
        // Attempt to calculate the sum of numbers found within the current line.
        const calculatedTotal = deriveSumFromLine(currentSegment);

        // Check if the sum calculation was successful (i.e., not `null`).
        if (typeof calculatedTotal === 'number') {
            // If a valid sum was obtained, output it to standard output.
            sendResultToOutput(calculatedTotal);
        } else {
            // If the line could not be processed into a sum, log a warning.
            // This behavior is an enhancement for clarity compared to the original,
            // which would silently skip such malformed lines.
            console.warn(`Skipping malformed input entry: "${currentSegment}". Expected two numbers.`);
        }
    }
});

// --- Stream Termination Handling (Removed) ---
// The original code included an empty handler for 'end' events on process.stdout.
// This handler served no functional purpose and has been explicitly removed
// to streamline the code as per Type III cloning requirements (deletion of non-essential parts).
// process.stdout.on("end", function() { /* No operation defined */ });