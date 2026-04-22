const stdlib_readline = require('readline');
const stdlib_util = require('util');

let inputReader;
let dataHandlerInstance;
const rawInputLinesBuffer = [];

/**
 * Custom logger for debug messages.
 * Uses console.error to distinguish from normal output and provides detailed object inspection.
 * @param {*} message - The content to log, can be any data type.
 */
function logDebugMessage(message) {
  console.error(`[DEBUG]: ${stdlib_util.inspect(message, { showHidden: false, depth: null, colors: true })}`);
}

/**
 * Displays the final computed result to standard output.
 * @param {*} content - The data to be displayed.
 */
function displayResult(content) {
  console.log(content);
}

// Set up the input interface to read from standard input and write to standard output.
inputReader = stdlib_readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Event listener for each line of input received, pushing it to a buffer.
inputReader.on('line', (currentLine) => {
  rawInputLinesBuffer.push(currentLine);
});

// Event listener for when the input stream closes, triggering the main processing logic.
inputReader.on('close', () => {
  if (rawInputLinesBuffer.length === 0) {
    logDebugMessage("Warning: No input lines were provided. Program might not behave as expected without input.");
    // For this specific problem, an empty input means no intervals, so an output of 0 is appropriate.
    displayResult(0);
    return; // Exit early if no input.
  }

  dataHandlerInstance = configureInputProcessor(rawInputLinesBuffer);

  logDebugMessage("--- Application Execution Initiated ---");
  const startTime = new Date(); // Capture the precise start time.

  executeCoreLogic(); // Invoke the central algorithm.

  const endTime = new Date(); // Capture the precise end time.
  const durationMilliseconds = endTime.getTime() - startTime.getTime();

  logDebugMessage("--- Application Execution Concluded ---");
  logDebugMessage(`Total processing time: ${durationMilliseconds} ms`);
  // Memory usage logging omitted as a Type III modification (deletion of non-essential diagnostic output).
});

// --- Input Processing Utility Functions ---

/**
 * Retrieves the next available input line and attempts to parse it as an integer.
 * Includes robust error handling for non-numeric input.
 * @returns {number} The parsed integer value.
 */
function retrieveInteger() {
  return parseAndTransform(getNextInputLine(), CONVERSION_TYPES.TO_INTEGER);
}

/**
 * Fetches the next input line and tokenizes it into an array of strings using space as a delimiter.
 * @returns {string[]} An array of string tokens.
 */
function fetchStringArray() {
  return parseAndTransform(getNextInputLine(), CONVERSION_TYPES.SPLIT_BY_SPACE);
}

/**
 * Fetches the next input line, tokenizes it by spaces, and converts each token to a number.
 * Non-numeric tokens are preserved as strings.
 * @returns {Array<number|string>} An array of numbers and/or strings.
 */
function fetchIntegerArray() {
  return parseAndTransform(getNextInputLine(), CONVERSION_TYPES.SPLIT_AND_MAP_TO_NUMBERS);
}

/**
 * Fetches the next input line and breaks it down into an array of individual characters.
 * @returns {string[]} An array where each element is a single character.
 */
function fetchCharacterArray() {
  return parseAndTransform(getNextInputLine(), CONVERSION_TYPES.SPLIT_TO_CHARS);
}

/**
 * Delegates to the data handler instance to get the subsequent input line.
 * @returns {string} The next raw input line.
 */
function getNextInputLine() {
  return dataHandlerInstance.obtainNextElement();
}

/**
 * Delegates to the data handler instance to check for the availability of more input.
 * @returns {boolean} True if more input lines are present, false otherwise.
 */
function hasMoreInput() {
  return dataHandlerInstance.checkAvailability();
}

// --- Input Data Handler Class and Type Conversion Constants ---

/**
 * Enumeration of various data conversion and transformation types.
 * Using descriptive constants enhances readability and maintainability.
 */
