let inputReader = require('readline') .createInterface({
  input: process.stdin,
  output: process.stdout
});
let dataHandler; let receivedLines = [];

// Event listener for each line of input
inputReader.on( 'line', function( currentInputLine ) {
  receivedLines.push(currentInputLine);
});

// Event listener when input stream closes
inputReader.on( 'close', function() {
  dataHandler = initializeDataProcessor(receivedLines);
  process.stderr.write('\n'); // Output a newline to error stream

  let commenceTime = Date.now(); // Record start time
  ExecutePrimaryLogic();         // Run the main application logic
  let durationMillis = Date.now() - commenceTime; // Calculate execution duration

  logDiagnostic('execution_time : ' + durationMillis + 'ms');
  logDiagnostic('memory_usage : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

/**
 * Creates a deep copy of an object, handling Sets specifically.
 * @param {object} sourceObj - The object to be cloned.
 * @returns {object} A deep clone of the input object.
 */
function replicateObject( sourceObj ) {
  return (sourceObj instanceof Set) ? new Set(Array.from(sourceObj)) : JSON.parse(JSON.stringify(sourceObj));
}

// Helper functions for retrieving different data types
function retrieveInteger() { return transformValue(fetchNextItem(), 1); }
function retrieveStringArray() { return transformValue(fetchNextItem(), 2); }
function retrieveIntegerArray() { return transformValue(fetchNextItem(), 4); }
function retrieveCharacterArray() { return transformValue(fetchNextItem(), 6); }

// Fetches the next available item from the input data.
function fetchNextItem() { return dataHandler.getNext(); }
// Checks if there are more items to process in the input.
function hasMoreItems() { return dataHandler.checkHasNext(); }

/**
 * Initializes a data processor object for sequential input access.
 * @param {Array<string>} inputData - An array of strings representing input lines.
 * @returns {object} An object with methods to navigate the input data.
 */
function initializeDataProcessor( inputData ) {
  return {
    dataList : inputData,
    currentIdx : 0,
    maximumCount : inputData.length,

    // Determines if there are more elements in the data list.
    checkHasNext : function() {
      return (this.currentIdx < this.maximumCount);
    },

    // Retrieves the next element from the data list and advances the index.
    getNext : function() {
      if (this.checkHasNext()) {
        return this.dataList[this.currentIdx++];
      } else {
        throw 'DataRetrievalError: No further input available';
      }
    }
  };
}

/**
 * Prints a message to the standard output.
 * @param {any} text - The message or data to display.
 */
function displayOutput( text ) {
  console.log(text);
}

/**
 * Logs a debug message to the standard error stream.
 * @param {any} message - The message or data to inspect and log.
 */
function logDiagnostic( message ) {
  console.error('debug_info:' + require('util').inspect(message, false, null));
}

/*
 * This function performs various data type conversions based on the 'conversionType' parameter.
 * Conversion types:
 *   1: Parse as an integer.
 *   2: Split string by spaces into an array of strings.
 *   4: Split string by spaces and convert each part to a number.
 *   6: Split string into an array of individual characters.
 *   7: Split string into characters and convert each to a number.
 *   8: Join array elements with spaces.
 *   9: Join array elements with newlines.
 *   0: Join array elements without any separator.
 *   Default: Return the input value unchanged.
 */
function transformValue( value, conversionType ) {
  try {
    switch (conversionType) {
      case 1:  return parseInt(value);
      case 2:  return value.split(' ');
      case 4:  return value.split(' ').map(Number);
      case 6:  return value.split('');
      case 7:  return value.split('').map(Number);
      case 8:  return value.join(' ');
      case 9:  return value.join('\n');
      case 0:  return value.join('');
      default: return value;
    }
  } catch (err) {
    return value; // In case of conversion error, return original value
  }
}

// Main application logic begins here
function ExecutePrimaryLogic() {
  let sizeVal = retrieveInteger(); // Get the size of the grid
  let inputSequence = retrieveIntegerArray(); // Get the initial sequence of numbers

  // Initialize a square grid for results
  let resultGrid = new Array(sizeVal * sizeVal);

  // Populate initial positions in the result grid
  for (let currentIdx = 0; currentIdx < sizeVal; currentIdx++) {
    resultGrid[inputSequence[currentIdx] - 1] = currentIdx + 1;
  }

  // Fill in remaining cells based on iteration counts
  for (let iterationCount = 2; iterationCount <= sizeVal; iterationCount++) {
    let remainingSlots = iterationCount - 1; // Number of slots to fill with current iteration count

    for (let gridPos = 0; gridPos < sizeVal * sizeVal; gridPos++) {
      if (resultGrid[gridPos] === null) {
        // If the cell is empty, fill it with the current iteration count
        remainingSlots--;
        resultGrid[gridPos] = iterationCount;
        if (remainingSlots === 0) {
          break; // All required slots for this iteration are filled
        }
      } else if (resultGrid[gridPos] === iterationCount) {
        // If the cell already contains the current iteration count, it's an invalid state
        displayOutput("No");
        return; // Exit as the pattern is impossible
      }
    }
  }

  // Prepare an array to manage filler counts for the final pass
  let fillerCounts = new Array(sizeVal);
  for (let idx = 0; idx < sizeVal; idx++) {
    fillerCounts[idx] = sizeVal - idx - 1;
  }

  let currentFillerValue = 1; // Starting value for filling remaining nulls

  // Final pass to fill any remaining null cells
  for (let position = 0; position < sizeVal * sizeVal; position++) {
    if (resultGrid[position] === null) {
      resultGrid[position] = currentFillerValue;
      fillerCounts[0]--; // Decrement count for the current filler value
      if (fillerCounts[0] === 0) {
        fillerCounts.shift(); // Remove the current filler type if exhausted
        currentFillerValue++; // Move to the next filler value
      }
    }
  }

  displayOutput("Yes"); // If all steps complete without issues, output "Yes"
  // Output the final grid as a space-separated string
  displayOutput(transformValue(resultGrid, 8));
}