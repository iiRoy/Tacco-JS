var InputProcessorFactory = (function () {
  /**
   * Initializes a new input reader instance from a given string.
   * @param {string} rawInputContent The raw string data to be parsed.
   * @returns {LineBasedInputReader} A configured input reader object.
   */
  function createInputReader(rawInputContent) {
    return new LineBasedInputReader(rawInputContent);
  }

  /**
   * @class LineBasedInputReader
   * Manages sequential reading of values from a multi-line string input.
   */
  function LineBasedInputReader(sourceText) {
    // Splits the input into individual lines, handling various newline characters, and trims whitespace.
    this._sourceLines = sourceText.trim().split(/\r?\n/);
    // Keeps track of the current line being processed.
    this._currentLineIndex = 0;
    // Stores tokens of the current line, processed in reverse to allow `pop()` for sequential reading.
    this._bufferedLineTokens = [];
  }

  /**
   * Internal helper to conditionally convert a string to a number.
   * @param {string} strValue The string to convert.
   * @param {boolean} preserveString If true, returns the string without conversion.
   * @returns {string|number} The converted number or original string.
   */
  function tryConvertToNumber(strValue, preserveString) {
    return preserveString ? strValue : +strValue;
  }

  /**
   * Retrieves the next single value from the input stream.
   * Values are read from left to right on each line, space-separated.
   * @param {boolean} [returnAsRawString=false] If true, the value is returned as a string; otherwise, it's converted to a number.
   * @returns {string|number} The extracted value.
   * @throws {Error} If attempting to read past the end of the input.
   */
  LineBasedInputReader.prototype.getNextValue = function (returnAsRawString) {
    // If the buffer for the current line is empty, load the next line.
    if (this._bufferedLineTokens.length === 0) {
      if (this._currentLineIndex >= this._sourceLines.length) {
        throw new Error("End of input reached. No more values to read.");
      }
      const activeLine = this._sourceLines[this._currentLineIndex];
      // Split by spaces and reverse to enable efficient `pop()` from the logical beginning of the line.
      this._bufferedLineTokens = activeLine.split(" ").reverse();
      this._currentLineIndex++; // Advance to the next line for subsequent reads.
    }

    const valueToken = this._bufferedLineTokens.pop();
    if (valueToken === undefined) {
      throw new Error("No more tokens on the current line or unexpected empty token.");
    }
    return tryConvertToNumber(valueToken, returnAsRawString);
  };

  /**
   * Reads an entire line and returns its space-separated values.
   * @param {boolean} [returnAsRawStrings=false] If true, values are strings; otherwise, they are numbers.
   * @returns {Array<string|number>} An array of values from the read line.
   * @throws {Error} If no more lines are available.
   */
  LineBasedInputReader.prototype.getLineValues = function (returnAsRawStrings) {
    if (this._currentLineIndex >= this._sourceLines.length) {
      throw new Error("Cannot read line: end of input stream.");
    }
    // Clear any lingering tokens from the previous line if `getNextValue` was used.
    this._bufferedLineTokens = [];
    const fullLineContent = this._sourceLines[this._currentLineIndex++];
    const valuesOnLine = fullLineContent.split(" ");
    return returnAsRawStrings ? valuesOnLine : valuesOnLine.map((val) => +val);
  };

  /**
   * Reads a specified number of lines as a 2D array (matrix).
   * @param {number} countLines The number of lines to read.
   * @param {boolean} [returnAsRawStrings=false] If true, matrix elements are strings; otherwise, numbers.
   * @returns {Array<Array<string|number>>} The parsed matrix.
   * @throws {Error} If not enough lines are available for the requested matrix size.
   */
  LineBasedInputReader.prototype.getMatrixData = function (countLines, returnAsRawStrings) {
    if (this._currentLineIndex + countLines > this._sourceLines.length) {
      throw new Error(`Insufficient lines to form a matrix of ${countLines} rows.`);
    }
    // Clear buffer before reading multiple full lines.
    this._bufferedLineTokens = [];
    const matrixRows = this._sourceLines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += countLines)
    );
    const processedMatrix = matrixRows.map((line) => line.split(" "));
    return returnAsRawStrings
      ? processedMatrix
      : processedMatrix.map((row) => row.map((val) => +val));
  };

  return createInputReader;
})();

