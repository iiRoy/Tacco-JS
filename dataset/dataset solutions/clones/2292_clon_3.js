// This module is designed to handle and process a single line of input data.

/**
 * Executes the primary logic for processing the provided input string.
 * It tokenizes the input, extracts specific components, and combines them in a defined order.
 * @param {string} rawInputContent - The complete string received from the input source.
 */
function ProcessInputData(rawInputContent) {
    // Initial validation: Ensure the input is indeed a string.
    // If not, log an error and terminate the processing for this call.
    if (typeof rawInputContent !== 'string') {
        console.error("Input processing error: The provided input must be a string type.");
        return; // Halt execution if input is invalid.
    }

    // Step 1: Tokenize the input string.
    // The input is expected to contain multiple segments separated by a single space character.
    // This operation creates an array of string tokens.
    const segmentCollection = rawInputContent.split(' ');

    // Step 2: Extract individual components from the tokenized array.
    // We expect at least two segments. Array destructuring is used for clean assignment.
    // Note: If fewer than two segments exist, the corresponding variables will be `undefined`.
    const [componentA, componentB] = segmentCollection;

    // Optional: Add a check for the number of segments if strict adherence to two components is required.
    // For this problem's behavior, even if `componentB` is `undefined`, the concatenation will proceed.
    if (segmentCollection.length < 2) {
        // This is a soft warning; the program will still attempt concatenation,
        // potentially resulting in "undefined" being part of the output string,
        // which matches the original script's implicit behavior for malformed input.
        console.warn("Warning: Input contained fewer than two expected segments. Processing may yield unexpected results.");
    }

    // Step 3: Define a helper function to concatenate the components in a specific order.
    // This function ensures explicit string conversion before joining, enhancing robustness.
    const generateCombinedOutput = (firstPart, secondPart) => {
        // The requirement is to combine the second extracted component with the first.
        return String(secondPart) + String(firstPart);
    };

    // Step 4: Compute the final result string using the helper function.
    const finalResultString = generateCombinedOutput(componentA, componentB);

    // Step 5: Display the calculated result to the standard output stream.
    console.log(finalResultString);
}

// --- Standard Environment Setup (Do not modify the code below this line) ---
// This section is responsible for reading input from the standard input stream
// and invoking the main processing function with the received data.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));