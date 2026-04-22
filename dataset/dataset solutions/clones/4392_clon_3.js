const fileSystem = require("fs");

// Reads raw data from standard input, processes it into individual lines.
// The .trim() ensures no leading/trailing whitespace on the whole input.
// .split("\n") breaks it into an array of strings, one per line.
let rawInputLines = fileSystem.readFileSync("/dev/stdin", "utf8").trim().split("\n");

/**
 * A utility class designed to manage sequential access to an array of input lines.
 * It functions as an iterator, allowing controlled retrieval of data segments.
 */
class InputLineIterator {
  // Private field to store the array of input lines.
  #dataSegments;
  // Private field tracking the current position (index) within the data segments.
  #readOffset;
  // Private field holding the total number of segments available.
  #totalSegments;

  /**
   * Constructs an InputLineIterator instance.
   * @param {Array<string>} lines - An array of strings, where each string represents an input line.
   * @throws {Error} If the provided input is not an array.
   */
  constructor(lines) {
    if (!Array.isArray(lines)) {
      // Guard clause: Ensure input is an array for robust operation.
      throw new Error("InputLineIterator: Initialization failed. Expected an array of lines.");
    }
    this.#dataSegments = lines;
    this.#readOffset = 0; // Start reading from the beginning.
    this.#totalSegments = lines.length;
  }

  /**
   * Retrieves the next line (segment) from the input stream and advances the internal pointer.
   * @returns {string} The next available input line.
   * @throws {Error} If no more lines are available to retrieve.
   */
  retrieveNextSegment() {
    if (!this.hasPendingData()) {
      // Guard clause: Prevent reading beyond the end of the data.
      throw new Error("DataStreamDepletionError: No more elements to retrieve from the input source.");
    }
    // Fetch the current segment and then increment the offset for the subsequent call.
    const currentSegment = this.#dataSegments[this.#readOffset];
    this.#readOffset++;
    return currentSegment;
  }

  /**
   * Checks if there are any more lines remaining in the input stream that can be retrieved.
   * @returns {boolean} True if more data is available, false otherwise.
   */
  hasPendingData() {
    return this.#readOffset < this.#totalSegments;
  }

  /**
   * Optionally peeks at the next segment without advancing the internal pointer.
   * @returns {string | undefined} The next input line if available, otherwise undefined.
   */
  peekNextSegment() {
    if (!this.hasPendingData()) {
      return undefined; // No data to peek at.
    }
    return this.#dataSegments[this.#readOffset];
  }
}

// Instantiate the iterator for our raw input lines.
const dataStream = new InputLineIterator(rawInputLines);

// --- Global Helper Functions for Input/Output Abstraction ---

/**
 * Fetches the next raw string segment from the global data stream.
 * @returns {string} The next input line.
 */
function obtainNextInputLine() {
  return dataStream.retrieveNextSegment();
}

/**
 * Parses the next input line as an integer after fetching it.
 * @returns {number} The parsed integer value.
 */
function parseNextInteger() {
  return dataTransformer(obtainNextInputLine(), 'integer');
}

/**
 * Parses the next input line into an array of strings, using space as a delimiter.
 * @returns {Array<string>} An array of string tokens.
 */
function parseNextStringArray() {
  return dataTransformer(obtainNextInputLine(), 'stringArray');
}

/**
 * Parses the next input line into an array of integers, splitting by space.
 * @returns {Array<number>} An array of parsed integer values.
 */
function parseNextIntegerArray() {
  return dataTransformer(obtainNextInputLine(), 'integerArray');
}

/**
 * Parses the next input line into an array of individual characters.
 * @returns {Array<string>} An array of single-character strings.
 */
function parseNextCharacterArray() {
  return dataTransformer(obtainNextInputLine(), 'charArray');
}

/**
 * Checks if there are more lines to process in the global data stream.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function checkMoreInput() {
  return dataStream.hasPendingData();
}

/**
 * Displays a message to standard output, typically followed by a newline.
 * @param {*} content - The content to be logged.
 */
function outputMessage(content) {
  console.log(content);
}

/**
 * Reports an error message to standard error, useful for diagnostic output.
 * @param {*} issue - The error or warning message to be logged.
 */
function reportProblem(issue) {
  console.error(issue);
}

// --- Data Conversion and Transformation Utility ---

/**
 * Transforms an input value based on a specified transformation type.
 * This function handles various parsing and joining operations.
 * @param {*} value - The input value to be transformed.
 * @param {string} transformationType - A string indicating the desired transformation ('integer', 'stringArray', etc.).
 * @returns {*} The transformed value, or the original value if transformation fails or type is unknown.
 */