/**
 * Generates a multi-dimensional array initialized with a specific value.
 * This function provides a structured way to create nested arrays without using `eval()`.
 * @param {*} initVal The value to populate the innermost elements (e.g., `[]` for empty arrays).
 * @param {...number} dimensions A sequence of integers defining the array's dimensions.
 * @returns {Array} The constructed multi-dimensional array.
 * @throws {Error} If any dimension is not a non-negative integer.
 */
function constructNestedArray(initVal, ...dimensions) {
  if (dimensions.length === 0) {
    // Base case: if no dimensions left, return the initial value.
    // Deep copy if it's an array/object to prevent shared references.
    return Array.isArray(initVal) ? [...initVal] : initVal;
  }

  const currentDimensionSize = dimensions[0];
  if (!Number.isInteger(currentDimensionSize) || currentDimensionSize < 0) {
    throw new Error(`Invalid dimension size: ${currentDimensionSize}. Must be a non-negative integer.`);
  }

  const remainingDimensions = dimensions.slice(1);
  const resultContainer = [];
  for (let i = 0; i < currentDimensionSize; i++) {
    resultContainer.push(constructNestedArray(initVal, ...remainingDimensions));
  }
  return resultContainer;
}

// Instantiate the global input reader using data from standard input.
const inputDataStream = InputProcessorFactory(
  require("fs").readFileSync("/dev/stdin", "utf8")
);

// This array will store the minimum and maximum values for 6 different transformed coordinate axes.
// Each inner array `[min, max]` initially holds an empty array `[]` which will be populated on first use.
const coordinateExtrema = constructNestedArray([], 6);

// A set to accumulate unique candidate offset values that potentially minimize the area.
const areaOffsetsCandidates = new Set([0]); // Always start with 0 as a candidate.

// Execute the primary logic and print the final result.
console.log(calculateMinimumEnclosingArea());

/**
 * The main processing function: reads operations, updates coordinate bounds,
 * generates offset candidates, and finds the smallest possible area.
 * @returns {number} The calculated minimum area.
 */
function calculateMinimumEnclosingArea() {
  const totalOperations = inputDataStream.getNextValue();

  // If there are no operations, the area is considered 0 or undefined based on problem context.
  // Assuming 0 for an empty set of points.
  if (totalOperations <= 0) {
    return 0;
  }

  // Process each incoming coordinate operation.
  for (let opCounter = 0; opCounter < totalOperations; opCounter++) {
    const primaryX = inputDataStream.getNextValue();
    const primaryY = inputDataStream.getNextValue();
    const movementDirection = inputDataStream.getNextValue(true); // Read direction as string.

    // Update the various coordinate extrema based on the movement direction.
    // The indices (0-5) correspond to specific geometric interpretations in the problem.
    switch (movementDirection) {
      case "U": // Up movement
        updateExtremaForIndex(0, primaryY);
        updateExtremaForIndex(5, primaryX);
        break;
      case "R": // Right movement
        updateExtremaForIndex(1, primaryX);
        updateExtremaForIndex(4, primaryY);
        break;
      case "D": // Down movement
        updateExtremaForIndex(2, primaryY);
        updateExtremaForIndex(5, primaryX);
        break;
      case "L": // Left movement
        updateExtremaForIndex(3, primaryX);
        updateExtremaForIndex(4, primaryY);
        break;
      // Default case can be used for error handling or ignored if input is guaranteed valid.
      default:
        // console.warn(`Unrecognized movement direction: ${movementDirection}`);
        break;
    }
  }

  // After processing all operations, derive initial offset candidates from the collected extrema.
  // These specific combinations are critical to the problem's geometric solution.
  generateAndAddOffsets(
    coordinateExtrema[0][1],
    coordinateExtrema[4][1],
    coordinateExtrema[2][1]
  );
  generateAndAddOffsets(
    -coordinateExtrema[2][0],
    -coordinateExtrema[4][0],
    -coordinateExtrema[0][0]
  );
  generateAndAddOffsets(
    coordinateExtrema[1][1],
    coordinateExtrema[5][1],
    coordinateExtrema[3][1]
  );
  generateAndAddOffsets(
    -coordinateExtrema[3][0],
    -coordinateExtrema[5][0],
    -coordinateExtrema[1][0]
  );

  let overallMinArea = Number.MAX_SAFE_INTEGER; // Use a large number for initialization.

  // Iterate through each potential offset to find the smallest bounding area.
  for (const currentOffsetValue of areaOffsetsCandidates) {
    // Calculate the transformed bounds for both X and Y dimensions using the current offset.
    // These formulas are specific to the problem's geometric transformations.
    const transformedYMax = findLargestValue(
      coordinateExtrema[0][1] + currentOffsetValue,
      coordinateExtrema[2][1] - currentOffsetValue,
      coordinateExtrema[4][1]
    );
    const transformedYMin = findSmallestValue(
      coordinateExtrema[0][0] + currentOffsetValue,
      coordinateExtrema[2][0] - currentOffsetValue,
      coordinateExtrema[4][0]
    );
    const transformedXMax = findLargestValue(
      coordinateExtrema[1][1] + currentOffsetValue,
      coordinateExtrema[3][1] - currentOffsetValue,
      coordinateExtrema[5][1]
    );
    const transformedXMin = findSmallestValue(
      coordinateExtrema[1][0] + currentOffsetValue,
      coordinateExtrema[3][0] - currentOffsetValue,
      coordinateExtrema[5][0]
    );

    // Calculate the area for the current set of transformed bounds.
    const currentCalculatedArea =
      (transformedYMax - transformedYMin) * (transformedXMax - transformedXMin);

    // Update the minimum area found so far.
    if (currentCalculatedArea < overallMinArea) {
      overallMinArea = currentCalculatedArea;
    }
  }
  return overallMinArea;
}

