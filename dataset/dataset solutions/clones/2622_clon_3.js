// Internal Utility Setup: This section handles input reading and foundational utilities for the program.
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataStore; // This global variable will hold the parsed input data and provide methods to access it sequentially.
var capturedLines = []; // A temporary array to store all lines read from standard input before processing.

// Event listener for each line of input received.
inputReader.on('line', function(currentLine){
  // Trim whitespace from the current line before storing, a minor improvement.
  capturedLines.push(currentLine.trim());
});

// Event listener for when the input stream closes, indicating all input has been received.
inputReader.on('close', function(){
  // Once all lines are captured, initialize the data source for consumption.
  dataStore = initializeDataSource(capturedLines);
  // Removed: console.error('\n↑入力 ↓出力'); - This was a purely cosmetic output line.
  // After setup, begin the primary execution logic of the program.
  executeMainLogic();
});

// Removed: The 'makeClone' function (`deepCopyValue`) was not utilized in the original Main logic,
// so it has been omitted as a Type III change (deletion of unused code).

// Helper functions designed for convenient retrieval and transformation of input data.
function retrieveNextInteger(){ return transformInput(fetchNextItem(), 1); }
function retrieveNextStringArray(){ return transformInput(fetchNextItem(), 2); }
function retrieveNextIntegerArray(){ return transformInput(fetchNextItem(), 4); }
function retrieveNextCharacterArray(){ return transformInput(fetchNextItem(), 6); }
// Fetches the next available item (line) from the data store. Renamed from 'next()'.
function fetchNextItem(){ return dataStore.fetchNext(); }
// Checks if there are more items (lines) available in the data store. Renamed from 'hasNext()'.
function hasMoreItems(){ return dataStore.hasMore(); }

/**
 * Initializes the data source object from an array of input strings.
 * This object provides methods to sequentially access the input data.
 * @param {string[]} sourceInputLines - An array of strings, each representing a line of input.
 * @returns {object} An object with `sourceData`, `currentPosition`, `totalItems`, `hasMore`, and `fetchNext` methods.
 */
function initializeDataSource(sourceInputLines){  
  // Guard clause: Ensure the provided input is a valid non-empty array.
  if (!Array.isArray(sourceInputLines) || sourceInputLines.length === 0) {
      // If input is invalid or empty, return a robust data source indicating no items.
      logDebugMessage('Warning: No valid input lines provided. Initializing empty data source.');
      return {
          sourceData : [],
          currentPosition : 0,
          totalItems : 0,
          hasMore : function(){ return false; }, // Always false if no data.
          fetchNext : function(){ throw new Error('Data source is empty; no items to retrieve.'); }
      };
  }
  return {
    sourceData : sourceInputLines, // Renamed from 'list' to be more descriptive.
    currentPosition : 0, // Renamed from 'index' to reflect current reading position.
    totalItems : sourceInputLines.length, // Renamed from 'max' to indicate total number of items.
    hasMore : function(){
        // Explicitly cast the comparison result to a boolean for clarity.
        return Boolean(this.currentPosition < this.totalItems);
    },
    fetchNext : function(){
        if(this.hasMore()){
            // Retrieve the current item and then advance the position.
            return this.sourceData[this.currentPosition++];
        } else {
            // Throw a more descriptive error when attempting to read beyond available data.
            throw new Error('Input exhausted: Attempted to retrieve an item beyond the available data range.');
        }
    }
  };
}

/**
 * Outputs a given message content to the console's standard output.
 * @param {any} messageContent - The content to be displayed.
 */
function displayOutput(messageContent){ console.log(messageContent); } // Renamed from 'myout'.

/**
 * Logs detailed debug information to the console's error stream.
 * Utilizes Node.js 'util.inspect' for comprehensive object inspection.
 * @param {any} debugContent - The data structure or message to be debugged.
 */
function logDebugMessage(debugContent){
  console.error('DEBUG_INFO: ' + require('util').inspect(debugContent, false, null)); // Renamed from 'myerr', added prefix.
}

/**
 * Transforms an input value based on a specified type identifier.
 * This function handles various common input parsing and formatting operations.
 * @param {string|Array} inputValue - The value to be transformed. This can be a string or an array.
 * @param {number} transformationType - An integer code defining the desired transformation:
 *   - 1: Parses the input string into an integer (base 10).
 *   - 2: Splits the input string by spaces into an array of strings.
 *   - 4: Splits the input string by spaces and then converts each part to an integer.
 *   - 6: Splits the input string into an array of individual characters.
 *   - 7: Splits the input string into characters and then converts each character to an integer.
 *   - 8: Joins an array of elements into a single string, separated by spaces.
 *   - 9: Joins an array of elements into a single string, separated by newlines.
 *   - 0: Joins an array of elements into a single string, with no separator.
 *   - Default: Returns the input value unchanged, logging a warning.
 * @returns {any} The transformed value, or the original value if transformation fails or type is unknown.
 */
