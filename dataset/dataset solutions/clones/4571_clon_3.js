const inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
let inputProcessor;
const rawInputLines = [];

inputHandler.on('line', (currentLine) => {
  rawInputLines.push(currentLine);
});

inputHandler.on('close', () => {
  inputProcessor = initializeInputParser(rawInputLines);
  console.error("\n");
  const startTime = Date.now();
  executeMainCalculation();
  const elapsedTime = Date.now() - startTime;
  logDebugMessage(`Execution time: ${elapsedTime} ms`);
  logDebugMessage(`Memory usage: ${Math.round(process.memoryUsage().heapTotal / 1024)} KB`);
});

/**
 * Sets up an object to manage sequential access to input lines.
 * @param {string[]} sourceData - An array of strings, each representing an input line.
 * @returns {object} An interface for consuming input lines.
 */
function initializeInputParser(sourceData) {
  let currentLineIndex = 0;
  const totalLines = sourceData.length;

  return {
    sourceLines: sourceData,
    hasMoreData: () => currentLineIndex < totalLines,
    fetchNextLine: () => {
      if (currentLineIndex < totalLines) {
        return sourceData[currentLineIndex++];
      } else {
        throw new Error("InputBufferUnderflowException: No more lines available in the input stream.");
      }
    }
  };
}

/**
 * Retrieves and parses the next input line as an integer.
 * @returns {number} The parsed integer value.
 */
const parseInteger = () => convertInputFormat(retrieveNextInput(), 1);

/**
 * Retrieves and parses the next input line into an array of strings, split by spaces.
 * @returns {string[]} An array of string tokens.
 */
const parseStringArray = () => convertInputFormat(retrieveNextInput(), 2);

/**
 * Retrieves and parses the next input line into an array of integers, split by spaces.
 * @returns {number[]} An array of integer values.
 */
const parseIntegerArray = () => convertInputFormat(retrieveNextInput(), 4);

/**
 * Retrieves and parses the next input line into an array of single characters.
 * @returns {string[]} An array of character strings.
 */
const parseCharacterArray = () => convertInputFormat(retrieveNextInput(), 6);

/**
 * Fetches the next raw line from the global input processor.
 * @returns {string} The next available input line.
 */
const retrieveNextInput = () => inputProcessor.fetchNextLine();

/**
 * Checks if there are any remaining input lines to be processed.
 * @returns {boolean} True if more input exists, false otherwise.
 */
const checkInputAvailability = () => inputProcessor.hasMoreData();

/**
 * Outputs the final computed result to the console.
 * @param {*} data - The data to be displayed.
 */
function displayResult(data) {
  console.log(data);
}

/**
 * Logs detailed debug messages to the standard error stream.
 * @param {*} message - The message or object to debug.
 */
function logDebugMessage(message) {
  console.error(`DEBUG_INFO: ${require("util").inspect(message, { showHidden: false, depth: null })}`);
}

/**
 * Finds the minimum and maximum values within a numeric array.
 * @param {number[]} values - An array of numbers.
 * @returns {{min: number, max: number}} An object containing the smallest and largest values.
 * @throws {Error} If the input is not a non-empty array.
 */
function findMinMax(values) {
    if (!Array.isArray(values) || values.length === 0) {
        throw new Error("Input for findMinMax must be a non-empty array of numbers.");
    }
    let minValue = values[0];
    let maxValue = values[0];
    for (let k = 1; k < values.length; k++) {
        if (values[k] < minValue) {
            minValue = values[k];
        }
        if (values[k] > maxValue) {
            maxValue = values[k];
        }
    }
    return { min: minValue, max: maxValue };
}

/**
 * Converts a given input value based on a specified conversion type.
 * @param {string | string[]} inputValue - The value to convert.
 * @param {number} conversionType - An integer code dictating the conversion logic:
 *   1: Parse as integer.
 *   2: Split string by space.
 *   4: Split string by space and convert parts to numbers.
 *   6: Split string into individual characters.
 *   7: Split string into characters and convert to numbers.
 *   8: Join array elements with spaces.
 *   9: Join array elements with newlines.
 *   0: Join array elements without any separator.
 * @returns {*} The converted value.
 */
