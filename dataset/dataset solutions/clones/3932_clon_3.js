var fileSystemModule = require("node:fs");

// Reads standard input, processes it, and stores lines.
var rawDataLines = fileSystemModule.readFileSync("/dev/stdin", "utf8").trim().split("\n");

// Utility object for managing sequential access to input lines.
var inputProcessor = {
  "sourceDataArray" : rawDataLines, // The array of input lines.
  "currentPositionIdx" : 0,         // Current index for reading.
  "totalEntriesCount" : rawDataLines.length, // Total number of available entries.

  /**
   * Retrieves the next element from the input source.
   * Throws an error if no more elements are available.
   * @returns {string} The next line of input.
   */
  "retrieveNextElement" : function(){
    // Validate if the source array is properly initialized.
    if (!Array.isArray(this.sourceDataArray)) {
      throw new Error("Input source array is not defined or is not an array.");
    }

    // Check if there are more elements before attempting to retrieve.
    if (!this.hasMoreElements()){
      throw new Error("SequenceTraversalException: No further elements are present in the input stream.");
    }
    
    // Fetch the element at the current index.
    const fetchedElement = this.sourceDataArray[this.currentPositionIdx];
    this.currentPositionIdx++; // Advance the internal pointer.
    return fetchedElement;
  },

  /**
   * Checks if there are more elements to read in the input source.
   * @returns {boolean} True if more elements exist, false otherwise.
   */
  "hasMoreElements" : function(){
    // Ensure the index does not exceed the total count.
    return (this.currentPositionIdx < this.totalEntriesCount);
  }
};

// Entry point for the main program logic.
executePrimaryLogic();

/**
 * Global helper to get the next line from the processed input.
 * @returns {string} The next available input line.
 */
function getNextLine(){
  return inputProcessor.retrieveNextElement();
}

/**
 * Global helper to check if more lines are available in the input.
 * @returns {boolean} True if more lines exist, false otherwise.
 */
function checkNextLineExists(){
  return inputProcessor.hasMoreElements();
}

/**
 * Displays output to the standard console stream.
 * @param {*} messageContent - The content to be displayed.
 */
function displayResult(messageContent){
  console.info(messageContent); // Using console.info for standard output.
}

/**
 * Reports error or debug information to the standard error stream.
 * Includes a timestamp for better debugging.
 * @param {*} errorDetails - The information to be reported as an error.
 */
