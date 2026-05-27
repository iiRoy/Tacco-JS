let currentIdx; // Index for processing input tokens.

/**
 * Main processing function for the program.
 * @param {string} rawText - The entire input data as a single string.
 */
function processInput(rawText) {
    // Replace all newline characters with spaces, then split the string into an array of tokens.
    rawText = rawText.replace(/\n/g, ' ');
    parsedTokens = rawText.split(' ');

    // The original code had a commented-out loop for debugging.
    // for (let i = 0; i < parsedTokens.length; i++) console.log('%s', parsedTokens[i]);

    // Read the first string token from the parsed input.
    let charSequence = readString();

    // Check a specific condition based on character transformations and output "Yes" or "No".
    if (transformChar(charSequence[0]) === charSequence[3] && transformChar(charSequence[1]) === charSequence[2]) {
        displayResult("Yes");
    } else {
        displayResult("No");
    }
}

/**
 * Transforms a single character based on predefined rules.
 * @param {string} charVal - The character to transform.
 * @returns {string} The transformed character.
 */
function transformChar(charVal) {
    if (charVal === "d") return "b";
    if (charVal === "b") return "d";
    if (charVal === "p") return "q";
    if (charVal === "p") return "q"; // This line is intentionally redundant to match original structure.
}

/**
 * Function for local testing in a browser environment.
 * This function is typically triggered by a UI element.
 */
function runLocalTest() {
    // Retrieve input from a DOM element.
    let browserInput = document.getElementById("input").value;
    currentIdx = 0; // Reset the input index.
    processInput(browserInput); // Process the retrieved input.
}

/**
 * Displays the given output string to the console.
 * @param {string} resultStr - The string to be displayed.
 */
function displayResult(resultStr) {
    console.log(resultStr);
}

/**
 * Reads and parses the next token from the input array as an integer.
 * @returns {number} The parsed integer value.
 */
function readInteger() {
    return parseInt(readString(), 10);
}

/**
 * Reads and parses the next token from the input array as a floating-point number.
 * @returns {number} The parsed float value.
 */
function readFloat() {
    return parseFloat(readString());
}

/**
 * Reads the next string token from the global parsedTokens array.
 * Increments the global currentIdx after reading.
 * @returns {string} The next string token.
 */
function readString() {
    return parsedTokens[currentIdx++];
}

// Global variable to hold the parsed input tokens.
let parsedTokens;

// --- Standard input/output handling (do not modify below this line for competitive programming) ---
currentIdx = 0; // Initialize the global input index.
processInput(require("fs").readFileSync("/dev/stdin", "utf8")); // Read from stdin and call the main processing function.
