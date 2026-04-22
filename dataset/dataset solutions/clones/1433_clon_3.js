/**
 * Parses a string into an integer with base 10.
 * @param {string} inputString The string to parse.
 * @returns {number} The parsed integer, or NaN if parsing fails.
 */
function parseInteger(inputString) {
    // Type III: This helper function centralizes integer parsing.
    return parseInt(inputString, 10);
}

/**
 * Manages output messages, conditionally logging to a UI element during debug.
 * @param {string} message The string message to display.
 */
function emitMessage(message) {
    if (isDebuggingActive) {
        // Type III: Added timestamp and auto-scrolling for debug output.
        const timestamp = new Date().toLocaleTimeString();
        const debugOutputElement = document.getElementById("DebugConsoleDisplay");
        if (debugOutputElement) {
            debugOutputElement.value += `[${timestamp}] ${message}\n`;
            debugOutputElement.scrollTop = debugOutputElement.scrollHeight; // Auto-scroll to bottom
        }
    }
    // Always log to console for general execution visibility.
    console.log(message);
}

/**
 * Helper to emit all collected results.
 * @param {string[]} resultsArray An array of strings to be emitted.
 */
function emitAllResults(resultsArray) {
    // Type III: Centralized function for emitting final results.
    resultsArray.forEach(emitMessage);
}

/**
 * Global flag to control debug-specific functionalities.
 * Type III: Renamed from _Isdebug for clarity.
 */
let isDebuggingActive = false;

/**
 * Core function to process card sequence operations from raw input data.
 * This function reads lines, identifies card sequences or shuffle instructions,
 * and performs circular shifts on the card sequences.
 * @param {string} rawInputData The multi-line string containing card sequences and shuffle amounts.
 */
function ProcessCardOperations(rawInputData) {
    // Type III: Added a guard clause for empty or invalid input.
    if (!rawInputData || typeof rawInputData !== 'string' || rawInputData.trim() === '') {
        emitMessage("Input data is empty or invalid. No operations performed.");
        return;
    }

    const operationLines = rawInputData.split('\n');
    let currentCardSequence = []; // Type III: Changed from string to array of characters for manipulation.
    let collectedResults = [];    // Stores the final states of card sequences for batch output.
    let linePointer = 0;          // Index to track the current line being processed.

    // Type III: Encapsulated the numeric check logic into a dedicated helper.
    const isContentNumeric = (value) => {
        if (typeof value !== 'string') return false;
        const trimmedValue = value.trim();
        if (trimmedValue === '') return false; // Stricter than original `isNaN("")` which is false.
        // Checks if parsing to an integer results in a valid number.
        return !isNaN(parseInteger(trimmedValue));
    };

    // Main processing loop, iterating through each line of input.
    while (linePointer < operationLines.length) {
        const currentLineText = operationLines[linePointer].trim();

        // Check for the termination signal, usually a single hyphen.
        if (currentLineText === '-') {
            // If there's an active sequence, its final state is collected before program termination.
            if (currentCardSequence.length > 0) {
                collectedResults.push(currentCardSequence.join('')); // Join characters back to a string for output.
            }
            break; // Exit the processing loop.
        }

        // Determine if the current line defines a new card sequence or a shuffle count.
        if (!isContentNumeric(currentLineText)) {
            // This line is a new card sequence string (non-numeric).
            // If a previous sequence was active, its final state must be collected before starting a new one.
            if (currentCardSequence.length > 0) {
                collectedResults.push(currentCardSequence.join(''));
            }
            // Initialize the new card sequence by splitting the string into an array of characters.
            currentCardSequence = currentLineText.split('');
            linePointer++; // Advance to the next line, which is expected to be the shuffle amount for this new sequence.

            // Type III: Added a guard for unexpected end of input after a card sequence string.
            if (linePointer >= operationLines.length) {
                // If input ends abruptly after a card string, collect its current state.
                if (currentCardSequence.length > 0) {
                    collectedResults.push(currentCardSequence.join(''));
                }
                break; // Exit gracefully.
            }
        } else {
            // This line contains a shuffle count (numeric) for the current active card sequence.
            const shuffleMagnitude = parseInteger(currentLineText);

            // Type III: Added robust validation for the shuffle magnitude.
            if (isNaN(shuffleMagnitude) || shuffleMagnitude < 0) {
                emitMessage(`Warning: Invalid shuffle magnitude "${currentLineText}" detected. Skipping this shuffle operation.`);
            } else if (currentCardSequence.length === 0) {
                // A shuffle command appeared before any card sequence was defined.
                emitMessage(`Warning: Shuffle magnitude "${currentLineText}" found but no active card sequence to shuffle. Skipping.`);
            } else {
                // Calculate the effective shift, handling cases where magnitude is greater than sequence length.
                const effectiveShift = shuffleMagnitude % currentCardSequence.length;
                // Perform the circular shift (rotation) on the character array.
                currentCardSequence = currentCardSequence.slice(effectiveShift)
                                        .concat(currentCardSequence.slice(0, effectiveShift));
            }
            linePointer++; // Advance to the next line.
        }
    }

    // Type III: Centralized final output step using the helper function.
    emitAllResults(collectedResults);
}

// -- Debugging and Input Handling Utilities --

/**
 * Activates debug mode and re-executes the main processing logic using content from a specific DOM element.
 * This is primarily for browser-based debugging scenarios.
 * Type III: Renamed and enhanced for clearer debug functionality.
 */
function initializeDebugSystemAndExecute() {
    isDebuggingActive = true; // Enable debug mode globally.

    const debugInputSource = document.getElementById("DebugConsoleInput");
    const debugOutputDisplay = document.getElementById("DebugConsoleDisplay");

    if (!debugInputSource || !debugOutputDisplay) {
        console.error("Debug console input/output elements not found. Cannot activate debug mode.");
        return;
    }

    // Clear previous debug output for a fresh run and add session markers.
    debugOutputDisplay.value = "";
    debugOutputDisplay.value += "--- Debug Session Started ---\n";

    const debugInputContent = debugInputSource.value;
    ProcessCardOperations(debugInputContent);

    debugOutputDisplay.value += "--- Debug Session Ended ---\n";
}

// -- Main Entry Point for Production/Standard Input --

/**
 * Acquires input data from standard input, typically for command-line execution environments.
 * Type III: Encapsulated file system reading logic for better modularity and error handling.
 * @returns {string} The content read from standard input, or an empty string on error/unsupported environment.
 */
function acquireStandardInput() {
    // This block is specific to Node.js environments for competitive programming.
    if (typeof require === 'function' && typeof module === 'object' && module.exports) {
        try {
            const fileSystem = require("fs");
            return fileSystem.readFileSync("/dev/stdin", "utf8");
        } catch (error) {
            console.error("Error reading from standard input:", error);
            // Type III: Return an empty string to prevent further errors if input acquisition fails.
            return "";
        }
    } else {
        // Fallback for browser environments or when 'fs' module is not available.
        console.warn("Standard input acquisition (via 'fs' module) is not supported in this environment.");
        return "";
    }
}

// Execute the main program logic with input acquired from the standard source.
// Type III: Wrapped the main execution in an immediately invoked function expression (IIFE).
(function executeMainProgram() {
    const programInput = acquireStandardInput();
    ProcessCardOperations(programInput);
})();

// -- Unused utility functions (deleted as per Type III instructions) --
// The original `ascendingOrder`, `descendingOrder`, and `toStr` functions were not utilized
// by the `Main` function's core logic. As part of extensive Type III changes,
// these non-essential fragments have been removed to streamline the codebase.