// This file orchestrates the processing of line-based input to compute a specific metric.
let lineReaderInstance;
let inputDataProcessor;
let accumulatedInputLines = [];

// The input stream setup.
const readlineModule = require('readline');
lineReaderInstance = readlineModule.createInterface({
  input: process.stdin,
  output: process.stdout // Although not used for output here, it's part of the interface.
});

// Accumulate all incoming lines.
lineReaderInstance.on('line', (currentLine) => {
  accumulatedInputLines.push(currentLine);
});

// Once all input has been read (stream ends).
lineReaderInstance.on('close', () => {
  inputDataProcessor = initializeInputHandler(accumulatedInputLines); // Process the accumulated lines.
  console.error('\n--- Input Processing Complete, Executing Logic ---'); // More descriptive error message.
  executeMainApplicationFlow(); // Initiate the main program flow.
});

// Utility function to manage sequential access to processed input lines.
function initializeInputHandler(linesCollection) {
  if (!Array.isArray(linesCollection) || linesCollection.length === 0) {
    // Adding a guard clause for empty input
    console.warn("Warning: No input lines provided. Processing might be affected.");
  }
  return {
    sourceLineItems: linesCollection,
    currentReadIndex: 0,
    totalLineCount: linesCollection.length,

    // Checks if there are more lines to read.
    hasRemainingLines: function() {
      return (this.currentReadIndex < this.totalLineCount);
    },

    // Retrieves the next line from the input collection.
    fetchNextLine: function() {
      if (this.hasRemainingLines()) {
        return this.sourceLineItems[this.currentReadIndex++];
      } else {
        // Updated error message and type
        throw new Error('InputBufferExhausted: Attempted to read past end of input.');
      }
    }
  };
}

// Outputs the final result to standard output.
const sendOutputToConsole = (finalValue) => {
  console.log(finalValue);
};

// Enum-like object for input transformation types.
const InputParsingMethod = {
  TO_INTEGER: 1,
  SPLIT_BY_WHITESPACE: 2,
  SPLIT_AND_CONVERT_TO_NUMBERS: 4,
  BREAK_INTO_CHARACTERS: 6,
  BREAK_CHARS_AND_CONVERT_TO_NUMBERS: 7,
  COMBINE_WITH_SPACES: 8,
  COMBINE_WITH_LINEBREAKS: 9,
  COMBINE_WITHOUT_DELIMITER: 0
};

// Transforms an input string based on a specified type.
function applyInputTransformation(inputString, transformationType) {
  try {
    switch (transformationType) {
      case InputParsingMethod.TO_INTEGER:
        return parseInt(inputString, 10); // Explicit radix for safety
      case InputParsingMethod.SPLIT_BY_WHITESPACE:
        return inputString.split(' ');
      case InputParsingMethod.SPLIT_AND_CONVERT_TO_NUMBERS:
        return inputString.split(' ').map(Number);
      case InputParsingMethod.BREAK_INTO_CHARACTERS:
        return inputString.split('');
      case InputParsingMethod.BREAK_CHARS_AND_CONVERT_TO_NUMBERS:
        return inputString.split('').map(Number);
      case InputParsingMethod.COMBINE_WITH_SPACES:
        return inputString.join(' ');
      case InputParsingMethod.COMBINE_WITH_LINEBREAKS:
        return inputString.join('\n');
      case InputParsingMethod.COMBINE_WITHOUT_DELIMITER:
        return inputString.join('');
      default:
        // For unknown types, return the original string.
        return inputString;
    }
  } catch (processingError) {
    // Log error but return original input to avoid crashing for malformed data
    console.error(`Error during input transformation: ${processingError.message}`);
    return inputString;
  }
}

// Helper to retrieve and parse an integer from the input stream.
const retrieveNextInteger = () => applyInputTransformation(inputDataProcessor.fetchNextLine(), InputParsingMethod.TO_INTEGER);

// Helper to retrieve and split a line into string array.
const retrieveNextStringArray = () => applyInputTransformation(inputDataProcessor.fetchNextLine(), InputParsingMethod.SPLIT_BY_WHITESPACE);

