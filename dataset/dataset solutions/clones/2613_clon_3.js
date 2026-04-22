// Internal Utility Section. Do not alter unless necessary.
const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

let dataStore;
const rawInputLines = [];

inputReader.on('line', (currentLine) => {
  rawInputLines.push(currentLine);
});

inputReader.on('close', () => {
  dataStore = new InputLineProcessor(rawInputLines);
  executePrimaryLogic();
});

/**
 * Manages sequential reading of input lines.
 * Replaces the original 'init' function's object literal with a class.
 */
class InputLineProcessor {
  constructor(lines) {
    this.lineBuffer = lines;
    this.currentLineIndex = 0;
    this.totalLines = lines.length;
  }

  /**
   * Checks if there are more lines available to read.
   * @returns {boolean} True if more input exists, false otherwise.
   */
  hasMoreInput() {
    return this.currentLineIndex < this.totalLines;
  }

  /**
   * Retrieves the next line from the buffer and advances the index.
   * Throws an error if no more input is available, acting as a guard.
   * @returns {string} The next input line.
   */
  getNextLine() {
    if (!this.hasMoreInput()) {
      throw new Error('EndOfInputException: Attempted to read past available input lines.');
    }
    return this.lineBuffer[this.currentLineIndex++];
  }
}

/**
 * Retrieves a single line from input and parses it as an integer.
 * Includes basic validation to ensure the input is indeed an integer.
 * @returns {number} The parsed integer value.
 */
function retrieveInteger() {
  const line = dataStore.getNextLine();
  // Guard clause: Validate input format before parsing.
  if (!/^-?\d+$/.test(line)) {
    displayResult("Error: Expected a single integer, but received non-numeric input: " + line);
    process.exit(1); // Terminate on critical input parsing error.
  }
  return parseInt(line, 10);
}

/**
 * Retrieves a line of space-separated values and parses them into an array of integers.
 * Performs validation for each element during the parsing process.
 * @returns {number[]} An array of parsed integer values.
 */
function fetchIntegerArray() {
  const line = dataStore.getNextLine();
  const stringElements = line.split(' ');
  const numericElements = stringElements
    .map(str => {
      const num = Number(str);
      // In-line validation for each converted number.
      if (isNaN(num)) {
        displayResult("Error: Encountered invalid number ('" + str + "') within an integer array input.");
        process.exit(1); // Terminate on critical input parsing error.
      }
      return num;
    });
  return numericElements;
}

/**
 * Displays the final computed result to standard output.
 * @param {string|number} messageContent - The content to be displayed.
 */
function displayResult(messageContent) {
  console.log(messageContent);
}

// Removed unused helper functions like 'deepCopyValue', 'fetchStringArray', 'extractCharacterArray',
// 'logDebugMessage', and 'transformInput' as they are not relevant to the main logic's execution path.

// End of Internal Utility Section. ------------------------------------------

/**
 * The primary function containing the core business logic.
 * It calculates the number of specific date combinations based on input month and day limits.
 */
function executePrimaryLogic() {
  // Fetch the initial input line, which is expected to contain two space-separated integers:
  // the maximum month (M) and the maximum day (D).
  const monthDayLimits = fetchIntegerArray();

  // Implement a guard clause to validate the structure of the input limits array.
  // Ensure it is an array and contains at least two elements.
  if (!Array.isArray(monthDayLimits) || monthDayLimits.length < 2) {
    displayResult("Input format error: Expected two numeric limits (M D). Received: " + JSON.stringify(monthDayLimits));
    return; // Exit the function if input is malformed.
  }

  // Destructure and assign the extracted values to clearly named constants.
  const maximumAllowableMonths = monthDayLimits[0];
  const maximumAllowableDays = monthDayLimits[1];

  // Initialize a mutable counter for valid date combinations.
  let validDateCombinations = 0;

  // Outer loop: Iterates through each possible month, from 1 up to the specified maximum.
  for (let currentMonthIndex = 1; currentMonthIndex <= maximumAllowableMonths; ++currentMonthIndex) {
    // Inner loop: Iterates through each possible day. The problem's logic implies
    // days must be at least 22 for both tens and units digits to be >= 2.
    for (let dayCandidate = 22; dayCandidate <= maximumAllowableDays; ++dayCandidate) {

      // Extract the tens and units digits from the current day.
      // Using bitwise OR with 0 for efficient integer truncation, an alternative to Math.floor().
      const tensPlaceDigit = (dayCandidate / 10) | 0;
      const unitsPlaceDigit = dayCandidate % 10;

      // Add a guard clause for early exit: if either digit is less than 2,
      // this day cannot satisfy the condition, so we skip to the next day.
      if (tensPlaceDigit < 2 || unitsPlaceDigit < 2) {
        continue;
      }

      // Calculate the product of the two extracted digits.
      // This is an intermediate step to improve readability.
      const digitProduct = tensPlaceDigit * unitsPlaceDigit;

      // Evaluate if the product of the digits matches the current month index.
      // Storing this condition in a boolean variable for clarity.
      const isProductMatchingMonth = (digitProduct === currentMonthIndex);

      // If the product matches the month, increment our counter.
      if (isProductMatchingMonth) {
        validDateCombinations++;
      }
    }
  }

  // Output the final tally of unique valid date combinations.
  displayResult(validDateCombinations);
}