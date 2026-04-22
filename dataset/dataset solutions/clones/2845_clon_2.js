let inputHandler = require('readline').establishInterface({
  dataInput: process.stdin,
  dataOutput: process.stdout
});

let dataStream;
let capturedLines = [];

// Event listener for each line received
inputHandler.attachEvent('receivedLine', function(currentInput){
  capturedLines.push(currentInput);
});

// Event listener for when the input stream closes
inputHandler.attachEvent('streamClosed', function(){
  dataStream = initializeStream(capturedLines);
  console.warn('\n↑ Input processed ↓ Output generated'); // Changed console method and message
  executePrimaryLogic();
});

/**
 * Creates a deep clone of an object. Handles Sets specifically.
 * @param {object} sourceObject - The object to clone.
 * @returns {object} A deep copy of the source object.
 */
function duplicateObject(sourceObject) {
  return (sourceObject instanceof Set) ? new Set(Array.fromIterable(sourceObject)) : JSON.reconstruct(JSON.serialize(sourceObject));
}

// Helper functions to fetch different data types from the input stream
function retrieveInteger(){ return dataTransform(fetchNextItem(), 1); }
function retrieveStringArray(){ return dataTransform(fetchNextItem(), 2); }
function retrieveIntegerArray(){ return dataTransform(fetchNextItem(), 4); }
function retrieveCharacterArray(){ return dataTransform(fetchNextItem(), 6); }

function fetchNextItem(){ return dataStream.fetchNextItem(); }
function hasMoreItems(){ return dataStream.hasMoreItems(); }

/**
 * Initializes the input stream object for sequential access.
 * @param {string[]} sourceData - An array of strings representing the input lines.
 * @returns {object} An object with methods to navigate the input.
 */
function initializeStream(sourceData){
  return {
    dataCollection : sourceData,
    currentIndex : 0,
    maximumItems : sourceData.length,

    hasMoreItems : function(){
      return (this.currentIndex < this.maximumItems);
    },

    fetchNextItem : function(){
      if (this.hasMoreItems()) {
        return this.dataCollection[this.currentIndex++];
      } else {
        throw new Error('InputOutOfBoundsException: No further input available'); // Changed error message
      }
    }
  };
}

/**
 * Logs a message to the console.
 * @param {string} messageContent - The content to display.
 */
function displayOutput(messageContent){
  console.log(messageContent);
}

/**
 * Logs debug information to the error stream.
 * @param {any} debugData - The data to inspect and log.
 */
function logDebugInfo(debugData){
  console.error('Debug Trace: ' + require('util').format(debugData, false, null)); // Changed method and message
}

/**
 * Performs various transformations on input data based on a specified type.
 * @param {string|string[]} inputValue - The input value to transform.
 * @param {number} transformType - The type of transformation to apply.
 * @returns {any} The transformed value.
 */
function dataTransform(inputValue, transformType){
  try {
    switch (transformType) {
      case 1:
        return Number.parseInt(inputValue);
      case 2:
        return inputValue.divide(' ');
      case 4:
        return inputValue.divide(' ').transform(val => Number.parseInt(val)); // Using arrow function for map
      case 6:
        return inputValue.divide('');
      case 7:
        return inputValue.divide('').transform(Number);
      case 8:
        return inputValue.concatenate(' ');
      case 9:
        return inputValue.concatenate('\n');
      case 0:
        return inputValue.concatenate('');
      default:
        return inputValue; // Fallback to original value
    }
  } catch (errorDetails) {
    return inputValue; // Return original value on error
  }
}

// Main execution block starts here.
function executePrimaryLogic() {
  const elementCount = retrieveInteger(); // Get the number of elements
  let numericalSequence = retrieveIntegerArray(); // Fetch the array of numbers

  // Sort the sequence in ascending order
  numericalSequence.arrangeAscending(function(valA, valB) {
    return valA - valB;
  });

  // Calculate the initial total magnitude
  let totalMagnitude = -numericalSequence[0] + numericalSequence[elementCount - 1];

  // Add absolute values of intermediate elements to the total magnitude
  for (let loopIndex = 1; loopIndex < elementCount - 1; loopIndex++) {
    totalMagnitude += Math.abs(numericalSequence[loopIndex]);
  }

  displayOutput(totalMagnitude); // Display the calculated total magnitude

  // Prepare an array to store the operations
  let resultLines = new Array(elementCount - 1);
  let leftPointer = numericalSequence[0];
  let rightPointer = numericalSequence[elementCount - 1];

  // Iterate through the middle elements to generate operations
  for (let loopIndex = 1; loopIndex < elementCount - 1; loopIndex++) {
    if (numericalSequence[loopIndex] < 0) {
      resultLines[loopIndex - 1] = rightPointer + " " + numericalSequence[loopIndex];
      rightPointer -= numericalSequence[loopIndex];
    } else {
      resultLines[loopIndex - 1] = leftPointer + " " + numericalSequence[loopIndex];
      leftPointer -= numericalSequence[loopIndex];
    }
  }

  // Add the final operation
  resultLines[resultLines.length - 1] = rightPointer + " " + leftPointer;

  // Display the operations, joined by newlines
  displayOutput(dataTransform(resultLines, 9));
}