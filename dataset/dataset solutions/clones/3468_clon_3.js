/**
 * This module processes incoming string data based on specific length criteria.
 * It demonstrates robust input handling and conditional string manipulation.
 *
 * @param {string} incomingTextData - The raw text content received for analysis.
 */
function analyzeAndFormatString(incomingTextData) {
  // Guard clause: Ensure the provided data is actually a string.
  // This adds robustness and prevents unexpected behavior for non-string inputs.
  if (typeof incomingTextData !== 'string') {
    console.warn("Input type mismatch: Expected a string, but received " + typeof incomingTextData + ". Aborting processing.");
    return; // Exit early if input is invalid.
  }

  // Retrieve the character count of the input string.
  const textLength = incomingTextData.length;

  // Define the valid lengths for processing.
  const validLengthSet = new Set([2, 3]);

  // Initialize a variable to store the final result string.
  let finalResultantString = '';

  // Proceed only if the string length is one of the valid, predefined lengths.
  if (validLengthSet.has(textLength)) {
    // Convert the entire input string to lowercase for consistent processing.
    const normalizedText = incomingTextData.toLowerCase();

    // If the length is exactly two characters, the original input is used as the result.
    if (textLength === 2) {
      finalResultantString = incomingTextData;
    }
    // If the length is exactly three characters, the normalized string is reversed.
    else if (textLength === 3) {
      // Break down the reversal process into distinct steps for clarity.
      const charArray = normalizedText.split(''); // Convert string to an array of characters.
      const reversedArray = charArray.reverse();   // Reverse the order of characters in the array.
      finalResultantString = reversedArray.join(''); // Join the characters back into a string.
    }
    // No specific action for other lengths within the 'validLengthSet' (though only 2 and 3 are handled here).
  } else {
    // If the input length does not match the valid criteria, the result remains an empty string.
    // This maintains the original behavior of not printing anything for invalid lengths.
    // console.log("Input length (" + textLength + ") is not 2 or 3. No specific transformation applied.");
  }

  // Only output to the console if a specific result was generated.
  // This prevents logging an empty line when no transformation applies.
  if (finalResultantString !== '') {
    console.log(finalResultantString);
  }
}

// This line reads data from standard input and passes it to the processing function.
// It should not be altered as it's part of the execution environment setup.
analyzeAndFormatString(require("fs").readFileSync("/dev/stdin", "utf8"));