const acquireDataStream = () => {
  // Attempt to read raw data from standard input using file descriptor 0.
  // Explicitly specifying utf8 encoding to handle character sets correctly.
  let rawInputBuffer = require("fs").readFileSync(0, "utf8");

  // Process the raw string: remove leading/trailing whitespace and segment into lines.
  let contentLines = rawInputBuffer.trim().split("\n");

  // Implement a guard clause for empty or malformed input streams.
  if (contentLines.length === 0 || (contentLines.length === 1 && contentLines[0] === '')) {
    console.warn("Input stream appears to be empty or contains only whitespace. Proceeding with an empty sequence.");
    contentLines = []; // Ensure an empty array for predictable iteration.
  }

  // Internal state variables for managing stream progression.
  let currentPosition = 0;
  const elements = contentLines;
  const totalElements = elements.length;

  // Returns an object that acts as a controlled data stream iterator.
  return {
    // Method to extract the subsequent element from the stream.
    // Throws a specific error if the stream has been exhausted.
    retrieveNextToken: function() {
      if (!this.canAdvance()) {
        throw new Error("StreamDepletionError: No further data tokens available for retrieval.");
      }
      const retrievedValue = elements[currentPosition];
      currentPosition++; // Increment the internal index after retrieval.
      return retrievedValue;
    },
    // Method to check if there are additional elements remaining in the stream.
    canAdvance: function() {
      return currentPosition < totalElements;
    },
    // Allows peeking at the next element without altering the stream's position.
    // Returns null if no more elements are present.
    peekNext: function() {
      if (!this.canAdvance()) {
        return null;
      }
      return elements[currentPosition];
    },
    // Provides the initial count of elements loaded into the stream.
    getTotalSize: () => totalElements,
    // Resets the stream's reading position to its initial state.
    resetStream: () => { currentPosition = 0; }
  };
};

// Initialize the primary data stream handler once at the application's start.
const dataStreamHandler = acquireDataStream();

// Simplified global access functions for interacting with the data stream.
// These functions serve as convenient aliases.
function getNextInputToken() { return dataStreamHandler.retrieveNextToken(); }
function hasMoreInput() { return dataStreamHandler.canAdvance(); }

// Functions dedicated to broadcasting operational results and diagnostic messages.
function publishResult(payload) { console.log(payload); } // Designated for standard output.
function logDiagnostic(issue) { console.error(`[DIAGNOSTIC]: ${issue}`); } // Designated for error/diagnostic output.

// A flexible utility function for converting input data based on a specified mode.
// This function replaces 'myconv' with enhanced validation and new transformation options.
const inputDataProcessor = (inputValue, transformationMode) => {
  // Initial validation: ensure input is a string or array for processing.
  if (typeof inputValue !== 'string' && !Array.isArray(inputValue)) {
    logDiagnostic(`Invalid input type for transformation: ${typeof inputValue}. Returning original value.`);
    return inputValue;
  }

  try {
    switch (transformationMode) {
      case 1: // Convert string to a base-10 integer.
        const parsedInt = parseInt(inputValue, 10);
        if (isNaN(parsedInt)) {
          logDiagnostic(`Failed to parse integer from input string: '${inputValue}'.`);
          return null; // Return null to signify a failed conversion.
        }
        return parsedInt;
      case 2: // Divide a string into substrings using space as a delimiter.
        return inputValue.split(" ");
      case 4: // Split string by space, then convert each resulting substring to a number.
        // Filters out any empty strings that might result from multiple spaces.
        return inputValue.split(" ").filter(s => s !== '').map(s => Number(s));
      case 6: // Deconstruct a string into an array of its individual characters.
        return inputValue.split("");
      case 7: // Deconstruct string into characters, then convert each character to a number.
        // Includes a check within the mapping process for robust conversion.
        return inputValue.split("").map(char => {
          const num = Number(char);
          if (isNaN(num)) {
            logDiagnostic(`Character '${char}' could not be numerically interpreted.`);
            return NaN; // Indicate a specific failure for this character.
          }
          return num;
        });
      case 8: // Concatenate array elements into a single string, separated by spaces.
        if (!Array.isArray(inputValue)) throw new Error("Input must be an array for 'join' operation.");
        return inputValue.join(" ");
      case 9: // Concatenate array elements into a single string, separated by newlines.
        if (!Array.isArray(inputValue)) throw new Error("Input must be an array for 'join' operation.");
        return inputValue.join("\n");
      case 0: // Concatenate array elements into a single string without any separator.
        if (!Array.isArray(inputValue)) throw new Error("Input must be an array for 'join' operation.");
        return inputValue.join("");
      case 10: // New transformation case: Convert the input value to its boolean equivalent.
        return !!inputValue;
      default: // If the transformation mode is not recognized, return the input value unmodified.
        logDiagnostic(`Unrecognized transformation mode '${transformationMode}' specified. Returning original input.`);
        return inputValue;
    }
  } catch (processingError) {
    // Catch and log any exceptions that occur during transformation.
    logDiagnostic(`An error occurred during data transformation (mode ${transformationMode}): ${processingError.message}. Returning original input.`);
    return inputValue; // Revert to original input as a fallback.
  }
};

