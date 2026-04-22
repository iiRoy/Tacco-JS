let lineInterface = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
let inputController;
let capturedLines = [];

lineInterface.on('line', function(receivedText) {
  capturedLines.push(receivedText);
});

lineInterface.on('close', function() {
  inputController = initializeReader(capturedLines);
  console.error('\n↑ Input Data ↓ Program Output');
  runApplication();
});

/**
 * Creates a deep copy of an object or Set.
 * @param {any} sourceEntity The item to duplicate.
 * @returns {any} A new, independent copy of the source.
 */
function deepCopyEntity(sourceEntity) {
  return (sourceEntity instanceof Set) ? new Set(Array.from(sourceEntity)) : JSON.parse(JSON.stringify(sourceEntity));
}

// Functions to retrieve various data types from the input stream
function readNextInteger() {
  return dataTransformer(advanceAndFetch(), 1);
}

function readNextStringArray() {
  return dataTransformer(advanceAndFetch(), 2);
}

function readNextIntegerArray() {
  return dataTransformer(advanceAndFetch(), 4);
}

function readNextCharacterArray() {
  return dataTransformer(advanceAndFetch(), 6);
}

function advanceAndFetch() {
  return inputController.advanceAndFetch();
}

function hasMoreInput() {
  return inputController.hasMoreInput();
}

/**
 * Sets up an object to manage input lines.
 * @param {string[]} lines The array of raw input lines.
 * @returns {object} An object with methods to navigate input.
 */
function initializeReader(lines) {
  return {
    dataPayload: lines,
    readPosition: 0,
    totalLines: lines.length,
    hasMoreInput: function() {
      return (this.readPosition < this.totalLines);
    },
    advanceAndFetch: function() {
      if (this.hasMoreInput()) {
        return this.dataPayload[this.readPosition++];
      } else {
        throw new Error('InputOutOfBounds: No more lines available for reading.');
      }
    }
  };
}

/**
 * Prints a message to the standard output.
 * @param {string} messageContent The string to display.
 */
function printToConsole(messageContent) {
  console.log(messageContent);
}

/**
 * Logs detailed debug information to the error stream.
 * @param {any} debugData The data to inspect and log.
 */
function logErrorDetails(debugData) {
  console.error('Debug Trace: ' + require('util').inspect(debugData, false, null));
}

/**
 * Converts an input value based on a specified transformation type.
 * @param {string|string[]} itemValue The value to transform.
 * @param {number} transformType Code indicating the conversion method.
 *        1: Parse as integer.
 *        2: Split by space into string array.
 *        4: Split by space, then parse each as number.
 *        6: Split into character array.
 *        7: Split into character array, then parse each as number.
 *        8: Join array elements with spaces.
 *        9: Join array elements with newlines.
 *        0: Join array elements with no separator.
 *        Default: Return input as is.
 * @returns {any} The transformed value.
 */
function dataTransformer(itemValue, transformType) {
  try {
    switch (transformType) {
      case 1:
        return parseInt(itemValue);
      case 2:
        return itemValue.split(' ');
      case 4:
        return itemValue.split(' ').map(Number);
      case 6:
        return itemValue.split('');
      case 7:
        return itemValue.split('').map(Number);
      case 8:
        return itemValue.join(' ');
      case 9:
        return itemValue.join('\n');
      case 0:
        return itemValue.join('');
      default:
        return itemValue;
    }
  } catch (err) {
    return itemValue;
  }
}

/**
 * Main application logic starts here.
 * This function processes the input data to determine maximum concurrent events.
 */
function runApplication() {
  const initialConfig = readNextIntegerArray();
  const recordCount = initialConfig[0];
  const channelCapacity = initialConfig[1];

  const segmentLength = 100005;
  const timeSegments = new Array(segmentLength);

  // Initialize each segment with event lists for arrivals and departures
  for (let segmentIndex = 0; segmentIndex < segmentLength; segmentIndex++) {
    timeSegments[segmentIndex] = {
      arrivals: [],
      departures: []
    };
  }

  // Populate event lists based on input records
  for (let recordIndex = 0; recordIndex < recordCount; recordIndex++) {
    const currentRecord = readNextIntegerArray();
    // Adjust start index for 0-based indexing
    timeSegments[currentRecord[0] - 1].arrivals.push(currentRecord[2]);
    timeSegments[currentRecord[1]].departures.push(currentRecord[2]);
  }

  let activeChannels = new Set();
  let maximumConcurrency = 0;

  // Iterate through each time segment to calculate concurrency
  for (let segmentIndex = 0; segmentIndex < segmentLength; segmentIndex++) {
    // Process departures: remove channels that end at this segment
    for (let eventIndex = 0; eventIndex < timeSegments[segmentIndex].departures.length; eventIndex++) {
      activeChannels.delete(timeSegments[segmentIndex].departures[eventIndex]);
    }

    // Process arrivals: add channels that start at this segment
    for (let eventIndex = 0; eventIndex < timeSegments[segmentIndex].arrivals.length; eventIndex++) {
      activeChannels.add(timeSegments[segmentIndex].arrivals[eventIndex]);
    }

    // Update the maximum concurrency observed so far
    maximumConcurrency = Math.max(maximumConcurrency, activeChannels.size);
  }

  printToConsole(maximumConcurrency);
}