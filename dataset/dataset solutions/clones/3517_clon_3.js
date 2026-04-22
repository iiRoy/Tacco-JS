/**
 * This script processes coordinate data to generate movement paths.
 * It's designed to solve a specific problem where points need to be
 * moved to the origin (0,0) using a set of fixed step distances,
 * under the condition that all points must have the same parity sum
 * for their coordinates (x+y % 2).
 */

// --- Input Processing Utility ---

/**
 * Utility class to process input strings line by line and token by token.
 * It provides methods to read individual values, whole lines, or multiple lines (matrices).
 */
class InputProcessor {
  /**
   * Constructs an InputProcessor instance.
   * @param {string} rawInputString - The raw input string, typically from a file,
   *                                  where lines are separated by newline characters.
   */
  constructor(rawInputString) {
    // Store all input lines as an array of strings.
    this.storedLines = rawInputString.split('\n');
    // Initialize a cursor to keep track of the current line being processed.
    this.currentLineIndex = 0;
    // A buffer to hold tokens from the current line when reading individual values.
    // This allows sequential 'atom' reading from a single line.
    this.currentLineTokens = [];
  }

  /**
   * Helper static method to convert a string token into a numeric value.
   * Uses Number() for robust conversion, handling various numeric formats.
   * @param {string} token - The string token to convert.
   * @returns {number} The numeric representation of the token.
   */
  static parseNumericToken(token) {
    return Number(token);
  }

  /**
   * Reads a single numeric value (or string if specified) from the input stream.
   * This method processes tokens from right to left within a line, mimicking a stack pop.
   * If the current line's tokens are exhausted, it automatically advances to the next line.
   * @param {boolean} [returnAsString=false] - If true, the token is returned as a string;
   *                                            otherwise, it's converted to a number.
   * @returns {string|number} The next available token from the input.
   * @throws {Error} If the end of the input stream is reached unexpectedly.
   */
  getNextToken(returnAsString = false) {
    // If the current line's token buffer is empty, or not yet initialized for this line.
    if (this.currentLineTokens.length === 0) {
      // Check for end-of-file condition.
      if (this.currentLineIndex >= this.storedLines.length) {
        throw new Error("End of input stream reached. No more tokens available.");
      }

      // Retrieve the next raw line from the stored lines.
      let lineContent = this.storedLines[this.currentLineIndex];
      // Increment the line cursor for subsequent reads.
      this.currentLineIndex++;

      // Handle empty lines or lines consisting only of whitespace.
      // If such a line is encountered, recursively call getNextToken to skip it.
      if (!lineContent || lineContent.trim() === '') {
        return this.getNextToken(returnAsString);
      }

      // Split the line into individual tokens and reverse the array.
      // Reversing allows efficient 'pop' operation from the end to get tokens
      // in their original order (left-to-right from the line).
      this.currentLineTokens = lineContent.split(' ').reverse();
    }

    // Extract the last token from the reversed buffer (which was the first token on the line).
    const extractedToken = this.currentLineTokens.pop();

    // Return the token, either as a string or converted to a number.
    return returnAsString ? extractedToken : InputProcessor.parseNumericToken(extractedToken);
  }

  /**
   * Reads an entire line from the input and returns its tokens as an array.
   * This operation consumes the current line and advances the line cursor.
   * @param {boolean} [returnAsStrings=false] - If true, tokens are returned as strings;
   *                                            otherwise, they are converted to numbers.
   * @returns {string[]|number[]} An array containing all tokens from the read line.
   * @throws {Error} If the end of the input stream is reached when attempting to read a full line.
   */
  getLineTokens(returnAsStrings = false) {
    // Check for end-of-file.
    if (this.currentLineIndex >= this.storedLines.length) {
      throw new Error("End of input stream reached when trying to read a full line.");
    }
    // Clear any pending tokens from a previous getNextToken call, as we're reading a full line.
    this.currentLineTokens = [];

    // Get the current line, split it into tokens.
    const lineTokens = this.storedLines[this.currentLineIndex].split(' ');
    // Advance the line cursor.
    this.currentLineIndex++;

    // Return tokens, either as strings or converted to numbers.
    return returnAsStrings ? lineTokens : lineTokens.map(InputProcessor.parseNumericToken);
  }

