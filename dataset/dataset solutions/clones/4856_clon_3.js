// This module handles input parsing and pattern analysis.

// Global pointer for traversing processed input segments.
let currentReadPointer;

// Array holding parsed input tokens.
let processedInputSegments;

/**
 * Main entry point for processing the provided text payload.
 * It prepares the input, extracts a specific pattern, and checks its symmetry.
 * @param {string} textPayload The raw input string containing data.
 */
function ProcessInputData(textPayload) {
    // Normalize newlines to spaces and split into an array of non-empty tokens.
    // Using /\s+/ to handle multiple spaces and filter(Boolean) to remove empty strings.
    processedInputSegments = textPayload.replace(/\r?\n/g, ' ').split(/\s+/).filter(Boolean);

    // Initial check for empty input after processing.
    if (processedInputSegments.length === 0) {
        DisplayResult("Error: No valid input segments found.");
        return;
    }

    // Retrieve the target character sequence from the first available segment.
    let targetSequence = FetchNextSegment();

    // Guard clause: ensure the target sequence has enough characters for the symmetry check.
    if (!targetSequence || targetSequence.length < 4) {
        DisplayResult("No"); // Insufficient sequence length for pattern match.
        return;
    }

    // Perform the symmetry checks for the required character positions.
    const firstCharReflected = GetReflectedSymbol(targetSequence[0]);
    const secondCharReflected = GetReflectedSymbol(targetSequence[1]);

    // Evaluate the two conditions for the overall pattern match.
    // Ensure reflections are not null (i.e., recognized symbols) before comparison.
    const conditionOneMet = (firstCharReflected !== null && firstCharReflected === targetSequence[3]);
    const conditionTwoMet = (secondCharReflected !== null && secondCharReflected === targetSequence[2]);

    // Output the final determination based on both conditions.
    if (conditionOneMet && conditionTwoMet) {
        DisplayResult("Yes");
    } else {
        DisplayResult("No");
    }
}

/**
 * Determines the reflected character for specific input symbols based on a predefined mapping.
 * @param {string} inputSymbol The character to reflect.
 * @returns {string|null} The reflected character, or null if the symbol is not recognized.
 */
function GetReflectedSymbol(inputSymbol) {
    switch (inputSymbol) {
        case "d":
            return "b";
        case "b":
            return "d";
        case "p":
            return "q";
        case "q":
            return "p";
        default:
            // Return null for any unrecognized symbol, allowing calling function to handle.
            return null;
    }
}

/**
 * Simulates a browser-like environment for debugging purposes.
 * It attempts to read input from a DOM element with id "input" and then
 * calls the main processing function. This is typically used for client-side testing.
 */
function SimulateBrowserEnvironment() {
    // Check if 'document' object and the target input element are available.
    if (typeof document === 'undefined' || !document.getElementById("input")) {
        console.warn("Browser environment simulation failed: 'input' element not found or document not available in this context.");
        return;
    }
    const browserInput = document.getElementById("input").value;
    currentReadPointer = 0; // Reset the pointer for each new simulation run.
    ProcessInputData(browserInput);
}

/**
 * Displays the final processed outcome or any message to the console.
 * @param {string} resultMessage The message string to be output.
 */
function DisplayResult(resultMessage) {
    console.log(resultMessage);
}

/**
 * Retrieves the next string segment from the `processedInputSegments` array
 * and parses it as an integer.
 * @returns {number} The parsed integer value. Returns NaN if parsing fails.
 */
function RetrieveNextInteger() {
    const nextSegment = FetchNextSegment();
    // Always specify radix for parseInt for consistent behavior.
    return parseInt(nextSegment, 10);
}

/**
 * Retrieves the next string segment from the `processedInputSegments` array
 * and parses it as a floating-point number.
 * @returns {number} The parsed float value. Returns NaN if parsing fails.
 */
function RetrieveNextFloat() {
    const nextSegment = FetchNextSegment();
    return parseFloat(nextSegment);
}

/**
 * Fetches the next string segment (token) from the `processedInputSegments` array.
 * Increments the `currentReadPointer` after retrieval.
 * Includes a bounds check to prevent reading beyond the array limits.
 * @returns {string|undefined} The next segment string, or `undefined` if the pointer
 *                             is out of bounds, indicating no more segments.
 */
function FetchNextSegment() {
    if (currentReadPointer < processedInputSegments.length) {
        return processedInputSegments[currentReadPointer++];
    }
    // Log a warning for attempting to read past the end of the input.
    console.warn("Attempted to read beyond available input segments. Check input parsing logic.");
    return undefined;
}

// --- System Initialization and Execution ---
// This section is specifically designed for a Node.js environment,
// handling input from standard input (/dev/stdin).
// It should typically remain unchanged for competitive programming setups.
currentReadPointer = 0; // Initialize the global read pointer for the main execution flow.

// Read the entire standard input synchronously, decode as UTF-8, and then
// pass it to the primary processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));