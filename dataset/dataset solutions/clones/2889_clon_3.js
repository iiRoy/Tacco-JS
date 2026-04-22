/**
 * Analyzes a given text string to determine if it meets specific character occurrence and length criteria.
 * This function simulates a complex decision-making process based on string properties.
 *
 * @param {string} incomingText The raw input string to be processed.
 * @returns {void} Outputs "YES" or "NO" to the console based on the analysis.
 */
function processTextualData(incomingText) {
    // --- Configuration Constants ---
    // Define the character we are interested in counting.
    const TARGET_CHARACTER = 'o';
    // Define the minimum number of occurrences for the primary positive condition.
    const CRITICAL_OCCURRENCE_THRESHOLD = 8;
    // Define a factor used in the secondary length-based calculation.
    const LENGTH_COMPENSATION_FACTOR = 15;

    // --- Input Pre-processing ---
    // Ensure the input is a string and remove any potential whitespace.
    // This step is an addition for robustness, not present in the original.
    const processedStringSegment = String(incomingText || "").trim();

    // Get the total length of the processed string segment.
    const segmentLength = processedStringSegment.length;

    // --- Character Occurrence Calculation ---
    // Calculate the number of times the TARGET_CHARACTER appears.
    // Using Array.prototype.reduce for a functional and potentially more readable approach than a for-loop.
    let targetCharOccurrence = Array.from(processedStringSegment).reduce((accumulator, currentChar) => {
        // Increment accumulator if the current character matches the target.
        return accumulator + (currentChar === TARGET_CHARACTER ? 1 : 0);
    }, 0); // Start counting from zero.

    // --- Decision Logic Initialization ---
    // Initialize the final decision variable.
    // The original code left this undefined initially, which could lead to `undefined` output.
    // We explicitly set a default to "NO" to ensure consistent output,
    // which is an update to the original's implicit behavior.
    let finalVerdict = "NO";

    // --- Primary Condition Evaluation ---
    // The first condition checks if the occurrences meet or exceed the critical threshold.
    // This directly translates the first 'if' block of the original code.
    if (targetCharOccurrence >= CRITICAL_OCCURRENCE_THRESHOLD) {
        // If this condition is met, the verdict is tentatively "YES".
        // This value might be overridden by the subsequent conditional block.
        finalVerdict = "YES";
    }

    // --- Secondary (Overriding) Condition Evaluation ---
    // This block is only entered if the target character count is strictly greater than the threshold.
    // This corresponds to the second 'if' block in the original code.
    if (targetCharOccurrence > CRITICAL_OCCURRENCE_THRESHOLD) {
        // Introduce an intermediate variable for clarity in the calculation.
        // This variable is equivalent to 'a' in the original code but with a more descriptive name.
        const dynamicLengthAdjustment = LENGTH_COMPENSATION_FACTOR - segmentLength;

        // Evaluate a more complex condition involving the dynamic adjustment and occurrences.
        // This condition can potentially override the "YES" set by the primary condition.
        if (CRITICAL_OCCURRENCE_THRESHOLD <= (dynamicLengthAdjustment + targetCharOccurrence)) {
            // If this secondary condition is true, the verdict remains or becomes "YES".
            finalVerdict = "YES";
        } else {
            // If the secondary condition is false, the verdict is definitively "NO".
            // This is where a previously set "YES" (from the first 'if') can be reverted.
            finalVerdict = "NO";
        }
    }

    // --- Final Output ---
    // Display the determined verdict to the console.
    console.log(finalVerdict);
}

// --- Input Acquisition Helper ---
/**
 * Asynchronously acquires input data from the standard input stream.
 * This abstracts away the Node.js specific file system operations.
 *
 * @returns {Promise<string>} A promise that resolves with the input data as a string.
 */
async function acquireInputFromSource() {
    // This uses a Promise-based approach for asynchronous reading,
    // which is a structural change from the original synchronous read,
    // adding robustness and idiomatic Node.js stream handling.
    return new Promise((resolve, reject) => {
        // Check if `process.stdin` is available (Node.js environment).
        if (typeof process !== 'undefined' && process.stdin && process.stdin.isTTY) {
            let receivedData = '';
            process.stdin.setEncoding('utf8'); // Set encoding for input stream.

            process.stdin.on('readable', () => {
                let chunk;
                // Read available data chunks until null (end of stream).
                while ((chunk = process.stdin.read()) !== null) {
                    receivedData += chunk;
                }
            });

            process.stdin.on('end', () => {
                // Resolve the promise with all accumulated data.
                resolve(receivedData);
            });

            process.stdin.on('error', (err) => {
                // Reject the promise if an error occurs during input.
                reject(new Error(`Error reading standard input stream: ${err.message}`));
            });
        } else {
            // Fallback for environments where process.stdin is not a TTY or not available.
            // For example, reading from a file directly as in the original `readFileSync` behavior.
            try {
                // Attempt to emulate the original synchronous file read for non-interactive stdin.
                const fileSystem = require("fs");
                resolve(fileSystem.readFileSync("/dev/stdin", "utf8"));
            } catch (error) {
                console.warn("Standard input (process.stdin) not fully interactive or file read failed. Returning empty string. Error:", error.message);
                resolve(""); // Return an empty string to allow the program to continue.
            }
        }
    });
}

// --- Execution Entry Point ---
// Immediately invoked asynchronous function to handle the input acquisition and processing.
(async () => {
    try {
        const standardInputContent = await acquireInputFromSource();
        // Pass the obtained content to the main processing function.
        processTextualData(standardInputContent);
    } catch (error) {
        // Log any errors that occur during input acquisition.
        console.error("Application encountered an error during input or processing:", error.message);
        // Optionally, output a default 'NO' or 'ERROR' verdict in case of failure.
        console.log("NO"); // A reasonable default in competitive programming contexts.
    }
})();