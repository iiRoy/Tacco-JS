// This section handles input processing and should not be modified by the user directly.
const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

let inputSource;
const rawInputLines = [];

// Collect all input lines as they arrive
inputReader.on('line', (currentLine) => { rawInputLines.push(currentLine); });

// Once all input has been received, initialize the processor and execute the main logic
inputReader.on('close', () => {
  inputSource = createInputProcessor(rawInputLines);
  console.error('\n--- Input Processing Complete, Commencing Solution Execution ---');
  executeSolution();
});

// Define a set of constants for various input transformation types
const TRANSFORM_TYPE = Object.freeze({
  AS_INTEGER: 101,
  SPLIT_BY_SPACE_STRINGS: 102,
  SPLIT_BY_SPACE_NUMBERS: 104,
  SPLIT_BY_CHAR_STRINGS: 106,
  SPLIT_BY_CHAR_NUMBERS: 107,
  JOIN_WITH_SPACE: 108,
  JOIN_WITH_NEWLINE: 109,
  JOIN_WITHOUT_DELIMITER: 110,
  DEFAULT: 999
});

/**
 * Constructs an object responsible for managing sequential access to input lines.
 * @param {string[]} sourceData - An array containing all lines of raw input.
 * @returns {object} An interface for consuming input.
 */
function createInputProcessor(sourceData) {
  let currentPosition = 0;
  const totalLines = sourceData.length;

  // Checks if there are more lines to read
  const canAdvance = () => currentPosition < totalLines;

  // Retrieves the next line from the input sequence
  const fetchNextLine = () => {
    if (canAdvance()) {
      return sourceData[currentPosition++];
    } else {
      // Throws a more descriptive error if input is exhausted
      throw new Error('InputBoundaryError: No more input lines available to read.');
    }
  };

  return {
    dataLines: sourceData,
    currentPosition: currentPosition,
    totalLines: totalLines,
    canAdvance: canAdvance,
    fetchNextLine: fetchNextLine
  };
}

/**
 * Applies a specified transformation to an input value.
 * @param {string|string[]} inputValue - The data to be transformed.
 * @param {number} transformType - A constant indicating the desired transformation.
 * @returns {*} The result of the transformation.
 */
function transformInput(inputValue, transformType) {
  try {
    switch (transformType) {
      case TRANSFORM_TYPE.AS_INTEGER:
        // Using `Number()` for type conversion, which handles various string formats.
        return Number(inputValue);
      case TRANSFORM_TYPE.SPLIT_BY_SPACE_STRINGS:
        return String(inputValue).split(' ');
      case TRANSFORM_TYPE.SPLIT_BY_SPACE_NUMBERS:
        return String(inputValue).split(' ').map(Number);
      case TRANSFORM_TYPE.SPLIT_BY_CHAR_STRINGS:
        return String(inputValue).split('');
      case TRANSFORM_TYPE.SPLIT_BY_CHAR_NUMBERS:
        return String(inputValue).split('').map(Number);
      case TRANSFORM_TYPE.JOIN_WITH_SPACE:
        // Ensures `inputValue` is an array before attempting `join`.
        return Array.isArray(inputValue) ? inputValue.join(' ') : String(inputValue);
      case TRANSFORM_TYPE.JOIN_WITH_NEWLINE:
        return Array.isArray(inputValue) ? inputValue.join('\n') : String(inputValue);
      case TRANSFORM_TYPE.JOIN_WITHOUT_DELIMITER:
        return Array.isArray(inputValue) ? inputValue.join('') : String(inputValue);
      case TRANSFORM_TYPE.DEFAULT:
      default:
        // Returns the input value unmodified if no specific transformation is matched.
        return inputValue;
    }
  } catch (error) {
    // Catches and logs transformation errors, returning the original value to prevent crashes.
    console.warn(`Warning: Failed to apply transformation type ${transformType} to '${inputValue}'. Error: ${error.message}`);
    return inputValue;
  }
}

// Utility functions for fetching and transforming specific types of input
const retrieveNumericValue = () => transformInput(advanceInput(), TRANSFORM_TYPE.AS_INTEGER);
const retrieveStringArray = () => transformInput(advanceInput(), TRANSFORM_TYPE.SPLIT_BY_SPACE_STRINGS);
const retrieveNumericArray = () => transformInput(advanceInput(), TRANSFORM_TYPE.SPLIT_BY_SPACE_NUMBERS);
const retrieveCharacterArray = () => transformInput(advanceInput(), TRANSFORM_TYPE.SPLIT_BY_CHAR_STRINGS);

// Core functions for navigating the input stream
const advanceInput = () => inputSource.fetchNextLine();
const hasMoreInput = () => inputSource.canAdvance();

// Function for displaying the final computed result
const displayResult = (finalValue) => { console.log(finalValue); };

// Unused utility functions (makeClone, myerr) from the original code have been removed.

// This section contains the main problem-solving logic.
function executeSolution() {
  const initialParams = retrieveNumericArray();
  const totalEvents = initialParams[0];
  // The second parameter, 'C' (channel capacity), is read but not utilized in the original logic,
  // so it has been intentionally omitted from further processing.

  // Define the maximum time point, using a slightly altered representation for type III change.
  const maxTimePoint = 100000 + 5;

  // Initialize a timeline array to store events (channel starts/ends) at each time point.
  // Each time point object contains two arrays: one for channels starting, one for channels ending.
  const timelineEvents = Array.from({ length: maxTimePoint }, () => ({
    startChannels: [],
    endChannels: []
  }));

  // Populate the timeline with channel start and end events from the input.
  for (let eventIndex = 0; eventIndex < totalEvents; eventIndex++) {
    const eventDetails = retrieveNumericArray();
    // Use array destructuring for clearer access to event components.
    const [startDay, endDay, channelId] = eventDetails;

    // Channels start at `startDay - 1` (0-indexed) and end at `endDay`.
    // This implies the channel is active from `startDay - 1` up to `endDay - 1`,
    // and is removed at the `endDay` time point.
    timelineEvents[startDay - 1].startChannels.push(channelId);
    timelineEvents[endDay].endChannels.push(channelId);
  }

  const activeChannels = new Set(); // Tracks currently active unique channels.
  let peakSimultaneousChannels = 0; // Stores the maximum number of simultaneously active channels.

  // Iterate through each time point to simulate channel activity over time.
  for (let timePoint = 0; timePoint < maxTimePoint; timePoint++) {
    const currentPointEvents = timelineEvents[timePoint];

    // First, process channels that are ending at the current time point.
    // Using a `for...of` loop for concise array iteration.
    for (const channelIdToRemove of currentPointEvents.endChannels) {
      activeChannels.delete(channelIdToRemove);
    }

    // Next, process channels that are starting at the current time point.
    for (const channelIdToAdd of currentPointEvents.startChannels) {
      activeChannels.add(channelIdToAdd);
    }

    // After processing all starts and ends for the current time point,
    // update the peak count if the current number of active channels is higher.
    const currentActiveCount = activeChannels.size; // Intermediate variable for clarity.
    peakSimultaneousChannels = Math.max(peakSimultaneousChannels, currentActiveCount);
  }

  // Output the final calculated peak number of simultaneous channels.
  displayResult(peakSimultaneousChannels);
}