function dataTransformer(value, transformationType) {
  // Early exit for null/undefined values to prevent errors during transformation attempts.
  if (value === null || value === undefined) {
    reportProblem(`Warning: Attempted to transform null/undefined value with type '${transformationType}'. Returning original.`);
    return value;
  }

  try {
    switch (transformationType) {
      case 'integer':
        // Use Number() for flexible parsing, then Math.floor to ensure integer result.
        const parsedInt = Number(value);
        if (isNaN(parsedInt)) {
          // Validation: Report if conversion to number failed.
          reportProblem(`Conversion error: Input '${value}' is not a valid integer. Returning original.`);
          return value;
        }
        return Math.floor(parsedInt);
      case 'stringArray':
        // Ensure value is treated as a string before splitting.
        return String(value).split(" ");
      case 'integerArray':
        // Split by space, then map each part to a number, validating each conversion.
        return String(value).split(" ").map(s => {
          const num = Number(s);
          if (isNaN(num)) {
            reportProblem(`Conversion error within integerArray: Component '${s}' is not a valid number. Retaining as string.`);
            return s; // Keep original string if not a number.
          }
          return num;
        });
      case 'charArray':
        return String(value).split("");
      case 'joinSpace':
        // Ensure input is an array before joining.
        if (Array.isArray(value)) return value.join(" ");
        reportProblem(`Warning: 'joinSpace' expects an array, but received '${typeof value}'. Returning original.`);
        return value;
      case 'joinNewline':
        if (Array.isArray(value)) return value.join("\n");
        reportProblem(`Warning: 'joinNewline' expects an array, but received '${typeof value}'. Returning original.`);
        return value;
      case 'joinEmpty':
        if (Array.isArray(value)) return value.join("");
        reportProblem(`Warning: 'joinEmpty' expects an array, but received '${typeof value}'. Returning original.`);
        return value;
      default:
        // Fallback for unknown transformation types.
        reportProblem(`Unknown transformation type: '${transformationType}'. Returning original value.`);
        return value;
    }
  } catch (e) {
    // Catch any unexpected errors during transformation.
    reportProblem(`An error occurred during data transformation for value '${value}' with type '${transformationType}': ${e.message}. Returning original.`);
    return value;
  }
}

// --- Main Application Logic ---

/**
 * This function encapsulates the primary logic for calculating the minimum cost
 * to purchase a specific volume of liquid, given various pricing options.
 * It reads input, performs calculations, and outputs the final result.
 */
function executeSolution() {
  // Read the initial pricing parameters from the first line of input.
  const priceParameters = parseNextIntegerArray();

  // Input validation: Ensure enough parameters were provided.
  const expectedParameterCount = 4;
  if (priceParameters.length < expectedParameterCount) {
    reportProblem(`Error: Insufficient price parameters provided. Expected ${expectedParameterCount} (Q, H, S, D), received ${priceParameters.length}.`);
    return; // Exit if input is malformed.
  }

  // Destructure the pricing parameters for improved readability.
  // Assuming Q=0.25L, H=0.5L, S=1L, D=2L costs.
  const [quartCost, halfCost, singleCost, doubleCost] = priceParameters;

  // Read the target total volume (N) from the next line of input.
  const targetVolume = parseNextInteger();

  // Input validation: Ensure target volume is a valid non-negative integer.
  if (isNaN(targetVolume) || targetVolume < 0) {
    reportProblem(`Error: Invalid target volume '${targetVolume}'. Must be a non-negative integer.`);
    return; // Exit if input is invalid.
  }

  let minimumTotalCost = 0; // Initialize the accumulated cost.

  // --- Step 1: Determine the most cost-effective way to acquire 2 liters. ---
  // This establishes the optimal unit cost for bulk purchases (in 2-liter increments).

  // Calculate the cost of obtaining 2 liters using each available container size.
  // 2 liters from 0.25L containers (quartCost): 8 * 0.25L = 2L
  const costForTwoLitersFromQuarts = quartCost * 8;
  // 2 liters from 0.5L containers (halfCost): 4 * 0.5L = 2L
  const costForTwoLitersFromHalves = halfCost * 4;
  // 2 liters from 1L containers (singleCost): 2 * 1L = 2L
  const costForTwoLitersFromSingles = singleCost * 2;
  // Directly buying a 2L container (doubleCost).
  const costForTwoLitersDirectly = doubleCost;

  // Collect all calculated 2-liter options into an array for comparison.
  const twoLiterCostOptions = [
    costForTwoLitersFromQuarts,
    costForTwoLitersFromHalves,
    costForTwoLitersFromSingles,
    costForTwoLitersDirectly
  ];

  // Find the absolute minimum cost to acquire exactly 2 liters using the spread operator.
  const optimalTwoLiterPrice = Math.min(...twoLiterCostOptions);

  // --- Step 2: Calculate cost for the largest possible even multiple of 2 liters. ---
  // Determine how many full 2-liter units can be purchased.
  const numberOfTwoLiterUnits = Math.floor(targetVolume / 2);
  minimumTotalCost += numberOfTwoLiterUnits * optimalTwoLiterPrice;

  // --- Step 3: Handle any remaining 1 liter if the target volume is odd. ---
  // If the target volume is an odd number, there will be 1 liter remaining after bulk purchase.
  if (targetVolume % 2 !== 0) {
    // Calculate the cheapest way to acquire this single additional liter.
    // 1 liter from 0.25L containers (quartCost): 4 * 0.25L = 1L
    const costForOneLiterFromQuarts = quartCost * 4;
    // 1 liter from 0.5L containers (halfCost): 2 * 0.5L = 1L
    const costForOneLiterFromHalves = halfCost * 2;
    // Directly buying a 1L container (singleCost).
    const costForOneLiterDirectly = singleCost;

    // Determine the minimum cost for this single remaining liter.
    const optimalOneLiterPrice = Math.min(
      costForOneLiterFromQuarts,
      costForOneLiterFromHalves,
      costForOneLiterDirectly
    );

    minimumTotalCost += optimalOneLiterPrice;
  }

  // Output the final calculated minimum total cost to standard output.
  outputMessage(minimumTotalCost);
}

// Execute the main solution logic within a comprehensive try-catch block
// to gracefully handle any unexpected errors during runtime.
try {
  executeSolution();
} catch (mainError) {
  // Report any unhandled errors to standard error.
  reportProblem(`An unhandled exception occurred during application execution: ${mainError.message}`);
  // Optionally, exit the process with an error code to indicate failure.
  // process.exit(1);
}