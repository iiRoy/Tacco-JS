// A class designed to robustly handle sequential reading of structured input data,
// typically sourced from a multi-line string. It manages the current position
// within the input and provides methods for extracting various data formats.
function DataStreamProcessor(rawInputContent) {
  // Validate that the provided input content is a string. If not,
  // initialize with an empty array to prevent runtime errors.
  if (typeof rawInputContent !== 'string' || rawInputContent === null) {
    console.warn("Input content for DataStreamProcessor was not a valid string. Initializing with empty data.");
    this.sourceLines = [""]; // Ensure there's at least one empty line to prevent index issues.
  } else {
    // Split the entire input string by newline characters to get an array of lines.
    this.sourceLines = rawInputContent.split("\n");
  }
  // Initialize a pointer to keep track of the current line being processed.
  this.currentLinePointer = 0;
}

// Define the methods for the DataStreamProcessor class on its prototype.
DataStreamProcessor.prototype = {
  /**
   * Extracts a single token (either a number or a string) from the current line,
   * processing tokens from right to left, and then advances the internal line pointer
   * if the current line is exhausted.
   * @param {boolean} returnAsString - If true, the token is returned as a string;
   *                                   otherwise, it attempts to convert it to a number.
   * @returns {string|number} The extracted token. Returns an empty string or NaN if no valid token.
   */
  extractRightmostToken: function(returnAsString) {
    const allInputLines = this.sourceLines;
    const currentLineIdx = this.currentLinePointer;

    // Check if the current line index is out of bounds or the line content is invalid.
    if (currentLineIdx >= allInputLines.length || typeof allInputLines[currentLineIdx] !== "string" && !Array.isArray(allInputLines[currentLineIdx])) {
      console.warn("Attempted to extract token beyond end of input or from invalid line content.");
      this.currentLinePointer++; // Advance pointer defensively.
      return returnAsString ? "" : NaN;
    }

    // If the current line hasn't been split into tokens yet, do so and reverse for right-to-left processing.
    // This also handles cases where a line might have been accessed via `fetchNextLineTokens` and then
    // `extractRightmostToken` is called on the same line.
    if (!Array.isArray(allInputLines[currentLineIdx])) {
      allInputLines[currentLineIdx] = allInputLines[currentLineIdx].split(" ").reverse();
    }

    // Pop the last element (which is the rightmost token after reversal).
    let extractedValue = allInputLines[currentLineIdx].pop();

    // If the line is now empty after popping, advance to the next line.
    if (allInputLines[currentLineIdx].length === 0) {
      this.currentLinePointer++;
    }

    // Return the value, converting to a number unless explicitly requested as a string.
    return returnAsString ? extractedValue : Number(extractedValue);
  },

  /**
   * Reads and processes an entire line of tokens from the current position.
   * @param {boolean} keepTokensAsStrings - If true, tokens are returned as strings;
   *                                        otherwise, they are converted to numbers.
   * @returns {Array<string|number>} An array of tokens from the line. Returns an empty array if no line.
   */
  fetchNextLineTokens: function(keepTokensAsStrings) {
    // Ensure the current line pointer is within the bounds of the source lines.
    if (this.currentLinePointer >= this.sourceLines.length) {
      console.warn("Attempted to fetch line tokens beyond the end of the input stream.");
      return []; // Return an empty array indicating no more lines.
    }

    // Get the content of the current line and then immediately advance the pointer.
    const lineContent = this.sourceLines[this.currentLinePointer];
    this.currentLinePointer++;

    let tokensArray;
    // If the line content is already an array (e.g., from `extractRightmostToken`),
    // reverse it to restore original order.
    if (Array.isArray(lineContent)) {
      tokensArray = lineContent.reverse();
    } else if (typeof lineContent === 'string') {
      // Otherwise, split the string into tokens.
      tokensArray = lineContent.split(" ");
    } else {
      // Fallback for unexpected line content type.
      console.warn("Encountered unexpected line content type:", typeof lineContent);
      tokensArray = [];
    }

    // If numbers are required, map all tokens to their numeric representation.
    if (!keepTokensAsStrings) {
      return tokensArray.map(token => Number(token));
    }
    return tokensArray;
  },

  /**
   * Reads a specified number of consecutive lines and organizes them into a 2D array (matrix).
   * @param {number} numLinesToFetch - The total number of lines to read.
   * @param {boolean} preserveStringFormat - If true, inner arrays contain strings;
   *                                         otherwise, all elements are converted to numbers.
   * @returns {Array<Array<string|number>>} A 2D array representing the fetched lines.
   *                                         Returns an empty array if numLinesToFetch is invalid.
   */
  acquireDataMatrix: function(numLinesToFetch, preserveStringFormat) {
    // Validate the number of lines requested. It must be a positive integer.
    if (numLinesToFetch <= 0 || !Number.isInteger(numLinesToFetch)) {
      console.error("Invalid number of lines specified for acquireDataMatrix:", numLinesToFetch);
      return [];
    }

    const collectedRows = [];
    let processedCount = 0; // Tracks how many lines have been successfully processed.

    // Loop until the required number of lines are fetched or the input stream ends.
    while (processedCount < numLinesToFetch) {
      const lineIndexToRead = this.currentLinePointer + processedCount;

      // Check for out-of-bounds access.
      if (lineIndexToRead >= this.sourceLines.length) {
        console.warn(`Reached end of input while trying to fetch ${numLinesToFetch} lines. Only fetched ${processedCount}.`);
        break; // Stop if there are no more lines.
      }

      const currentRawLineContent = this.sourceLines[lineIndexToRead];
      let lineTokens;

      // Handle cases where the line content might already be an array.
      if (Array.isArray(currentRawLineContent)) {
          lineTokens = currentRawLineContent.reverse(); // Revert order if previously reversed.
      } else if (typeof currentRawLineContent === 'string') {
          lineTokens = currentRawLineContent.split(" ");
      } else {
          console.warn("Skipping invalid line content type during matrix acquisition:", typeof currentRawLineContent);
          lineTokens = []; // Default to empty array for invalid lines.
      }

      // Add the processed tokens to the collection, applying number conversion if needed.
      if (!preserveStringFormat) {
        collectedRows.push(lineTokens.map(val => Number(val)));
      } else {
        collectedRows.push(lineTokens);
      }
      processedCount++;
    }

    // Update the main line pointer to reflect all lines consumed by this operation.
    this.currentLinePointer += processedCount;
    return collectedRows;
  },
};