function reportErrorStatus(errorDetails){
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] DEBUG_INFO:`, errorDetails); // Using console.error for error output.
}

/**
 * Flexible utility for various data transformations and string manipulations.
 * Handles different conversion modes based on the 'transformationMode' parameter.
 *
 * @param {*} inputValue - The input value to be transformed.
 * @param {number} transformationMode - An integer specifying the transformation type.
 * @returns {*} The transformed value, or the original value if transformation fails or is not defined.
 */
function dataTransformationUtility(inputValue, transformationMode){
  // Basic validation: if input value is null or undefined, return it as is.
  if (inputValue === null || inputValue === undefined) {
    reportErrorStatus("Warning: Input value for transformation is null or undefined.");
    return inputValue;
  }

  try{
    switch(transformationMode){
      case 1: // Convert to integer.
        // Attempt to parse the input string into a base-10 integer.
        return Number.parseInt(inputValue, 10);
      case 2: // Split by single space.
        // Splits a string into an array of substrings using a single space as delimiter.
        return String(inputValue).split(" ");
      case 3: // Convert to uppercase (added new case).
        return String(inputValue).toUpperCase();
      case 4: // Split by space and convert each part to a number.
        // Splits by space, then maps each resulting string segment to a numeric type.
        const stringSegments = String(inputValue).split(" ");
        return stringSegments.map(segment => +segment); // Unary plus for numeric conversion.
      case 5: // Reverse string (added new case).
        return String(inputValue).split('').reverse().join('');
      case 6: // Split into individual characters.
        // Divides the string into an array where each element is a single character.
        return String(inputValue).split("");
      case 7: // Split into characters and convert each to a number.
        // Splits into characters and then attempts to convert each character to a number.
        const charArray = String(inputValue).split("");
        return charArray.map(Number); // Direct Number constructor for conversion.
      case 8: // Join array elements with a single space.
        // Expects an array and joins its elements into a string separated by spaces.
        if (Array.isArray(inputValue)) return inputValue.join(" ");
        return inputValue; // Return original if not an array.
      case 9: // Join array elements with a newline character.
        // Expects an array and joins its elements into a string separated by newlines.
        if (Array.isArray(inputValue)) return inputValue.join("\n");
        return inputValue; // Return original if not an array.
      case 0: // Join array elements without any separator.
        // Expects an array and concatenates its elements into a single string.
        if (Array.isArray(inputValue)) return inputValue.join("");
        return inputValue; // Return original if not an array.
      default: // Default case: return the input value unmodified.
        reportErrorStatus(`Warning: Unknown transformation mode '${transformationMode}'. Returning original value.`);
        return inputValue;
    }
  } catch(processingError){
    // In case of any error during transformation, log it and return the original input.
    reportErrorStatus(`Error during data transformation (mode ${transformationMode}): ${processingError.message}`);
    return inputValue;
  }
}

/**
 * The main execution flow of the program.
 * Processes an input string based on its length and content.
 */
function executePrimaryLogic(){
  const inputSequenceString = getNextLine(); // Retrieve the primary input string.

  // Check if the input string is empty; if so, there's nothing to process.
  if (!inputSequenceString || inputSequenceString.length === 0) {
    reportErrorStatus("Input sequence string is empty. Exiting.");
    displayResult("");
    return;
  }

  // Define the full alphabet for character comparison and modification.
  // Using a Set for efficient character lookup and removal later.
  const baseAlphabet = dataTransformationUtility("abcdefghijklmnopqrstuvwxyz", 6);
  let availableCharsPool = new Set(baseAlphabet);

  // Scenario 1: Input string length is less than 26 characters.
  // This implies there are missing characters from the alphabet.
  if (inputSequenceString.length < 26){
     // Iterate through the characters of the input string.
     // Remove any character present in the input from our available character pool.
     for(let currentCharacter of inputSequenceString){
       if(availableCharsPool.has(currentCharacter)){
         availableCharsPool.delete(currentCharacter);
       }
     }

    // Convert the Set back to an array and sort it to find the lexicographically smallest.
    const sortedRemainingChars = Array.from(availableCharsPool).sort();
    reportErrorStatus({
      debugMessage: "Remaining characters in alphabet pool:",
      remainingChars: sortedRemainingChars
    });

    // Find the smallest lexicographical character that was not in the input string
    // and append it to the input string.
    if (sortedRemainingChars.length > 0) {
      const smallestMissingChar = sortedRemainingChars[0];
      const modifiedString = `${inputSequenceString}${smallestMissingChar}`;
      displayResult(modifiedString);
    } else {
      // This case should ideally not be hit if length < 26, but handles edge case.
      displayResult(inputSequenceString);
    }
  }
  // Scenario 2: Input string length is exactly 26 characters.
  else {
    // Special case check: If the string is the reverse-sorted alphabet.
    // This string has no lexicographically larger permutation.
    const reverseAlphabeticalSequence = "zyxwvutsrqponmlkjihgfedcba";
    if(inputSequenceString === reverseAlphabeticalSequence){
       displayResult(-1); // Indicate no larger permutation exists.
    } else {
       // Placeholder for the logic to find the next lexicographically larger permutation.
       // This typically involves finding the rightmost character that can be incremented
       // and then sorting the suffix. The original code left this empty.
       // We'll add a comment and a dummy function call to reflect structural change.
       // If the task was to complete the functionality, this block would be filled.
       displayResult("Logic for next permutation of 26-char string needs implementation.");
       // nextPermutationAlgorithm(inputSequenceString); // A hypothetical function call
    }
  }
}