const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataStream;
const rawInputLines = [];

inputReader.on('line', (lineContent) => {
  rawInputLines.push(lineContent);
});

inputReader.on('close', () => {
  dataStream = initializeDataStream(rawInputLines);
  executeMainLogic(); // Commence program execution
});

/**
 * Utility function for various data type conversions and formatting.
 * Handles parsing strings to numbers, splitting strings into arrays,
 * and joining arrays into strings.
 * @param {any} value - The input value to convert.
 * @param {number} conversionType - An integer code specifying the desired conversion.
 * @returns {any} The converted value or the original value if conversion fails or is not defined.
 */
function dataConverter(value, conversionType) {
  try {
    switch (conversionType) {
      case 1: return parseInt(value, 10);              // Convert to integer (base 10)
      case 2: return value.split(" ");                 // Split string by space into string array
      case 4: return value.split(" ").map(Number);     // Split by space, convert elements to numbers
      case 6: return value.split("");                 // Split string by character into string array
      case 7: return value.split("").map(Number);     // Split by character, convert elements to numbers
      case 8: return value.join(" ");                 // Join array elements with spaces
      case 9: return value.join("\n");                // Join array elements with newlines
      case 0: return value.join("");                 // Join array elements without separator
      default: return value;                          // No specific conversion, return as is
    }
  } catch (error) {
    // If an error occurs during conversion (e.g., calling .split on a non-string),
    // return the original value to prevent crashes.
    return value;
  }
}

/**
 * Creates and returns an object to manage input lines as a stream.
 * Provides methods to check for available input and retrieve the next line.
 * @param {string[]} sourceLines - An array of strings representing the input lines.
 * @returns {object} An object with `hasMore` and `retrieveNext` methods.
 */
function initializeDataStream(sourceLines) {
  let currentIdx = 0;
  const maxIdx = sourceLines.length;

  const streamAccess = {
    // Checks if there are more lines left in the input stream.
    hasMore: () => (currentIdx < maxIdx),
    // Retrieves the next line from the input stream.
    // Throws an error if no more lines are available.
    retrieveNext: () => {
      if (!streamAccess.hasMore()) {
        throw new Error("InputBufferExhausted: Attempted to read past end of input data.");
      }
      const currentLine = sourceLines[currentIdx];
      currentIdx++;
      return currentLine;
    }
  };
  return streamAccess;
}

// Convenient arrow functions for accessing parsed input
const getNextInteger = () => dataConverter(dataStream.retrieveNext(), 1);
const getNextStringArray = () => dataConverter(dataStream.retrieveNext(), 2);
const getNextIntegerArray = () => dataConverter(dataStream.retrieveNext(), 4);
const getNextCharArray = () => dataConverter(dataStream.retrieveNext(), 6);

// Direct input stream accessors
const fetchNextRaw = () => dataStream.retrieveNext();
const hasPendingInput = () => dataStream.hasMore();

// Universal output function
const printResult = (outputContent) => console.log(outputContent);

// --- End of boilerplate setup ---

/**
 * Contains the primary logic to generate a specific sequence based on input parameters.
 * This function reads two integers, M and K, and constructs a sequence
 * that includes all numbers from 0 to 2^M - 1 exactly twice,
 * with specific arrangements depending on K.
 */
function executeMainLogic() {
  const problemParameters = getNextIntegerArray();
  const sequenceLengthExponent = problemParameters[0]; // Represents 'M'
  const forbiddenValue = problemParameters[1];       // Represents 'K'

  // Calculate the total count of unique elements (e.g., if M=3, elements are 0..7, so count is 8)
  const totalElementsCount = 2 ** sequenceLengthExponent;

  // Validate the forbidden value: it must be within the range [0, 2^M - 1]
  if (forbiddenValue < 0 || forbiddenValue >= totalElementsCount) {
    printResult(-1); // Output -1 for invalid K
    return; // Terminate execution for invalid input
  }

  // Handle a specific edge case where M (sequenceLengthExponent) is 1
  if (sequenceLengthExponent === 1) {
    if (forbiddenValue === 0) {
      printResult("0 0 1 1"); // Specific output for M=1, K=0
    } else {
      printResult(-1); // M=1, K=1 is a condition that results in no valid sequence
    }
    return; // Early exit after handling M=1 case
  }

  // Case 1: The forbidden value (K) is 0
  if (forbiddenValue === 0) {
    const constructedSequence = [];
    // The sequence is simply each number from 0 to 2^M-1 repeated twice
    for (let currentElement = 0; currentElement < totalElementsCount; currentElement++) {
      constructedSequence.push(currentElement, currentElement); // Add element twice
    }
    printResult(dataConverter(constructedSequence, 8)); // Format and print
  }
  // Case 2: The forbidden value (K) is not 0
  else {
    // Construct the sequence by assembling several distinct parts
    const initialPair = [forbiddenValue, 0]; // Starts with K and 0

    // Part 1: Numbers from 1 up to (2^M - 1), excluding K
    const ascendingValues = [];
    for (let elementValue = 1; elementValue < totalElementsCount; elementValue++) {
      if (elementValue !== forbiddenValue) {
        ascendingValues.push(elementValue);
      }
    }

    const middleForbiddenValue = [forbiddenValue]; // K is inserted in the middle

    // Part 2: Numbers from (2^M - 1) down to 1, excluding K
    const descendingValues = [];
    for (let elementValue = totalElementsCount - 1; elementValue > 0; elementValue--) {
      if (elementValue !== forbiddenValue) {
        descendingValues.push(elementValue);
      }
    }

    const finalZero = [0]; // Ends with 0

    // Combine all constructed parts using the spread operator for conciseness
    const finalSequence = [
      ...initialPair,
      ...ascendingValues,
      ...middleForbiddenValue,
      ...descendingValues,
      ...finalZero
    ];

    printResult(dataConverter(finalSequence, 8)); // Format and print the complete sequence
  }
}