const CONVERSION_TYPES = Object.freeze({
  TO_INTEGER: 1,
  SPLIT_BY_SPACE: 2,
  SPLIT_AND_MAP_TO_NUMBERS: 4,
  SPLIT_TO_CHARS: 6,
  SPLIT_TO_CHARS_AND_MAP_TO_NUMBERS: 7,
  JOIN_WITH_SPACE: 8,
  JOIN_WITH_NEWLINE: 9,
  JOIN_WITHOUT_SEPARATOR: 0,
  DEFAULT_NO_CONVERSION: -1
});

/**
 * A class designed to manage the sequential access of input lines.
 * This replaces the original object literal with a more structured class (Type III modification).
 */
class InputDataProcessor {
  /**
   * Initializes the processor with an array of input lines.
   * @param {string[]} sourceLines - An array containing all raw input strings.
   * @throws {Error} If `sourceLines` is not an array.
   */
  constructor(sourceLines) {
    if (!Array.isArray(sourceLines)) {
      throw new Error("InputDataProcessor: Provided source lines must be an array.");
    }
    this.inputBuffer = sourceLines;
    this.currentPosition = 0;
    this.totalLines = sourceLines.length;
  }

  /**
   * Verifies if there are additional input lines remaining to be processed.
   * @returns {boolean} Returns true if `currentPosition` is less than `totalLines`.
   */
  checkAvailability() {
    return this.currentPosition < this.totalLines;
  }

  /**
   * Retrieves the next input line from the buffer and advances the position.
   * @returns {string} The next input line.
   * @throws {Error} If an attempt is made to read beyond the end of the input buffer.
   */
  obtainNextElement() {
    if (!this.checkAvailability()) {
      throw new Error("Input Buffer Exhausted: Attempted to read past the end of available input data.");
    }
    const element = this.inputBuffer[this.currentPosition];
    this.currentPosition++;
    return element;
  }
}

/**
 * Factory function to create and return an instance of `InputDataProcessor`.
 * @param {string[]} inputData - Raw input lines.
 * @returns {InputDataProcessor} A new input processor instance.
 */
function configureInputProcessor(inputData) {
  return new InputDataProcessor(inputData);
}

/**
 * Performs various conversions and transformations on input data based on a specified type.
 * Enhanced with more explicit type checking and error handling (Type III modification).
 * @param {string|string[]} inputData - The value to be converted or transformed.
 * @param {number} conversionType - A constant from `CONVERSION_TYPES` dictating the transformation.
 * @returns {*} The result of the conversion, or the original input if an error occurs or type is unknown.
 */
function parseAndTransform(inputData, conversionType) {
  try {
    switch (conversionType) {
      case CONVERSION_TYPES.TO_INTEGER:
        const potentialInteger = parseInt(String(inputData), 10);
        return isNaN(potentialInteger) ? inputData : potentialInteger; // Return original if not a valid number.
      case CONVERSION_TYPES.SPLIT_BY_SPACE:
        return String(inputData).split(" ");
      case CONVERSION_TYPES.SPLIT_AND_MAP_TO_NUMBERS:
        return String(inputData).split(" ").map(segment => {
          const numValue = Number(segment);
          return isNaN(numValue) ? segment : numValue; // Preserve non-numeric segments.
        });
      case CONVERSION_TYPES.SPLIT_TO_CHARS:
        return String(inputData).split("");
      case CONVERSION_TYPES.SPLIT_TO_CHARS_AND_MAP_TO_NUMBERS:
        return String(inputData).split("").map(charSegment => {
          const charNumValue = Number(charSegment);
          return isNaN(charNumValue) ? charSegment : charNumValue;
        });
      case CONVERSION_TYPES.JOIN_WITH_SPACE:
        return Array.isArray(inputData) ? inputData.join(" ") : inputData;
      case CONVERSION_TYPES.JOIN_WITH_NEWLINE:
        return Array.isArray(inputData) ? inputData.join("\n") : inputData;
      case CONVERSION_TYPES.JOIN_WITHOUT_SEPARATOR:
        return Array.isArray(inputData) ? inputData.join("") : inputData;
      case CONVERSION_TYPES.DEFAULT_NO_CONVERSION:
      default:
        logDebugMessage(`Warning: Encountered an unhandled or default conversion type (${conversionType}) for input: ${inputData}`);
        return inputData;
    }
  } catch (error) {
    logDebugMessage(`Error during data transformation for value "${inputData}" with type "${conversionType}": ${error.message}`);
    return inputData; // Return the original input on error to prevent program termination.
  }
}