  /**
   * Reads a specified number of lines, interpreting each as a row of data,
   * and returns them as a 2D array (matrix).
   * @param {number} rowCount - The number of lines (rows) to read.
   * @param {boolean} [asStrings=false] - If true, values in the matrix are strings;
   *                                       otherwise, they are numbers.
   * @returns {string[][]|number[][]} A 2D array representing the matrix data.
   * @throws {Error} If there are insufficient lines in the input for the requested rowCount.
   */
  getMultiLineData(rowCount, asStrings = false) {
    // Handle edge case for zero or negative row counts.
    if (rowCount <= 0) {
      return [];
    }

    // Pre-allocate the array for better performance with known size.
    const dataMatrix = Array(rowCount);

    // Loop to read each required row.
    for (let i = 0; i < rowCount; i++) {
      // Check for end-of-file condition during matrix reading.
      if (this.currentLineIndex >= this.storedLines.length) {
        throw new Error(`Insufficient lines in input for matrix read. Expected ${rowCount} rows, but only found ${i}.`);
      }
      const line = this.storedLines[this.currentLineIndex];
      const tokens = line.split(' ');
      // Store the processed tokens for the current row.
      dataMatrix[i] = asStrings ? tokens : tokens.map(InputProcessor.parseNumericToken);
      // Advance the line cursor after processing each row.
      this.currentLineIndex++;
    }
    return dataMatrix;
  }
}

// --- Core Problem-Solving Logic ---

/**
 * Reads the entire content of the standard input file (/dev/stdin).
 * This function abstracts the file system interaction.
 * @returns {string} The content of the standard input file as a single string.
 * @throws {Error} If there's an issue reading from /dev/stdin.
 */
function readInputFileContent() {
  try {
    // Synchronously read the file content using Node.js's 'fs' module.
    return require('fs').readFileSync('/dev/stdin', 'utf8');
  } catch (error) {
    // Log and re-throw the error for centralized handling.
    console.error("Error reading input from /dev/stdin:", error.message);
    throw new Error("Failed to read standard input due to a file system error.");
  }
}

/**
 * Determines the parity of the sum of two numbers.
 * The result is 0 if the sum is even, and 1 if the sum is odd.
 * This is a helper function for coordinate parity checks.
 * @param {number} val1 - The first numeric value.
 * @param {number} val2 - The second numeric value.
 * @returns {number} 0 or 1, representing the parity.
 */
const calculateParity = (val1, val2) => (val1 + val2) % 2;

/**
 * Main function to generate movement paths for a set of points.
 * It reads point coordinates, validates their parity, calculates
 * a sequence of step distances, and then determines a path for each
 * point to reach the origin (0,0) using these steps.
 * @returns {string} A multi-line string containing the path length,
 *                   the step distances, and the movement sequences for each point.
 *                   Returns "-1" if a parity mismatch is found, indicating no solution.
 *                   Returns "0\n\n" if there are no points to process.
 */
