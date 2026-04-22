/*
 * This section contains initialization and utility functions
 * and can be safely ignored for understanding the core algorithm.
 * Start of supplementary code.
*/
const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataProcessor;
const receivedLines = [];

inputReader.on('line', (dataInput) => {
  receivedLines.push(dataInput);
});

inputReader.on('close', () => {
  dataProcessor = setupInputHandler(receivedLines);
  console.error('\n'); // Emit a newline for console clarity

  const commenceTime = Date.now();
  executePrimaryLogic();
  const elapsedDuration = Date.now() - commenceTime;

  logDebugInfo('execution time : ' + elapsedDuration + ' milliseconds');
  logDebugInfo('memory usage : ' + Math.round(process.memoryUsage().heapTotal / 1024) + ' KB');
});

/**
 * Creates a deep copy of an object, specifically handling Set instances.
 * @param {any} sourceObject The data structure to be cloned deeply.
 * @returns {any} A new, independent copy of the input object.
 */
function deepCopyValue(sourceObject) {
  return (sourceObject instanceof Set)
    ? new Set(Array.from(sourceObject))
    : JSON.parse(JSON.stringify(sourceObject));
}

function retrieveInt() { return performConversion(getNextItem(), 1); }
function retrieveStrArr() { return performConversion(getNextItem(), 2); }
function retrieveIntArr() { return performConversion(getNextItem(), 4); }
function retrieveCharArr() { return performConversion(getNextItem(), 6); }

function getNextItem() { return dataProcessor.next(); }
function hasMoreItems() { return dataProcessor.hasMoreItems(); }

/**
 * Sets up an object responsible for managing sequential access to input lines.
 * @param {Array<string>} inputCollection The array containing all input lines.
 * @returns {object} An object with methods for navigating through the input.
 */
function setupInputHandler(inputCollection) {
  return {
    lineBuffer: inputCollection,
    currentPosition: 0,
    totalLines: inputCollection.length,

    hasMoreItems: function() {
      return (this.currentPosition < this.totalLines);
    },
    next: function() {
      if (this.hasMoreItems()) {
        return this.lineBuffer[this.currentPosition++];
      } else {
        throw new Error('Input exhausted: No more data available for processing.');
      }
    }
  };
}

function displayResult(messageText) {
  console.log(messageText);
}

function logDebugInfo(messageText) {
  console.error('DEBUG_INFO: ' + require('util').inspect(messageText, false, null));
}

/*
 * This auxiliary function handles diverse data type transformations.
 * The 'transformType' parameter dictates the conversion method:
 *  1: Parse as an integer.
 *  2: Split string by space characters.
 *  4: Split by spaces and cast each part to a Number.
 *  6: Split string into an array of single characters.
 *  7: Split by characters and cast each to a Number.
 *  8: Join array elements with spaces in between.
 *  9: Join array elements, separating them with newlines.
 *  0: Join array elements without any separator.
 *  Any other value: Return the item as is.
*/
function performConversion(itemToConvert, transformType) {
  try {
    switch (transformType) {
      case 1:
        return parseInt(itemToConvert, 10);
      case 2:
        return itemToConvert.split(' ');
      case 4:
        return itemToConvert.split(' ').map(Number);
      case 6:
        return itemToConvert.split('');
      case 7:
        return itemToConvert.split('').map(Number);
      case 8:
        return itemToConvert.join(' ');
      case 9:
        return itemToConvert.join('\n');
      case 0:
        return itemToConvert.join('');
      default:
        return itemToConvert;
    }
  } catch (errorObject) {
    return itemToConvert; // If conversion fails, return the original item
  }
}

/*
 * End of supplementary code.
 * This part does not require examination for comprehending the main algorithm.
*/


function executePrimaryLogic() {
  const elementCount = retrieveInt();
  const numCollection = retrieveIntArr();

  let missedElements = 0;
  let expectedValue = 1;

  for (let idx = 0; idx < elementCount; idx++) {
    if (numCollection[idx] === expectedValue) {
      expectedValue++; // Increment expected value as it was found
    } else {
      missedElements++; // Count this element as a mismatch
    }
  }

  // Output the count of missed elements, or -1 if all were missed.
  displayResult((missedElements === elementCount) ? -1 : missedElements);
}