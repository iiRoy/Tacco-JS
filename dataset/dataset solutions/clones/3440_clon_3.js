const fileSystem = require("fs");

// Constants for input processing modes
const INPUT_MODE = {
  IDENTITY: 0,
  PARSE_INTEGER: 1,
  SPLIT_BY_SPACE: 2,
  SPLIT_BY_NEWLINE: 3,
  SPLIT_SPACE_TO_NUMBERS: 4,
  SPLIT_NEWLINE_TO_NUMBERS: 5,
  SPLIT_TO_CHAR_ARRAY: 6,
  SPLIT_CHARS_TO_NUMBERS: 7,
};

// Delimiters for string splitting
const DELIMITERS = {
  SPACE: " ",
  NEWLINE: "\n",
  EMPTY: "",
};

/**
 * Safely reads raw input data from a specified source.
 * @returns {string | null} The trimmed input string, or null if an error occurs.
 */
function acquireSourceData() {
  try {
    // Attempt to read from standard input
    const rawData = fileSystem.readFileSync("/dev/stdin", "utf8");
    return rawData.trim();
  } catch (readError) {
    // Log any errors encountered during file reading
    console.error("Error reading input data:", readError.message);
    return null;
  }
}

/**
 * Displays processed results to standard output.
 * @param {*} content The data to be logged.
 */
function emitProcessedOutput(content) {
  console.log(content);
}

/**
 * Transforms a raw string based on a specified processing mode.
 * Implemented using a map for extensibility and clarity over a switch.
 * @param {string} sourceString The input string to transform.
 * @param {number} conversionMode The numeric mode indicating the desired transformation.
 * @returns {*} The transformed data.
 * @throws {Error} If an unsupported conversion mode is provided.
 */
function processInputString(sourceString, conversionMode) {
  // Ensure sourceString is a string before proceeding
  if (typeof sourceString !== "string") {
    console.warn("Input for transformation is not a string. Attempting conversion:", sourceString);
    sourceString = String(sourceString); // Coerce to string
  }

  // Map of conversion functions
  const conversionHandlers = {
    [INPUT_MODE.IDENTITY]: (s) => s,
    [INPUT_MODE.PARSE_INTEGER]: (s) => parseInt(s, 10),
    [INPUT_MODE.SPLIT_BY_SPACE]: (s) => s.split(DELIMITERS.SPACE),
    [INPUT_MODE.SPLIT_BY_NEWLINE]: (s) => s.split(DELIMITERS.NEWLINE),
    [INPUT_MODE.SPLIT_SPACE_TO_NUMBERS]: (s) => s.split(DELIMITERS.SPACE).map(Number),
    [INPUT_MODE.SPLIT_NEWLINE_TO_NUMBERS]: (s) => s.split(DELIMITERS.NEWLINE).map(Number),
    [INPUT_MODE.SPLIT_TO_CHAR_ARRAY]: (s) => s.split(DELIMITERS.EMPTY),
    [INPUT_MODE.SPLIT_CHARS_TO_NUMBERS]: (s) => s.split(DELIMITERS.EMPTY).map(Number),
  };

  const handler = conversionHandlers[conversionMode];
  if (handler) {
    return handler(sourceString);
  } else {
    // Fallback for unsupported modes, could throw an error instead
    console.error(`Unsupported conversion mode: ${conversionMode}. Returning original string.`);
    return sourceString;
  }
}

/**
 * Calculates the arithmetic mean (average) of an array of numbers.
 * Handles empty arrays by returning 0 to prevent division by zero.
 * @param {number[]} numericArray An array of numbers.
 * @returns {number} The average of the numbers, or 0 if the array is empty.
 */
function calculateArrayAverage(numericArray) {
  if (!Array.isArray(numericArray) || numericArray.length === 0) {
    // Guard clause for empty or invalid arrays
    return 0;
  }
  // Use reduce for efficient summation
  const totalSum = numericArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  return totalSum / numericArray.length;
}

/**
 * The main execution flow of the program.
 * Reads input, processes it, performs calculations, and outputs the result.
 * @param {string | null} programInput The raw input string from the source.
 */
function executeCoreLogic(programInput) {
  // Input validation: ensure programInput is available
  if (programInput === null || programInput.length === 0) {
    emitProcessedOutput("-1"); // Indicate an error or no valid input
    return;
  }

  // Step 1: Split the entire input by newlines
  const inputLines = processInputString(programInput, INPUT_MODE.SPLIT_BY_NEWLINE);

  // Validate that we have at least two lines for N and the list
  if (inputLines.length < 2) {
    emitProcessedOutput("-1"); // Not enough input lines
    return;
  }

  // Step 2: Parse the first line to get N (total items count)
  const totalItems = processInputString(inputLines[0], INPUT_MODE.PARSE_INTEGER);

  // Step 3: Parse the second line to get the list of numbers
  const dataPoints = processInputString(inputLines[1], INPUT_MODE.SPLIT_SPACE_TO_NUMBERS);

  // Additional validation: Check if N matches the actual number of data points
  if (totalItems !== dataPoints.length) {
    console.warn(`Warning: Declared item count (${totalItems}) does not match actual data points (${dataPoints.length}). Using actual count.`);
    // Optionally, you could exit or use the declared count if it's a strict requirement.
    // For this clone, we'll proceed with the actual length of dataPoints.
    // Or, if totalItems is critical, we could enforce it:
    // dataPoints.splice(totalItems); // Truncate if too many
  }

  // Handle case where dataPoints is empty after parsing
  if (dataPoints.length === 0) {
    emitProcessedOutput("-1"); // No data points to process
    return;
  }

  // Step 4: Calculate the average of the data points
  const calculatedMean = calculateArrayAverage(dataPoints);

  // Step 5: Find the index of the element closest to the average
  let smallestDeviation = Infinity;
  let closestElementIndex = -1; // Initialize with an invalid index

  // Iterate through the data points
  for (let k = 0; k < dataPoints.length; ++k) {
    const currentValue = dataPoints[k];
    const currentDeviation = Math.abs(currentValue - calculatedMean);

    // If a smaller deviation is found, update the closest element and its index
    if (currentDeviation < smallestDeviation) {
      smallestDeviation = currentDeviation;
      closestElementIndex = k;
    }
  }

  // Step 6: Output the result
  emitProcessedOutput(closestElementIndex);
}

// Entry point: acquire data and execute the main logic
executeCoreLogic(acquireSourceData());