function transformInput(inputValue, transformationType){
  try{
    switch(transformationType){
      case 1:
        // Added an explicit radix (10) for parseInt for robustness.
        var parsedInt = parseInt(inputValue, 10);
        // Added validation: check if parsing resulted in NaN.
        if (isNaN(parsedInt)) {
            logDebugMessage('Warning: parseInt resulted in NaN for input: "' + inputValue + '". Returning original value.');
            return inputValue; // Fallback to original value, similar to original's catch behavior.
        }
        return parsedInt;
      case 2:
        // Ensure inputValue is treated as a string before splitting.
        return String(inputValue).split(' ');
      case 4:
        // Introduce a descriptive variable for the mapping function for clarity.
        var stringToNumberMapper = function(s) { return Number(s); };
        return String(inputValue).split(' ').map(stringToNumberMapper);
      case 6:
        return String(inputValue).split('');
      case 7:
        var charToNumberMapper = function(c) { return Number(c); };
        return String(inputValue).split('').map(charToNumberMapper);
      case 8:
        // Added validation: check if inputValue is an array before attempting to join.
        if (!Array.isArray(inputValue)) {
            logDebugMessage('Warning: Attempted to join non-array input with type 8: "' + inputValue + '". Returning string representation.');
            return String(inputValue);
        }
        return inputValue.join(' ');
      case 9:
        if (!Array.isArray(inputValue)) {
            logDebugMessage('Warning: Attempted to join non-array input with type 9: "' + inputValue + '". Returning string representation.');
            return String(inputValue);
        }
        return inputValue.join('\n');
      case 0:
        if (!Array.isArray(inputValue)) {
            logDebugMessage('Warning: Attempted to join non-array input with type 0: "' + inputValue + '". Returning string representation.');
            return String(inputValue);
        }
        return inputValue.join('');
      default:
        // Log a message for any transformation type that is not explicitly handled.
        logDebugMessage('Unknown transformation type encountered: ' + transformationType + '. Returning original input value.');
        return inputValue; // Default behavior is to return the input unchanged.
    }
  } catch(conversionError){
    // Catch any unexpected errors during transformation, log them, and return the original value.
    logDebugMessage('Conversion error during transformInput for value "' + inputValue + '" with type ' + transformationType + ': ' + conversionError.message);
    return inputValue;
  }
}

// End Internal Utilities.

/**
 * This is the main program execution logic.
 * It reads an integer 'upperLimit' and then iterates through unique pairs of numbers (outerIndex, innerIndex).
 * For each pair, it performs a specific bitwise comparison across 10 bit positions.
 */
function executeMainLogic(){ // Renamed from 'Main' to be more descriptive of its role.
  const upperLimit = retrieveNextInteger(); // Renamed from 'N' to indicate its role as an upper bound.

  // Removed: The 'resultBuffer' array was declared in the original but never used,
  // so it has been deleted as a Type III change.

  // Guard clause: If the upperLimit is less than 2, no unique pairs (i, j) where i < j can be formed.
  if (upperLimit < 2) {
      logDebugMessage('Upper limit (' + upperLimit + ') is too small. No pairs to process; exiting main logic.');
      return; // Exit the function gracefully if there's nothing to process.
  }

  // Outer loop: Iterates from 0 up to (upperLimit - 2).
  for(let outerIndex = 0; outerIndex < upperLimit - 1; outerIndex++){ // Changed 'var' to 'let', renamed 'i'.
    // Inner loop: Iterates from (outerIndex + 1) up to (upperLimit - 1), ensuring unique pairs where outerIndex < innerIndex.
    for(let innerIndex = outerIndex + 1; innerIndex < upperLimit; innerIndex++){ // Changed 'var' to 'let', renamed 'j'.
      // Innermost loop: Checks bit positions from 0 up to 9 (inclusive).
      for(let bitPosition = 0; bitPosition < 10; bitPosition++){ // Changed 'var' to 'let', renamed 'k'.
        
        // Calculate the value of the 'bitPosition'-th bit of 'outerIndex'.
        // This isolates the specific bit (0 or 1).
        const outerBitValue = (outerIndex >> bitPosition) & 1;
        
        // Calculate a comparison value based on the 'bitPosition'-th bit of 'innerIndex' ANDed with 'bitPosition'.
        // This is the specific, somewhat unusual, bitwise logic from the original code,
        // which has been preserved precisely as it was.
        const innerComparisonValue = (innerIndex >> bitPosition) & bitPosition;
        
        // If the two calculated values are not equal, then output (bitPosition + 1).
        if(outerBitValue !== innerComparisonValue){
          displayOutput(bitPosition + 1);
        }
      }
    }
  }
}