// --- Problem-Specific Helper Functions ---

/**
 * Calculates the parity (0 for even, 1 for odd) of the sum of two numbers.
 * @param {number} valueA - The first number.
 * @param {number} valueB - The second number.
 * @returns {number} 0 or 1.
 */
const calculateParity = (valueA, valueB) => (valueA + valueB) % 2;

/**
 * Generates a sequence of movement characters (R, L, U, D) to reach (0,0) from
 * a given starting coordinate (x,y) over a specified number of steps.
 * It also returns the final coordinates after these steps.
 * @param {number} startX - The initial X-coordinate.
 * @param {number} startY - The initial Y-coordinate.
 * @param {number} totalSteps - The total number of movement steps to generate.
 * @returns {{path: string, finalX: number, finalY: number}} An object containing the generated path string and the final coordinates.
 */
const generateMovementString = (startX, startY, totalSteps) => {
  let movePath = "";
  // Create mutable copies of coordinates for internal calculation.
  let currentX = startX;
  let currentY = startY;

  for (let stepCount = 0; stepCount < totalSteps; stepCount++) {
    // Prioritize moving horizontally if possible, then vertically.
    if (currentX > 0) {
      currentX--;
      movePath += "R";
    } else if (currentX < 0) {
      currentX++;
      movePath += "L";
    } else if (currentY > 0) { // Only move vertically if X is already 0.
      currentY--;
      movePath += "U";
    } else { // If Y is 0 or negative, move Down.
      currentY++;
      movePath += "D";
    }
  }
  return { path: movePath, finalX: currentX, finalY: currentY };
};


