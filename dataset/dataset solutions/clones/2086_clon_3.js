// Define some constants for better readability and maintainability
const INPUT_FILE_PATH = "/dev/stdin";
const ENCODING_UTF8 = "utf8";
const NEWLINE_DELIMITER = "\n";
const SPACE_DELIMITER = " ";
const NO_MORE_ELEMENTS_ERROR = "Input stream exhausted: No more elements available.";

// A class to manage the input stream, providing an iterable-like interface.
class InputProcessor {
  #dataLines; // Private field to store processed input lines
  #currentIdx; // Private field for the current reading position
  #totalLines; // Private field for the total number of lines

  /**
   * Initializes the InputProcessor with raw input data.
   * @param {string[]} rawInputLines - An array of strings, each representing a line of input.
   */
  constructor(rawInputLines) {
    if (!Array.isArray(rawInputLines)) {
      throw new TypeError("Input must be an array of strings.");
    }
    this.#dataLines = rawInputLines;
    this.#currentIdx = 0;
    this.#totalLines = rawInputLines.length;
  }

  /**
   * Checks if there are more elements to read in the input stream.
   * @returns {boolean} True if more elements are available, false otherwise.
   */
  hasMoreElements() {
    return this.#currentIdx < this.#totalLines;
  }

  /**
   * Retrieves the next element from the input stream.
   * Throws an error if no more elements are available.
   * @returns {string} The next line from the input.
   */
  fetchNextElement() {
    if (!this.hasMoreElements()) {
      throw new Error(NO_MORE_ELEMENTS_ERROR);
    }
    const nextItem = this.#dataLines[this.#currentIdx];
    this.#currentIdx++;
    return nextItem;
  }
}

// Global instance of the input processor
// Read raw data, trim whitespace, and split into lines using Node.js 'fs' module
const rawInputContent = require("fs").readFileSync(INPUT_FILE_PATH, ENCODING_UTF8).trim();
const streamReader = new InputProcessor(rawInputContent.split(NEWLINE_DELIMITER));

/**
 * A utility function to transform input values based on a specified type.
 * It handles common data conversions for competitive programming inputs.
 * @param {string|string[]} valueToTransform - The input value or array to convert.
 * @param {number} transformDirective - A numeric directive for the conversion type.
 *   1: Convert to integer.
 *   2: Split by space into a string array.
 *   4: Split by space and convert each part to a number array.
 *   6: Split into a character array.
 * @returns {*} The transformed value, or the original value if transformation fails or is not defined.
 */
function dataTransformer(valueToTransform, transformDirective) {
  try {
    switch (transformDirective) {
      case 1: // Convert to integer
        return parseInt(valueToTransform, 10);
      case 2: // Split by space into string array
        return String(valueToTransform).split(SPACE_DELIMITER);
      case 4: // Split by space and convert each part to a number array
        return String(valueToTransform).split(SPACE_DELIMITER).map(Number);
      case 6: // Split into character array
        return String(valueToTransform).split("");
      default: // Return as-is if no specific conversion
        return valueToTransform;
    }
  } catch (conversionError) {
    // Log the error for debugging, but return the original value as per original logic
    console.error(`Transformation failed for value: '${valueToTransform}' with directive ${transformDirective}. Error: ${conversionError.message}`);
    return valueToTransform;
  }
}

// Global helper functions to interact with the InputProcessor and DataTransformer
// These provide a convenient API for reading various data types from the input stream.

/** Checks if there's more input available in the stream. */
const hasPendingInput = () => streamReader.hasMoreElements();

/** Retrieves the next raw line of input as a string. */
const retrieveNextLine = () => streamReader.fetchNextElement();

/** Retrieves the next line and parses it as an integer. */
const parseNextInteger = () => dataTransformer(retrieveNextLine(), 1);

/** Retrieves the next line and splits it into a string array by spaces. */
const parseNextStringArray = () => dataTransformer(retrieveNextLine(), 2);

/** Retrieves the next line, splits it by spaces, and converts each part to a number. */
const parseNextIntegerArray = () => dataTransformer(retrieveNextLine(), 4);

/** Retrieves the next line and splits it into a character array. */
const parseNextCharacterArray = () => dataTransformer(retrieveNextLine(), 6);

/** Outputs a value to the console. */
const displayOutput = (outputValue) => console.log(outputValue);

// Main program logic to solve the challenge
function executeSolution() {
  // Read initial parameters: number of items in A, B, and number of discounts M.
  // Note: The first two values (A and B counts) are read but not directly used
  // in this specific implementation, as array lengths are implicitly handled
  // by subsequent input lines. Only the number of discounts (M) is critical.
  const initialConfiguration = parseNextIntegerArray();
  const numberOfDiscounts = initialConfiguration[2];

  // Read the price lists for items from category A (e.g., refrigerators)
  const refrigeratorPrices = parseNextIntegerArray();
  // Read the price lists for items from category B (e.g., microwaves)
  const microwavePrices = parseNextIntegerArray();

  // Calculate the initial minimum cost without applying any special discounts.
  // This is the sum of the cheapest item from each category.
  const minPriceA = Math.min(...refrigeratorPrices);
  const minPriceB = Math.min(...microwavePrices);
  let overallMinimumCost = minPriceA + minPriceB;

  // Process each discount offer provided in the input.
  for (let discountIndex = 0; discountIndex < numberOfDiscounts; discountIndex++) {
    // Each discount detail line contains: itemA_idx, itemB_idx, discount_amount
    const currentDiscountDetails = parseNextIntegerArray();
    const itemAIndex = currentDiscountDetails[0] - 1; // Adjust for 0-based array indexing
    const itemBIndex = currentDiscountDetails[1] - 1; // Adjust for 0-based array indexing
    const discountAmount = currentDiscountDetails[2];

    // Calculate the total cost if this specific discount is applied.
    const potentialDiscountedCost =
      refrigeratorPrices[itemAIndex] +
      microwavePrices[itemBIndex] -
      discountAmount;

    // Update the overall minimum cost if the current discounted option is cheaper.
    if (potentialDiscountedCost < overallMinimumCost) {
      overallMinimumCost = potentialDiscountedCost;
    }
  }

  // Display the final calculated minimum cost to the standard output.
  displayOutput(overallMinimumCost);
}

// Execute the main program function to start the solution process.
executeSolution();