// Initiate the primary application logic.
ExecutePrimaryLogic();

/**
 * The main function encapsulating the core processing logic.
 * This function processes a sequence of numbers based on specific rounding/carry-over rules.
 */
function ExecutePrimaryLogic() {
  // Obtain the first line of input and convert it into an array of numbers.
  // Transformation mode 7 is used: split characters then convert each to a number.
  let numericSequence = inputDataProcessor(getNextInputToken(), 7);

  // Implement a critical guard clause: ensure the sequence is valid and non-empty.
  if (!Array.isArray(numericSequence) || numericSequence.length === 0) {
    logDiagnostic("Processed input yielded an empty or invalid numeric sequence. Terminating main logic.");
    publishResult(0); // Output a default '0' result for an invalid scenario.
    return;
  }

  const sequenceLength = numericSequence.length;
  let accumulatedValue = 0; // The primary variable for summing up processed values.
  // An object to maintain a tally of each unique number's occurrences within the sequence.
  const frequencyMap = {};

  // Iterate through the numeric sequence from the last element to the first.
  // This reverse iteration is fundamental for the "carry-over" calculation methodology.
  for (let currentIdx = sequenceLength - 1; currentIdx >= 0; --currentIdx) {
    const currentNumber = numericSequence[currentIdx];

    // Additional validation within the loop: skip non-numeric or NaN values.
    if (typeof currentNumber !== 'number' || isNaN(currentNumber)) {
      logDiagnostic(`Skipping an invalid numerical entry at index ${currentIdx}: ${currentNumber}`);
      continue; // Move to the next element if the current one is not a valid number.
    }

    // Increment the count for the current number in the frequency map.
    frequencyMap[currentNumber] = (frequencyMap[currentNumber] || 0) + 1;

    // Special diagnostic for the value 10, mirroring a similar check in the original code.
    // The original code had a commented-out decrement, which is preserved here.
    if (currentNumber === 10) {
      logDiagnostic(`Detected a specific value (10) at array position: ${currentIdx}. No direct arithmetic action taken.`);
      // accumulatedValue--; // This action was commented in the original source.
    }

    // The core logic: applies a "rounding up" or "carry" mechanism.
    if (currentNumber >= 5) {
      const differenceToTen = 10 - currentNumber;
      accumulatedValue += differenceToTen; // Add the amount needed to reach 10.
      numericSequence[currentIdx] = 0; // Reset the current element to zero after processing its value.

      // Propagate the carry-over to the preceding element, if it exists.
      if (currentIdx > 0) {
        numericSequence[currentIdx - 1]++; // Increment the value of the element immediately before.
      } else {
        // If this is the very first element and a carry-over occurs,
        // it signifies a carry beyond the highest place value, so increment the total sum.
        accumulatedValue++;
      }
    } else {
      // If the number is less than 5, simply add its face value to the running total.
      accumulatedValue += currentNumber;
    }
  }

  // Output the final calculated value to the standard output channel.
  publishResult(accumulatedValue);

  // Log the comprehensive frequency analysis to the diagnostic channel.
  // Includes a rephrased comment about potential sum discrepancies from the original.
  logDiagnostic(`Final element frequency analysis: ${JSON.stringify(frequencyMap)}. Consideration: The total sum might necessitate an external offset adjustment.`);
}