function obtainStandardInputContent() {
    // This utility function is responsible for retrieving data from the standard input stream.
    // It uses Node.js's 'fs' module to synchronously read the entire content of '/dev/stdin',
    // interpreting it as a UTF-8 encoded string.
    return require("fs").readFileSync("/dev/stdin", "utf8");
}

function processInputPayload(inputPayload) {
    // Define a set of immutable constants for clarity and maintainability.
    // These represent the target characters and the specific messages to be generated.
    const TARGET_KEY_B = 'B';
    const TARGET_KEY_R = 'R';
    const RESULT_FOR_B_KEY = 'ARC';
    const RESULT_FOR_R_KEY = 'ABC';

    // The zero-based index indicating the position of the character we are interested in.
    const RELEVANT_CHAR_INDEX = 1;

    // Initialize the output message. This variable will hold the final string to be returned.
    let generatedOutputMessage = '';

    // Implement a pre-check (guard clause) to ensure the input is valid and long enough.
    // If the payload is null, undefined, or shorter than the required index,
    // we cannot safely extract the character, so we return an empty string.
    if (!inputPayload || inputPayload.length <= RELEVANT_CHAR_INDEX) {
        // In a more robust system, an error might be logged or a default value provided.
        // For this scenario, an empty string signifies no matching condition was met.
        return generatedOutputMessage;
    }

    // Extract the character at the specified index.
    // Using substring(start, end) provides an alternative to direct array-like access,
    // extracting a single-character string.
    const examinedCharacter = inputPayload.substring(RELEVANT_CHAR_INDEX, RELEVANT_CHAR_INDEX + 1);

    // Evaluate the extracted character against the defined target keys.
    // An if-else if structure ensures that only one condition is met and processed.
    if (examinedCharacter === TARGET_KEY_B) {
        // If the character matches 'B', assign the corresponding 'ARC' message.
        generatedOutputMessage = RESULT_FOR_B_KEY;
    } else if (examinedCharacter === TARGET_KEY_R) {
        // If the character matches 'R', assign the corresponding 'ABC' message.
        generatedOutputMessage = RESULT_FOR_R_KEY;
    }
    // No 'else' block is explicitly needed here, as 'generatedOutputMessage' retains its
    // initial empty string value if neither 'B' nor 'R' is found.

    // Return the final message determined by the conditional logic.
    return generatedOutputMessage;
}

// --- Program Execution Flow ---

// Step 1: Acquire the raw text content from the system's standard input.
const rawContentFromStdin = obtainStandardInputContent();

// Step 2: Process the acquired content to derive the specific output string.
// This separates the core logic from input/output concerns.
const finalResultString = processInputPayload(rawContentFromStdin);

// Step 3: Display the final result to the standard output.
// Only log if a non-empty string was produced, preventing blank lines for unmatched inputs.
if (finalResultString.length > 0) {
    console.log(finalResultString);
}