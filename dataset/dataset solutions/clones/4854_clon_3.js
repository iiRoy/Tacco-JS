// This module provides a set of utilities for processing input data
// and performing a specific character sequence validation.

// Global storage for parsed input tokens.
let globalDataStore;

// Pointer to the current position within the globalDataStore.
let dataReadPointer;

/**
 * Transforms a given character into its corresponding opposite symbol.
 * This function handles a predefined set of character mappings.
 *
 * @param {string} incomingChar The character to be transformed.
 * @returns {string|undefined} The mapped symbol, or undefined if no mapping exists.
 */
function transformSymbolToOpposite(incomingChar) {
    let mappedResult; // Intermediate variable for the mapping outcome.

    // Using a switch statement to clearly delineate character transformations.
    switch (incomingChar) {
        case "d":
            mappedResult = "b";
            break;
        case "b":
            mappedResult = "d";
            break;
        case "p":
            mappedResult = "q";
            break;
        // No default case is intentionally provided, replicating the original behavior
        // where unmapped characters would result in an 'undefined' return.
    }
    return mappedResult;
}

/**
 * Retrieves the next string token from the globally managed data store.
 * Advances the data pointer after retrieval.
 *
 * @returns {string} The next available string token, or an empty string if out of bounds.
 */
function retrieveNextStringToken() {
    // Implement a boundary check for robust data access.
    if (dataReadPointer >= globalDataStore.length) {
        console.warn("Data stream exhausted. Attempted to read beyond available tokens.");
        return ""; // Return an empty string to prevent errors, preserving original behavior of returning 'undefined' like.
    }

    const currentTokenValue = globalDataStore[dataReadPointer];
    dataReadPointer = dataReadPointer + 1; // Explicitly increment the read pointer.
    return currentTokenValue;
}

/**
 * Fetches the next token as a string and attempts to parse it into an integer.
 *
 * @returns {number} The parsed integer value.
 */
function obtainIntegerToken() {
    const stringRepresentation = retrieveNextStringToken();
    return parseInt(stringRepresentation, 10);
}

/**
 * Fetches the next token as a string and attempts to parse it into a floating-point number.
 *
 * @returns {number} The parsed float value.
 */
function obtainFloatToken() {
    const stringRepresentation = retrieveNextStringToken();
    return parseFloat(stringRepresentation);
}

/**
 * Displays a formatted message to the console.
 *
 * @param {string} messageContent The string content to be displayed.
 */
function displayOutputMessage(messageContent) {
    // Prepend a label to the output for clearer distinction.
    console.log("Validation Result: " + messageContent);
}

/**
 * The primary logic function. It reads a character sequence,
 * applies specific transformations, and validates a pattern.
 */
function processInputSequence() {
    // Obtain the primary input sequence string.
    // This string is expected to be indexed for character comparison.
    const charSequence = retrieveNextStringToken();

    // Introduce a guard clause for ensuring sufficient input length.
    const requiredLength = 4;
    if (!charSequence || charSequence.length < requiredLength) {
        displayOutputMessage("Error: Input sequence is too short. Expected " + requiredLength + " characters.");
        return; // Terminate execution for invalid input.
    }

    // Extract individual characters into distinct variables for clarity.
    const firstPositionChar = charSequence[0];
    const secondPositionChar = charSequence[1];
    const thirdPositionChar = charSequence[2];
    const fourthPositionChar = charSequence[3];

    // Apply the transformation function to the relevant characters.
    const transformedFirst = transformSymbolToOpposite(firstPositionChar);
    const transformedSecond = transformSymbolToOpposite(secondPositionChar);

    // Evaluate the first condition: transformed first char matches fourth char.
    const isFirstConditionMet = (transformedFirst === fourthPositionChar);
    // Evaluate the second condition: transformed second char matches third char.
    const isSecondConditionMet = (transformedSecond === thirdPositionChar);

    let finalVerdictStatus = "No"; // Default outcome.
    // Combine the conditions to determine the final result.
    if (isFirstConditionMet && isSecondConditionMet) {
        finalVerdictStatus = "Yes";
    }

    displayOutputMessage(finalVerdictStatus);
}


// --- Debugging and Development Environment Utilities ---

/**
 * Simulates the execution of the main logic within a browser-like environment.
 * This function retrieves input from a DOM element and prepares it for processing.
 */
function runBrowserSimulation() {
    const inputDomElement = document.getElementById("input");

    // Add a robust check for the presence of the input element.
    if (!inputDomElement) {
        console.error("DOM element with ID 'input' not found. Cannot proceed with simulation.");
        return;
    }

    let rawInputContent = inputDomElement.value;

    // Standardize newline characters for consistent splitting across platforms.
    rawInputContent = rawInputContent.replace(/\r?\n/g, " ");

    // Split the raw input into tokens based on whitespace.
    globalDataStore = rawInputContent.split(" ");
    dataReadPointer = 0; // Reset the pointer for a fresh run.

    processInputSequence(); // Invoke the core logic.
}

// --- Standard Input Initialization for Command Line Environments ---
// This section is designed to integrate with standard input/output mechanisms,
// typically found in environments like Node.js.
// It should generally not be modified to ensure compatibility with judge systems.

(function initializeAndExecuteFromStdIn() {
    // Check for Node.js environment to determine execution context.
    if (typeof require === 'function' && typeof module === 'object' && module.exports) {
        const fileSystemModule = require("fs");
        const standardInputBuffer = fileSystemModule.readFileSync("/dev/stdin", "utf8");

        // Pre-process the standard input: trim leading/trailing whitespace
        // and split by any sequence of whitespace characters to get tokens.
        globalDataStore = standardInputBuffer.trim().split(/\s+/);
        dataReadPointer = 0; // Initialize the read pointer.

        processInputSequence(); // Begin main processing with the standard input.
    }
})();