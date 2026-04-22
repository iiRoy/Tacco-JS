const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataStream;
const capturedLines = [];

inputReader.on(
  'line',
  function(receivedText) {
    capturedLines.push(receivedText);
  }
);

inputReader.on(
  'close', function() {
    dataStream = initializeParser(capturedLines);
    console.error("\n");
    const operationStartTime = Date.now();
    executeCoreLogic();
    const elapsedTime = Date.now() - operationStartTime;
    logDiagnostic("execution time: " + elapsedTime + " ms");
    logDiagnostic("memory usage: " + Math.round(process.memoryUsage().heapTotal / 1024) + " KB");
  }
);

/**
 * Generates a deep copy of an object using JSON serialization.
 * @param {object} originalObject - The source object to be duplicated.
 * @returns {object} A completely independent copy of the input object.
 */
function replicateObject(originalObject){
  return JSON.parse(JSON.stringify(originalObject));
}

/**
 * Retrieves the next available integer from the parsed input.
 * @returns {number} The next integer value.
 */
function retrieveInteger(){
  return performConversion(fetchNextItem(), 1);
}

/**
 * Extracts the next line as an array of string tokens, split by spaces.
 * @returns {string[]} An array of strings.
 */
function retrieveStringList(){
  return performConversion(fetchNextItem(), 2);
}

/**
 * Gets the next line as an array of numeric values, split by spaces.
 * @returns {number[]} An array of numbers.
 */
function retrieveIntegerList(){
  return performConversion(fetchNextItem(), 4);
}

/**
 * Obtains the next line as an array of individual characters.
 * @returns {string[]} An array of characters.
 */
function retrieveCharacterList(){
  return performConversion(fetchNextItem(), 6);
}

/**
 * Fetches the subsequent raw data entry from the input stream.
 * @returns {string} The next raw input entry.
 */
function fetchNextItem(){
  return dataStream.fetchNextItem();
}

/**
 * Determines if there are additional data entries available in the stream.
 * @returns {boolean} True if more items exist, false otherwise.
 */
function hasMoreItems(){
  return dataStream.hasMoreItems();
}

/**
 * Configures the input parsing mechanism.
 * @param {string[]} rawInputLines - An array containing the raw lines of input.
 * @returns {object} An object providing access to the parsed input data.
 */
function initializeParser(rawInputLines){
  return {
    sourceData : rawInputLines,
    currentPosition : 0,
    maximumCount : rawInputLines.length,
    hasMoreItems : function(){
      return (this.currentPosition < this.maximumCount);
    },
    fetchNextItem : function(){
      if (this.hasMoreItems()) {
        return this.sourceData[this.currentPosition++];
      } else {
        throw new Error("End of input reached! No further data available.");
      }
    }
  };
}

/**
 * Outputs a given message to the standard console.
 * @param {any} messageData - The information to be displayed.
 */
function displayResult(messageData){
  console.log(messageData);
}

/**
 * Logs detailed debugging information to the standard error stream.
 * @param {any} debugInfo - The data or object to inspect and log.
 */
function logDiagnostic(debugInfo){
  console.error("DIAGNOSTIC_LOG: " + require("util").inspect(debugInfo, false, null));
}

// This helper function transforms input values based on a specified conversion type.
// The `conversionType` parameter dictates the desired output format:
//  - 1: Parses the input string into a base-10 integer.
//  - 2: Splits the string by spaces into an array of strings.
//  - 4: Splits the string by spaces and converts each part to a number.
//  - 6: Breaks the string into an array of individual characters.
//  - 7: Splits into characters and attempts to convert each to a number.
//  - 8: Joins array elements into a single string with spaces as separators.
//  - 9: Joins array elements with newline characters between them.
//  - 0: Concatenates array elements without any separator.
//  - Otherwise: Returns the input value without modification.
function performConversion(inputValue, conversionType){
  try{
    switch(conversionType){
      case 1: return parseInt(inputValue, 10);
      case 2: return inputValue.split(" ");
      case 4: return inputValue.split(" ").map(Number);
      case 6: return inputValue.split("");
      case 7: return inputValue.split("").map(Number);
      case 8: return inputValue.join(" ");
      case 9: return inputValue.join("\n");
      case 0: return inputValue.join("");
      default: return inputValue;
    }
  } catch(error) {
    // In case of any conversion error, the original input value is returned.
    return inputValue;
  }
}

// This is the central function where the primary algorithm is executed.
function executeCoreLogic(){
  const initialCount = retrieveInteger(); // Obtains an initial numeric parameter
  let characterSequence = retrieveCharacterList(); // Reads the primary character sequence
  let finalResult = 0; // Stores the highest calculated match length

  // Continues processing as long as the character sequence is not empty
  while (characterSequence.length > 0) {
    // Allocates an array to store Z-values (match lengths)
    const matchLengths = Array(characterSequence.length).fill(0);
    matchLengths[0] = characterSequence.length; // The first element is always the total length

    let outerIndex = 1;
    let innerMatchLength = 0;

    // Computes the Z-array for the current character sequence
    while (outerIndex < characterSequence.length) {
      // Extends the current match as long as characters align
      while (
        (outerIndex + innerMatchLength) < characterSequence.length &&
        (characterSequence[innerMatchLength] === characterSequence[outerIndex + innerMatchLength])
      ) {
        innerMatchLength++;
      }
      matchLengths[outerIndex] = innerMatchLength; // Assigns the computed match length

      // If no match was found, simply advance the outer index
      if (innerMatchLength === 0) {
        outerIndex++;
        continue;
      }

      // Applies Z-algorithm optimization using previously computed values
      let optimizingOffset = 1;
      while (
        (outerIndex + optimizingOffset) < characterSequence.length &&
        (optimizingOffset + matchLengths[optimizingOffset] < innerMatchLength)
      ) {
        matchLengths[outerIndex + optimizingOffset] = matchLengths[optimizingOffset];
        optimizingOffset++;
      }
      outerIndex += optimizingOffset;
      innerMatchLength -= optimizingOffset;
    }

    // Iterates through the latter half of the Z-array to find the maximum match
    for (
      let backwardIndex = characterSequence.length - 1;
      backwardIndex >= characterSequence.length / 2;
      backwardIndex--
    ) {
      finalResult = Math.max(finalResult, matchLengths[backwardIndex]);
    }

    // Removes the leading character from the sequence for the next iteration
    characterSequence.shift();
  }

  // Displays the ultimate calculated result
  displayResult(finalResult);
}