/**
 * This is the core application logic, responsible for calculating the length of the
 * intersection between two integer intervals.
 * It reads four integer coordinates, then uses a frequency array approach to determine overlap.
 */
function executeCoreLogic() {
  // Retrieve the four boundary coordinates for the two intervals from input.
  const intervalCoordinates = fetchIntegerArray();

  // Robust input validation: Ensure exactly four valid numbers are provided.
  if (intervalCoordinates.length !== 4 || intervalCoordinates.some(coord => typeof coord !== 'number' || isNaN(coord))) {
    logDebugMessage("Error: Invalid input format. Expected exactly four numeric interval coordinates.");
    displayResult(0); // For invalid input, an intersection length of 0 is a safe default.
    return;
  }

  // Destructure and rename variables for improved readability and context.
  let intervalOneStart = intervalCoordinates[0];
  let intervalOneEnd = intervalCoordinates[1];
  let intervalTwoStart = intervalCoordinates[2];
  let intervalTwoEnd = intervalCoordinates[3];

  // Guard clauses: Ensure that each interval's start is not greater than its end.
  // If inverted, swap the values to maintain a valid interval (Type III modification).
  if (intervalOneStart > intervalOneEnd) {
    logDebugMessage(`Adjusting interval 1: Start (${intervalOneStart}) was greater than end (${intervalOneEnd}). Swapping values.`);
    [intervalOneStart, intervalOneEnd] = [intervalOneEnd, intervalOneStart];
  }
  if (intervalTwoStart > intervalTwoEnd) {
    logDebugMessage(`Adjusting interval 2: Start (${intervalTwoStart}) was greater than end (${intervalTwoEnd}). Swapping values.`);
    [intervalTwoStart, intervalTwoEnd] = [intervalTwoEnd, intervalTwoStart];
  }

  // Define constants for the coordinate range, based on common problem constraints (e.g., 0-100).
  const MIN_ALLOWED_COORDINATE = 0;
  const MAX_ALLOWED_COORDINATE = 100; // Array size 101 implies indices 0-100.

  // Initialize a frequency array to track how many intervals cover each point.
  // Using Array.from for an alternative array initialization (Type III modification).
  const pointCoverageCounter = Array.from({ length: MAX_ALLOWED_COORDINATE + 1 }, () => 0);

  // Increment counters for all points within the first interval.
  // Clamp interval boundaries to the allowed coordinate range (Type III addition for robustness).
  for (let currentPoint = Math.max(MIN_ALLOWED_COORDINATE, intervalOneStart);
       currentPoint <= Math.min(MAX_ALLOWED_COORDINATE, intervalOneEnd);
       currentPoint++) {
    pointCoverageCounter[currentPoint]++;
  }

  // Increment counters for all points within the second interval.
  // Clamp interval boundaries to the allowed coordinate range.
  for (let currentPoint = Math.max(MIN_ALLOWED_COORDINATE, intervalTwoStart);
       currentPoint <= Math.min(MAX_ALLOWED_COORDINATE, intervalTwoEnd);
       currentPoint++) {
    pointCoverageCounter[currentPoint]++;
  }

  let overlappingPointsCount = 0; // Accumulator for points covered by both intervals.

  // Iterate through the entire possible range of coordinates to find overlaps.
  for (let coordinateIndex = MIN_ALLOWED_COORDINATE; coordinateIndex <= MAX_ALLOWED_COORDINATE; coordinateIndex++) {
    // A point is part of the intersection if it's covered by both intervals (count is 2).
    if (pointCoverageCounter[coordinateIndex] === 2) {
      overlappingPointsCount++;
    }
  }

  // Calculate the length of the intersection.
  // If `overlappingPointsCount` is N, the length is N-1 (e.g., points 5,6,7 means length 2).
  // Math.max ensures the length is never negative (e.g., 0 or 1 overlapping points yields length 0).
  const computedIntersectionLength = Math.max(overlappingPointsCount - 1, 0);

  // Output the final calculated length.
  displayResult(computedIntersectionLength);
}