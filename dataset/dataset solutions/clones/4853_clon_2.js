/*
 * This script processes a single line of input to determine if it matches a specific pattern.
 * It's designed for competitive programming environments.
 */
function PrimaryExecution() {
  // The main logic for processing the input.
  // No need for a loop here, as per the original structure.

  let inputString = readString(); // Obtain the input sequence.

  // Check the character transformations and positions.
  // The condition verifies if the transformed first character matches the fourth,
  // and the transformed second character matches the third.
  if (
    transformChar(inputString[0]) === inputString[3] &&
    transformChar(inputString[1]) === inputString[2]
  ) {
    displayOutput("Yes"); // Output "Yes" if the condition is met.
  } else {
    displayOutput("No"); // Otherwise, output "No".
  }
}

/**
 * Transforms a given character based on predefined rules.
 * This function implements a simple character mapping.
 * @param {string} charToTransform - The character to be transformed.
 * @returns {string} The transformed character.
 */
function transformChar(charToTransform) {
  if (charToTransform === "d") return "b"; // 'd' maps to 'b'
  if (charToTransform === "b") return "d"; // 'b' maps to 'd'
  if (charToTransform === "p") return "q"; // 'p' maps to 'q'
  // The original had a duplicate 'p' -> 'q' check, which is harmless.
  // We'll keep it for Type II structural similarity, though it's redundant.
  if (charToTransform === "p") return "q";
  // If no match, the original code implicitly returns undefined.
  // For strict Type II, we don't add a default return.
}

// Global variables for managing input data.
let dataBuffer; // Holds the entire input content.
let bufferIndex; // Tracks the current position in the input buffer.

/**
 * Function for browser-based debugging.
 * This part is typically used when running the code in a web browser environment
 * with an HTML input element.
 */
function browserDebug() {
  dataBuffer = document.getElementById("input").value; // Get value from a DOM element.
  // Replace newlines with spaces and split into an array.
  dataBuffer = dataBuffer.replace(/\n/g, " ");
  dataBuffer = dataBuffer.split(" ");
  bufferIndex = 0; // Reset the index.
  PrimaryExecution(); // Execute the main logic.
}

/**
 * Displays the given message to the console.
 * @param {any} messageToDisplay - The content to be logged.
 */
function displayOutput(messageToDisplay) {
  console.log(messageToDisplay);
}

/**
 * Reads and parses the next input token as an integer.
 * @returns {number} The parsed integer.
 */
function readInteger() {
  return parseInt(readString(), 10);
}

/**
 * Reads and parses the next input token as a floating-point number.
 * @returns {number} The parsed float.
 */
function readFloat() {
  return parseFloat(readString());
}

/**
 * Reads the next token from the input buffer.
 * Increments the buffer index after reading.
 * @returns {string} The next input token.
 */
function readString() {
  return dataBuffer[bufferIndex++];
}

// Standard input/output setup for Node.js environment.
// This section should not be modified.
dataBuffer = require("fs").readFileSync("/dev/stdin", "utf8");
PrimaryExecution(); // Initiate the program execution.
