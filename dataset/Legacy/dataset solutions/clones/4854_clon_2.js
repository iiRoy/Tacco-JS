// This section handles reading input from standard input and preparing it for processing.
// The 'node:fs' module is used to synchronously read the entire content of standard input.
let rawInputContent = require("node:fs").readFileSync("/dev/stdin", "utf8");

// The raw input string is first processed:
// 1. All newline characters are replaced with spaces.
// 2. The resulting string is split into an array of tokens based on whitespace.
let dataTokens = rawInputContent.replace(/\n/g, " ").split(" ");

// A global index to keep track of the current position in the 'dataTokens' array.
let tokenIndex = 0;

/*
 * This is the primary execution routine.
 * It processes the input data to determine a specific condition.
 */
function primaryExecution() {
    // The global 'dataTokens' array contains all input elements.
    let inputString = readStringToken(); // Fetch the next string from input

    // Evaluate a condition based on character transformations.
    // The condition checks if the transformed first character matches the fourth,
    // AND if the transformed second character matches the third.
    if (transformChar(inputString[0]) == inputString[3] && transformChar(inputString[1]) == inputString[2]) {
        displayResult("Yes"); // Output positive outcome if the condition is met.
    } else {
        displayResult("No"); // Output negative outcome otherwise.
    }
}

/**
 * Performs a character transformation based on predefined rules.
 * This function maps specific characters to their "mirrored" counterparts.
 * @param {string} charToProcess - The single character to transform.
 * @returns {string|undefined} The transformed character, or undefined if no rule matches.
 */
function transformChar(charToProcess) {
    if (charToProcess == "d") return "b"; // Rule 1: 'd' becomes 'b'
    if (charToProcess == "b") return "d"; // Rule 2: 'b' becomes 'd'
    if (charToProcess == "p") return "q"; // Rule 3: 'p' becomes 'q'
    if (charToProcess == "p") return "q"; // Redundant rule, preserved as per Type II definition.
    // If no condition is met, the function implicitly returns 'undefined'.
}

// This function is intended for local testing within a browser environment.
// It simulates input processing from a DOM element, typically a textarea.
function testEnvironment() {
    // The 'dataTokens' and 'tokenIndex' globals are re-initialized here for testing.
    dataTokens = document.getElementById("input").value; // Retrieve content from a text area
    // Convert the raw string into an array of tokens, similar to standard input processing.
    dataTokens = dataTokens.replace(/\n/g, " ").split(" ");
    tokenIndex = 0; // Reset the token counter
    primaryExecution(); // Execute the main logic with the simulated input
}

/**
 * Outputs a given message to the console.
 * This function serves as the standard output mechanism for the program.
 * @param {any} messageToLog - The data to be displayed.
 */
function displayResult(messageToLog) {
    console.log(messageToLog); // Uses the standard console.log for output.
}

/**
 * Reads the next token from the input stream and converts it to an integer.
 * It relies on the global 'dataTokens' array and 'tokenIndex'.
 * @returns {number} The parsed integer value.
 */
function readInteger() {
    return parseInt(readStringToken(), 10); // Parses the string token as a base-10 integer.
}

/**
 * Reads the next token from the input stream and converts it to a floating-point number.
 * It relies on the global 'dataTokens' array and 'tokenIndex'.
 * @returns {number} The parsed float value.
 */
function readFloat() {
    return parseFloat(readStringToken()); // Parses the string token as a floating-point number.
}

/**
 * Retrieves the next available token from the global input array.
 * Increments the global token index after retrieval to point to the next token.
 * @returns {string} The next input token.
 */
function readStringToken() {
    return dataTokens[tokenIndex++]; // Accesses the global input array and increments the index.
}

// This line initiates the main program execution.
// It calls the 'primaryExecution' function after the global input variables have been set up.
primaryExecution();
