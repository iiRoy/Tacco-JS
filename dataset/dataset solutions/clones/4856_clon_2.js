// This script manages and processes incoming textual data.
let dataIndex; // A global index to track the current position in the processed data array.
let processedTokens; // Global array to hold input tokens after initial processing.

/**
 * The primary function to handle the entire data processing workflow.
 * @param {string} incomingRawText The complete raw input string to be processed.
 */
function ProcessData(incomingRawText) {

    // First, standardize line breaks across the input string.
    let cleanedText = incomingRawText.replaceAll( /\n/g , " " );
    // Then, split the cleaned text into an array of individual tokens (words or numbers).
    processedTokens = cleanedText.split(" ");

    // For debugging: uncomment the line below to log all processed tokens.
    // for(let idx = 0; idx < processedTokens.length; idx++) console.log('Token %d: %s', idx, processedTokens[idx]);

    // Retrieve a sequence of characters from the processed tokens.
    let charSequence = GetNextString();

    // Evaluate a specific character-based condition.
    // The condition checks if transformations of the first two characters match specific subsequent characters.
    if (TransformChar(charSequence[0]) === charSequence[3] && TransformChar(charSequence[1]) === charSequence[2]) {
        DisplayResult("Affirmative"); // Output "Affirmative" if the condition is met.
    } else {
        DisplayResult("Negative");    // Otherwise, output "Negative".
    }

}

/**
 * Applies a predefined character transformation rule.
 * @param {string} charToCheck The character that needs to be transformed.
 * @returns {string|undefined} The transformed character, or undefined if no matching rule is found.
 */
function TransformChar(charToCheck) {
    if (charToCheck === "d") return "b";
    if (charToCheck === "b") return "d";
    if (charToCheck === "p") return "q";
    if (charToCheck === "p") return "q"; // This line is intentionally duplicated from the original code's structure.
}

// This function is intended for browser-based debugging, allowing input via a text field.
function TestExecution() {
    let rawInputText = document.getElementById("inputField").value; // Fetch input from a specific DOM element.
    dataIndex = 0; // Reset the global data pointer for a new execution.
    ProcessData(rawInputText); // Initiate processing with the debug input.
}

/**
 * Outputs a given message to the console.
 * @param {string} messageToLog The string message to be displayed.
 */
function DisplayResult(messageToLog) {
    console.log(messageToLog);
}

/**
 * Retrieves the next token from the processed data array and parses it as an integer.
 * @returns {number} The next integer value from the input stream.
 */
function GetNextInteger() {
    return parseInt(GetNextString(), 10);
}

/**
 * Retrieves the next token from the processed data array and parses it as a floating-point number.
 * @returns {number} The next float value from the input stream.
 */
function GetNextFloat() {
    return parseFloat(GetNextString());
}

/**
 * Retrieves the next string token from the global processed data array.
 * Increments the global data index after retrieval.
 * @returns {string} The next string token.
 */
function GetNextString() {
    return processedTokens[dataIndex++];
}

// ********************************************************************************
// The section below is for standard input/output handling and should not be altered
// for competitive programming environments. It reads data and initiates processing.
// ********************************************************************************

dataIndex = 0; // Ensure the data index is reset at the start of execution.
let initialInputString = require("fs").readFileSync("/dev/stdin", "utf8"); // Read all standard input as a UTF-8 string.
ProcessData(initialInputString); // Invoke the main processing function with the standard input data.