/**
 * Updates the minimum and maximum values for a specific coordinate extremum index.
 * If the index has not been initialized, it's set to the provided value.
 * @param {number} idx The index within `coordinateExtrema` to modify (0-5).
 * @param {number} valueToConsider The coordinate value to incorporate into the bounds.
 */
function updateExtremaForIndex(idx, valueToConsider) {
  // Check if the min/max pair for this index has been initialized.
  // `constructNestedArray([], 6)` creates `[[], [], ..., []]`, so `length === 0` indicates uninitialized.
  if (coordinateExtrema[idx].length === 0) {
    // Initialize both min and max with the first encountered value.
    coordinateExtrema[idx][0] = valueToConsider; // Min bound
    coordinateExtrema[idx][1] = valueToConsider; // Max bound
  } else {
    // Update existing min/max bounds using Math.min and Math.max.
    coordinateExtrema[idx][0] = Math.min(coordinateExtrema[idx][0], valueToConsider);
    coordinateExtrema[idx][1] = Math.max(coordinateExtrema[idx][1], valueToConsider);
  }
}

/**
 * Computes and adds new offset candidates to the `areaOffsetsCandidates` set.
 * These calculations are based on specific geometric relationships between coordinate bounds.
 * @param {number} componentA First component for offset derivation.
 * @param {number} componentB Second component for offset derivation.
 * @param {number} componentC Third component for offset derivation.
 */
function generateAndAddOffsets(componentA, componentB, componentC) {
  // The `|| 0` is a safeguard against potential `NaN` results from subtraction/division
  // if `componentA`, `componentB`, `componentC` were non-numeric, ensuring a default of 0.
  // Using Math.ceil and Math.floor to ensure integer offsets, which is common in such problems.
  areaOffsetsCandidates.add(
    Math.max(0, (componentC - componentB) || 0, Math.ceil((componentC - componentA) / 2) || 0)
  );
  areaOffsetsCandidates.add(
    Math.max(0, (componentB - componentA) || 0, Math.floor((componentC - componentA) / 2) || 0)
  );
}

/**
 * Determines the largest value among a dynamic list of numbers.
 * @param {...number} inputValues A spread of numeric arguments.
 * @returns {number} The maximum value, or -Infinity if no valid numbers are provided.
 */
function findLargestValue(...inputValues) {
  // Filter out any non-numeric or NaN values to ensure Math.max operates correctly.
  const numericValues = inputValues.filter(
    (val) => typeof val === "number" && !isNaN(val)
  );
  if (numericValues.length === 0) {
    return -Infinity; // Default for no valid numbers, suitable for max operation.
  }
  return Math.max(...numericValues);
}

/**
 * Determines the smallest value among a dynamic list of numbers.
 * @param {...number} inputValues A spread of numeric arguments.
 * @returns {number} The minimum value, or Infinity if no valid numbers are provided.
 */
function findSmallestValue(...inputValues) {
  // Filter out any non-numeric or NaN values to ensure Math.min operates correctly.
  const numericValues = inputValues.filter(
    (val) => typeof val === "number" && !isNaN(val)
  );
  if (numericValues.length === 0) {
    return Infinity; // Default for no valid numbers, suitable for min operation.
  }
  return Math.min(...numericValues);
}