function convertInputFormat(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue, 10);
      case 2:
        return String(inputValue).split(" ");
      case 4:
        return String(inputValue).split(" ").map(Number);
      case 6:
        return String(inputValue).split("");
      case 7:
        return String(inputValue).split("").map(Number);
      case 8:
        if (Array.isArray(inputValue)) return inputValue.join(" ");
        throw new TypeError("Input for conversion type 8 must be an array.");
      case 9:
        if (Array.isArray(inputValue)) return inputValue.join("\n");
        throw new TypeError("Input for conversion type 9 must be an array.");
      case 0:
        if (Array.isArray(inputValue)) return inputValue.join("");
        throw new TypeError("Input for conversion type 0 must be an array.");
      default:
        return inputValue;
    }
  } catch (error) {
    logDebugMessage(`Conversion failure for value '${inputValue}' (type ${conversionType}): ${error.message}`);
    return inputValue;
  }
}

/**
 * Computes the minimum difference between the largest and smallest areas when a rectangle
 * of dimensions (height, width) is divided into three sub-rectangles.
 * It explores two main splitting strategies for a given orientation.
 *
 * @param {number} height - The height dimension of the rectangle.
 * @param {number} width - The width dimension of the rectangle.
 * @returns {number} The smallest area difference found for this specific height-width orientation.
 */
function calculateMinAreaDifferenceForOrientation(height, width) {
  let currentMinDiff = Infinity;

  // A rectangle needs at least 3 units in one dimension to be split into three parts.
  if (height < 3) {
      return Infinity;
  }

  // Iterate through all possible first horizontal cut points.
  // The first cut divides the height into `splitIdx` and `height - splitIdx`.
  for (let splitIdx = 1; splitIdx <= height - 2; splitIdx++) {
    // Strategy A: First horizontal cut, then the remaining larger piece is cut horizontally again.
    // This results in three horizontal strips.
    const section1Height = splitIdx;
    const remainingHeight = height - section1Height;
    const section2Height = Math.floor(remainingHeight / 2);
    const section3Height = Math.ceil(remainingHeight / 2);

    const areasFromVerticalSlices = [
      section1Height * width,
      section2Height * width,
      section3Height * width
    ];
    const { min: minAreaVertical, max: maxAreaVertical } = findMinMax(areasFromVerticalSlices);
    currentMinDiff = Math.min(currentMinDiff, maxAreaVertical - minAreaVertical);

    // Strategy B: First horizontal cut, then the remaining larger piece is cut vertically.
    // This results in one horizontal strip and two vertical strips.
    const horizontalStripArea = section1Height * width;
    const remainingAreaHeight = height - section1Height;

    // Split the width of the remaining piece.
    const verticalSplitWidth1 = Math.floor(width / 2);
    const verticalSplitWidth2 = Math.ceil(width / 2);

    const verticalStripArea1 = remainingAreaHeight * verticalSplitWidth1;
    const verticalStripArea2 = remainingAreaHeight * verticalSplitWidth2;

    const areasFromHorizontalSlices = [
      horizontalStripArea,
      verticalStripArea1,
      verticalStripArea2
    ];
    const { min: minAreaHorizontal, max: maxAreaHorizontal } = findMinMax(areasFromHorizontalSlices);
    currentMinDiff = Math.min(currentMinDiff, maxAreaHorizontal - minAreaHorizontal);
  }
  return currentMinDiff;
}

/**
 * The primary function that orchestrates the area difference calculation.
 * It reads the initial dimensions, applies the calculation for both orientations (H x W and W x H),
 * and prints the overall minimum difference.
 */
function executeMainCalculation() {
  const dimensionsInput = parseIntegerArray();

  if (dimensionsInput.length < 2 || !Number.isInteger(dimensionsInput[0]) || !Number.isInteger(dimensionsInput[1]) || dimensionsInput[0] <= 0 || dimensionsInput[1] <= 0) {
      logDebugMessage("Invalid input dimensions. Expected two positive integers.");
      displayResult("Error: Invalid dimensions provided.");
      return;
  }

  let heightValue = dimensionsInput[0];
  let widthValue = dimensionsInput[1];

  let minimumOverallDifference = Infinity;

  // Calculate for the original orientation (H, W)
  minimumOverallDifference = Math.min(minimumOverallDifference, calculateMinAreaDifferenceForOrientation(heightValue, widthValue));

  // Calculate for the swapped orientation (W, H), effectively rotating the rectangle
  const tempHeight = heightValue;
  heightValue = widthValue;
  widthValue = tempHeight;

  minimumOverallDifference = Math.min(minimumOverallDifference, calculateMinAreaDifferenceForOrientation(heightValue, widthValue));

  displayResult(minimumOverallDifference);
}