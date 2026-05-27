'use strict';

/**
 * This is the primary function that processes the input data.
 * It takes an array of strings, parses them, performs string manipulations,
 * and then outputs a calculated "happiness" value.
 * @param {string[]} inputLines - An array where each element is a line from standard input.
 */
function processInput(inputLines) {
  // The first line contains two space-separated numbers:
  // initialCount (N) and iterations (K).
  const [initialCount, iterations] = inputLines[0].split(' ').map(Number);
  // The second line contains the initial string (S).
  const initialString = inputLines[1];

  // First, apply a compression step to the initial string.
  let currentString = compressString(initialString);

  // Now, perform a series of reduction steps based on the 'iterations' count.
  // This loop continues for 'iterations' times or until the string is reduced to a single character.
  for (let loopCounter = 0; loopCounter < iterations; loopCounter++) {
    // If the string has only one character, no further reduction is possible,
    // so we can exit the loop early.
    if (currentString.length === 1) {
      break;
    }
    // The reduction rule: keep the first character and remove the next two characters.
    // For example, if currentString is "ABCDE", it becomes "ADE".
    currentString = currentString[0] + currentString.slice(3);
  }

  // Calculate the final happiness value.
  // This is the difference between the initial count and the length of the final string.
  const finalHappiness = initialCount - currentString.length;
  // Output the result to the console.
  console.log(finalHappiness);
}

/**
 * Compresses a string by removing consecutive identical characters.
 * For example, "aaabbcdeeff" becomes "abcdef".
 * @param {string} inputStr - The string to be compressed.
 * @returns {string} The string after removing adjacent duplicates.
 */
function compressString(inputStr) {
  let currentLength = inputStr.length; // Keep track of the string's mutable length.
  // Iterate through the string to find and eliminate duplicate adjacent characters.
  // The loop index 'charIndex' is only incremented if no duplicate is found at the current position.
  for (let charIndex = 0; charIndex < currentLength;) {
    // Check if the current character is the same as the one immediately following it.
    // Also, ensure 'charIndex + 1' is within the string bounds.
    if (charIndex !== currentLength - 1 && inputStr[charIndex] === inputStr[charIndex + 1]) {
      // If a duplicate is found, reconstruct the string by skipping the second duplicate character.
      // Example: if inputStr is "AAB" and charIndex is 0, it becomes "AB".
      inputStr = inputStr.slice(0, charIndex + 1) + inputStr.slice(charIndex + 2);
      currentLength--; // The string has become shorter by one character.
    } else {
      // If no duplicate is found at the current position, move to the next character.
      charIndex++;
    }
  }
  return inputStr; // Return the fully compressed string.
}

/**
 * This function calculates a "joy" metric for a string,
 * which is the difference between its original length and its length after compression.
 * Note: This function is defined but not invoked by the main program flow.
 * @param {string} targetString - The string for which to compute the joy.
 * @returns {number} The numerical joy value.
 */
function computeJoy(targetString) {
  // The joy is determined by how much the string's length is reduced by compression.
  return targetString.length - compressString(targetString).length;
}

/**
 * Sets up the standard input stream to read data,
 * then triggers the main processing function once all input is received.
 */
function executeProgram() {
  let rawData = ""; // A buffer to accumulate all incoming data from stdin.
  process.stdin.resume(); // Ensures the standard input stream is active and ready to receive data.
  process.stdin.setEncoding("utf8"); // Specifies the character encoding for the input data.

  // Attach an event listener for when data chunks are received from stdin.
  process.stdin.on("data", chunk => {
    rawData += chunk; // Append each received data chunk to the 'rawData' buffer.
  });

  // Attach an event listener for when the standard input stream ends (e.g., EOF is reached).
  process.stdin.on("end", () => {
    // Once all input has been collected, split the raw data into an array of lines
    // and pass it to the 'processInput' function for further handling.
    processInput(rawData.split("\n"));
  });
}

// Begin the program execution by initializing the standard input listener.
executeProgram();