// --- Main Problem Solving Logic ---

// The primary function to solve the coordinate movement problem.
function solveCoordinateProblem() {
  // Setup for reading input from standard input stream.
  const fileSystemModule = require("fs");
  const standardInputPath = "/dev/stdin";
  let rawInputText;
  try {
    rawInputText = fileSystemModule.readFileSync(standardInputPath, "utf8");
  } catch (error) {
    console.error(`Failed to read input from ${standardInputPath}:`, error.message);
    // In case of error, provide an empty string to allow the processor to initialize.
    rawInputText = "";
  }

  // Initialize our custom input handler with the raw data.
  const inputHandler = new DataStreamProcessor(rawInputText);

  // Read the first line, which contains a single number N, representing the
  // total count of coordinate pairs that follow.
  const numberOfPoints = inputHandler.extractRightmostToken();

  // Basic validation for the number of points.
  if (isNaN(numberOfPoints) || numberOfPoints <= 0) {
    console.error("Invalid number of points detected. Must be a positive integer.");
    return -1; // Indicate an error condition as per original.
  }

  // Read the N subsequent lines, each containing a pair of coordinates (x, y).
  // These are expected to be numbers, so `preserveStringFormat` is false.
  const coordinateDataSet = inputHandler.acquireDataMatrix(numberOfPoints, false);

  // Calculate the parity of the sum of coordinates for the very first point.
  // This parity will serve as a reference for all other points.
  const referenceParity = calculateParity(coordinateDataSet[0][0], coordinateDataSet[0][1]);

  // Iterate through the remaining coordinate points (from the second one onwards)
  // to ensure their coordinate sum parity matches the reference parity.
  for (let pointIdx = 1; pointIdx < numberOfPoints; pointIdx++) {
    const currentPointParity = calculateParity(coordinateDataSet[pointIdx][0], coordinateDataSet[pointIdx][1]);
    if (currentPointParity !== referenceParity) {
      // If any point has a different parity, the problem cannot be solved under its rules.
      return -1; // Return -1 as an immediate failure indicator.
    }
  }

  // Determine the length of the movement path based on the reference parity.
  // If parity is 0, length is 20. If parity is 1, length is 19.
  const pathGenerationLength = (referenceParity === 0) ? 20 : 19;

  // Create an array representing the 'weights' or magnitudes of each step in the path.
  // For this problem, all steps have a magnitude of 1.
  const pathSegmentWeights = Array(pathGenerationLength).fill(1);

  // An array to collect the generated movement sequences for each coordinate point.
  const allMovementSequences = [];

  // Process each coordinate pair to generate its unique movement sequence.
  for (let pointIdx = 0; pointIdx < numberOfPoints; pointIdx++) {
    // Get a reference to the current [x, y] point array from the dataset.
    // This allows us to modify the original array elements in place,
    // mimicking the behavior of the original code.
    let currentPointCoords = coordinateDataSet[pointIdx];

    // Call the helper function to generate the path and get the final coordinates.
    const { path: generatedPath, finalX, finalY } = generateMovementString(
      currentPointCoords[0],
      currentPointCoords[1],
      pathGenerationLength
    );

    // Update the original coordinate array elements with the new final positions.
    // This simulates the in-place decrement/increment logic of the original.
    currentPointCoords[0] = finalX;
    currentPointCoords[1] = finalY;

    // Add the generated path string to our collection.
    allMovementSequences.push(generatedPath);
  }

  // Assemble the final output string using template literals for clarity.
  const outputLengthLine = String(pathGenerationLength);
  const outputWeightsLine = pathSegmentWeights.join(" ");
  const outputSequencesBlock = allMovementSequences.join("\n");

  return `${outputLengthLine}\n${outputWeightsLine}\n${outputSequencesBlock}`;
}

// Execute the main problem-solving function and print its return value to the console.
console.log(solveCoordinateProblem());