function generateCoordinatePaths() {
  // Initialize the input data reader with content from standard input.
  const dataReader = new InputProcessor(readInputFileContent());

  // Read the total number of points from the first line of input.
  const totalPoints = dataReader.getNextToken();

  // --- Input Validation and Edge Cases ---
  if (totalPoints <= 0) {
    // If no points are specified, return a minimal valid output.
    return "0\n\n";
  }
  if (totalPoints > 100000) {
    // A warning for very large inputs, indicating potential performance issues.
    console.warn("Processing a very large number of points. Performance might be affected.");
  }

  // Read all point coordinates into a 2D array.
  const pointCoordinates = dataReader.getMultiLineData(totalPoints);

  // --- Parity Consistency Check ---
  // The core constraint of this problem is that all points (x, y) must have
  // the same parity for their sum (x + y). We check the first point's parity
  // and then compare all subsequent points against it.
  const referenceParity = calculateParity(pointCoordinates[0][0], pointCoordinates[0][1]);

  // Iterate from the second point onwards to validate parity consistency.
  for (let i = 1; i < totalPoints; i++) {
    const currentPointParity = calculateParity(pointCoordinates[i][0], pointCoordinates[i][1]);
    if (currentPointParity !== referenceParity) {
      // If a parity mismatch is found, the problem is unsolvable with this method.
      return "-1";
    }
  }

  // --- Step Distance Calculation ---
  // The number of steps (pathLength) depends on the reference parity.
  // If referenceParity is 0 (even), pathLength is 32 (steps 2^30 down to 2^0).
  // If referenceParity is 1 (odd), pathLength is 31 (steps 2^30 down to 2^1).
  const pathLength = 32 - referenceParity;

  // Initialize an array to store the step distances.
  // The largest step is 2^30.
  const stepDistances = [Math.pow(2, 30)];

  // Populate the stepDistances array by successively halving the previous value.
  // This generates 2^30, 2^29, ..., 2^1.
  for (let sIdx = 1; sIdx < 31; sIdx++) {
    // Using division by 2 instead of right bit shift for slight variation, functionally identical.
    stepDistances.push(stepDistances[sIdx - 1] / 2);
  }

  // If the pathLength is 32 (meaning referenceParity was 0), we need to add the final step of 2^0 (which is 1).
  // This ensures the step distances correctly correspond to the 'pathLength'.
  if (pathLength % 2 === 0) { // This condition is equivalent to (referenceParity === 0)
    stepDistances.push(1); // Add the smallest step (2^0 = 1)
  }

  // --- Movement Sequence Generation ---
  // Initialize an array to hold the movement path string for each point.
  const movementSequences = Array(totalPoints).fill('');

  // Iterate through each point to determine its specific movement path.
  for (let pIdx = 0; pIdx < totalPoints; pIdx++) {
    // Use local mutable variables for current coordinates to track movement.
    let currentX = pointCoordinates[pIdx][0];
    let currentY = pointCoordinates[pIdx][1];
    // Use an array to build the path segments for the current point, then join at the end.
    const currentPathSegments = [];

    // Iterate through each calculated step distance.
    for (let stepIdx = 0; stepIdx < pathLength; stepIdx++) {
      const currentStepMagnitude = stepDistances[stepIdx];
      let directionCharacter = '';

      // Determine the primary axis for movement (X or Y) based on absolute coordinate magnitude.
      // If magnitudes are equal, prioritize X-axis movement (arbitrary tie-breaking).
      if (Math.abs(currentX) >= Math.abs(currentY)) {
        // Move along the X-axis.
        if (currentX > 0) {
          currentX -= currentStepMagnitude; // Move Right (R)
          directionCharacter = 'R';
        } else {
          currentX += currentStepMagnitude; // Move Left (L)
          directionCharacter = 'L';
        }
      } else {
        // Move along the Y-axis.
        if (currentY > 0) {
          currentY -= currentStepMagnitude; // Move Up (U)
          directionCharacter = 'U';
        } else {
          currentY += currentStepMagnitude; // Move Down (D)
          directionCharacter = 'D';
        }
      }
      currentPathSegments.push(directionCharacter);
    }
    // Join all segments to form the complete path string for the current point.
    movementSequences[pIdx] = currentPathSegments.join('');
  }

  // --- Final Output Construction ---
  // Assemble the final output string in the specified format:
  // 1. Total path length
  // 2. Space-separated step distances
  // 3. Newline-separated movement sequences for each point
  const outputParts = [
    String(pathLength),
    stepDistances.join(' '),
    movementSequences.join('\n')
  ];

  return outputParts.join('\n');
}

// Execute the main logic and print the result to standard output.
// This is the entry point of the script.
console.log(generateCoordinatePaths());