// Helper to retrieve, split, and parse integers from a line.
const retrieveNextIntegerArray = () => applyInputTransformation(inputDataProcessor.fetchNextLine(), InputParsingMethod.SPLIT_AND_CONVERT_TO_NUMBERS);

// Helper to retrieve and split a line into character array.
const retrieveNextCharacterArray = () => applyInputTransformation(inputDataProcessor.fetchNextLine(), InputParsingMethod.BREAK_INTO_CHARACTERS);

// The primary business logic function.
function executeMainApplicationFlow() {
  // Constants for array sizing and value defaults.
  const MAX_EVENT_POINT = 100005; // Represents the maximum possible index for events.
  const BASELINE_OVERLAP_VALUE = 1; // Starting value for tracking maximum overlap.

  // Read the initial parameters from the input.
  const systemParameters = retrieveNextIntegerArray();
  
  // Destructure for clarity, and add a check for array length.
  if (systemParameters.length < 2) {
      throw new Error("Insufficient initial system parameters provided. Expected at least two values.");
  }
  const numberOfEntries = systemParameters[0]; // Corresponds to 'N' in original code
  const operationalCapacity = systemParameters[1]; // Corresponds to 'C' in original code, originally unused

  // Initialize an array to track event counts over a timeline.
  // Using `let` as values will be modified.
  let eventTimelineCounts = new Array(MAX_EVENT_POINT).fill(0);

  // Process 'numberOfEntries' event intervals.
  for (let currentEntryIndex = 0; currentEntryIndex < numberOfEntries; currentEntryIndex++) {
    const activityInterval = retrieveNextIntegerArray(); // Reads [start_time, end_time]
    
    // Basic validation for interval format.
    if (activityInterval.length < 2 || activityInterval[0] > activityInterval[1]) {
        console.warn(`Skipping invalid activity interval entry: [${activityInterval}] at index ${currentEntryIndex}`);
        continue; 
    }

    const intervalStartPoint = activityInterval[0];
    const intervalEndPoint = activityInterval[1];

    // Increment count at the start of the interval.
    eventTimelineCounts[intervalStartPoint]++;
    // Decrement count just after the end of the interval.
    // This technique (difference array) helps in efficiently calculating prefix sums.
    const decrementPoint = intervalEndPoint + 1;
    if (decrementPoint < MAX_EVENT_POINT) { // Ensure we don't go out of bounds
      eventTimelineCounts[decrementPoint]--;
    } else {
        // If decrementPoint is out of bounds, it means the event extends to or beyond the max point.
        // We only care about points within MAX_EVENT_POINT, so no decrement needed beyond it.
        // This is an implicit boundary handling.
    }
  }

  // Calculate the prefix sums to find the actual count at each point in the timeline.
  // Also, track the maximum overlap encountered.
  let peakActivityOverlap = BASELINE_OVERLAP_VALUE; // Start with the default minimum.

  // Iterate from the second point (index 1) to apply prefix sums.
  // The first point (index 0) is typically ignored or handled differently based on problem context.
  // In this case, the original code starts from 1.
  for (let currentTimelinePoint = 1; currentTimelinePoint < MAX_EVENT_POINT; currentTimelinePoint++) {
    eventTimelineCounts[currentTimelinePoint] += eventTimelineCounts[currentTimelinePoint - 1]; // Accumulate counts.
    
    // Update the maximum overlap if the current point's count is higher.
    peakActivityOverlap = Math.max(peakActivityOverlap, eventTimelineCounts[currentTimelinePoint]);

    // Added a simple check using 'operationalCapacity' (original 'C') to demonstrate its use.
    // This is a Type III modification: adding a new fragment/logic.
    if (operationalCapacity > 0 && eventTimelineCounts[currentTimelinePoint] > operationalCapacity * 2.5) { 
        // Example: If concurrency exceeds 2.5 times the capacity, log a warning.
        // This 'C' variable was unused in the original, now it has a purpose.
        // The logic is arbitrary, just to show a usage.
        // console.warn(`High concurrency detected at point ${currentTimelinePoint}: ${eventTimelineCounts[currentTimelinePoint]} (Capacity x2.5: ${operationalCapacity * 2.5})`);
    }
  }

  // Display the computed maximum overlap.
  sendOutputToConsole(peakActivityOverlap);
}