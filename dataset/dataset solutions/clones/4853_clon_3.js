// This module handles processing of character sequences based on a specific transformation rule.

// Global variables for input management
let dataTokens; // Stores tokenized input data
let currentTokenIndex; // Points to the current token being processed

// Function to perform the main logical processing
function evaluateCharacterSequence() {
    // A quick preliminary check for input readiness.
    if (!dataTokens || dataTokens.length === 0) {
        logToConsole("Error: Input data not initialized or empty.");
        return;
    }

    let currentSequence = fetchNextStringToken(); // Get the primary input sequence

    // Basic validation for the sequence length
    if (currentSequence === null || currentSequence.length < 4) {
        logToConsole("No"); // Insufficient sequence length
        return;
    }

    // Extract individual characters for clarity
    const firstChar = currentSequence[0];
    const secondChar = currentSequence[1];
    const thirdChar = currentSequence[2];
    const fourthChar = currentSequence[3];

    // Apply the transformation rule to specific characters
    const transformedFirst = getSymmetricCharacter(firstChar);
    const transformedSecond = getSymmetricCharacter(secondChar);

    // Compare transformed characters with others in the sequence
    const conditionOneMet = (transformedFirst === fourthChar);
    const conditionTwoMet = (transformedSecond === thirdChar);

    // Determine the final outcome
    if (conditionOneMet && conditionTwoMet) {
        logToConsole("Yes");
    } else {
        logToConsole("No");
    }
}

// Maps specific characters to their symmetric counterparts
// Returns null if the character is not recognized.
function getSymmetricCharacter(inputChar) {
    let resultChar = null; // Initialize with a default null value

    // Using a switch statement for clarity and extensibility
    switch (inputChar) {
        case 'd':
            resultChar = 'b';
            break;
        case 'b':
            resultChar = 'd';
            break;
        case 'p':
            resultChar = 'q';
            break;
        case 'q':
            resultChar = 'p'; // Corrected, 'q' should map to 'p' if 'p' maps to 'q'
            break;
        default:
            // For any other character, no transformation occurs.
            // A common practice might be to return the inputChar itself or throw an error.
            // For this clone, we stick to null for unrecognized.
            break;
    }
    return resultChar;
}

// Function to simulate the execution environment for local debugging
function simulateExecution() {
    const inputElement = document.getElementById("input_area_for_testing");

    if (!inputElement) {
        console.error("Debugging input element not found. Please ensure an element with ID 'input_area_for_testing' exists.");
        return;
    }

    let rawInputContent = inputElement.value;
    // Normalize newlines and trim whitespace, then split into tokens
    rawInputContent = rawInputContent.replace(/\r?\n|\r/g, " ").trim();
    dataTokens = rawInputContent.split(" ").filter(token => token !== ''); // Filter out empty strings from split
    currentTokenIndex = 0; // Reset token pointer for new simulation

    console.log("--- Simulating with input: ---");
    console.log(rawInputContent);
    console.log("--- Output: ---");
    evaluateCharacterSequence(); // Call the main processing function
    console.log("--- Simulation Complete ---");
}

// Outputs a message to the standard console
function logToConsole(messageContent) {
    if (messageContent !== null && messageContent !== undefined && String(messageContent).trim() !== '') {
        console.log(`[APP_LOG] ${messageContent}`);
    } else {
        console.warn("[APP_LOG] Attempted to log an empty or null message.");
    }
}

// Fetches the next integer token from the input stream
function fetchNextIntegerToken() {
    const tokenStr = fetchNextStringToken();
    if (tokenStr === null) return NaN; // Indicate failure to get a token
    const parsedInt = Number.parseInt(tokenStr, 10);
    return Number.isNaN(parsedInt) ? 0 : parsedInt; // Return 0 or NaN based on desired error handling
}

// Fetches the next floating-point token from the input stream
function fetchNextFloatingPointToken() {
    const tokenStr = fetchNextStringToken();
    if (tokenStr === null) return NaN; // Indicate failure to get a token
    const parsedFloat = Number.parseFloat(tokenStr);
    return Number.isNaN(parsedFloat) ? 0.0 : parsedFloat; // Return 0.0 or NaN based on desired error handling
}

// Fetches the next string token and advances the pointer
function fetchNextStringToken() {
    if (!dataTokens || currentTokenIndex >= dataTokens.length) {
        return null; // No more tokens available or input not initialized
    }
    const token = dataTokens[currentTokenIndex];
    currentTokenIndex = currentTokenIndex + 1; // Increment the pointer
    return token;
}

// ******* Standard Input/Output Configuration (DO NOT MODIFY BELOW THIS LINE IN PRODUCTION) *******
// This section reads input from standard input and initiates the main processing logic.
try {
    // Ensure 'fs' module is available in the environment (Node.js)
    if (typeof require === 'function' && typeof process === 'object' && process.versions && process.versions.node) {
        const fileSystem = require("fs");
        // Read entire content from standard input synchronously
        let stdInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");

        // Pre-process the standard input to tokenize it
        stdInputContent = stdInputContent.trim().replace(/\r?\n|\r/g, " ");
        dataTokens = stdInputContent.split(" ").filter(t => t !== ''); // Split by space, filter empty
        currentTokenIndex = 0; // Initialize token pointer

        // Begin the primary application logic
        evaluateCharacterSequence();
    } else {
        // Handle non-Node.js environments where fs is not available,
        // or for testing in a browser-like environment without the 'debug' function being called.
        logToConsole("Warning: Running in an environment without Node.js 'fs' module. Input might not be correctly processed from stdin.");
    }
} catch (e) {
    logToConsole(`Error during standard input processing: ${e.message}`);
}