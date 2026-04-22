// --- Core Input/Output Utilities Start ---
// This section handles command-line input and basic data conversions.
// It's generally self-contained and not directly related to the problem's core logic.

// Interface for reading input from the standard input stream.
const cliInputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputDataProcessor; // Stores the object for managing input lines
const bufferedInputLines = []; // Array to hold all input lines

// Event listener for each line read from stdin.
cliInputHandler.on('line', (currentLine) => {
  bufferedInputLines.push(currentLine);
});

// Event listener for when the input stream is closed.
cliInputHandler.on('close', () => {
  inputDataProcessor = configureInputParsing(bufferedInputLines);
  // console.error('\n--- Input Processed, Output Below ---'); // Removed for conciseness
  performAnalysis(); // Call the main computation function
});

/**
 * Configures and returns an object to manage sequential access to input lines.
 * @param {string[]} lines - An array of input strings.
 * @returns {object} An object with methods to navigate input.
 */
function configureInputParsing(lines) {
  return {
    parsedLines: lines,
    currentLineIndex: 0,
    totalInputLines: lines.length,

    /** Checks if there are more lines to read. */
    hasMoreInputLines: function() {
      return (this.currentLineIndex < this.totalInputLines);
    },

    /** Fetches the next available input line. */
    fetchNextLine: function() {
      if (this.hasMoreInputLines()) {
        return this.parsedLines[this.currentLineIndex++];
      } else {
        // Defensive programming: throw an error if input exhausted unexpectedly.
        throw new Error('InputBufferExhausted: No more input lines available.');
      }
    }
  };
}

/**
 * Prints a value to the standard output.
 * @param {*} value - The value to print.
 */
function printToConsole(value) {
  console.log(value);
}

// --- Data Conversion & Input Access Helpers ---

/**
 * Converts input data based on a specified format code.
 * @param {string|string[]} rawData - The data to convert.
 * @param {number} conversionCode - Code indicating the conversion type.
 *   1: Parse as integer.
 *   2: Split string by spaces into an array of strings.
 *   4: Split string by spaces and convert parts to numbers.
 *   6: Split string into an array of characters.
 *   7: Split string into chars and convert parts to numbers.
 *   8: Join array with spaces.
 *   9: Join array with newlines.
 *   0: Join array without separator.
 * @returns {*} The converted data.
 */
function dataConverter(rawData, conversionCode) {
  try {
    switch (conversionCode) {
      case 1:
        return Number.parseInt(rawData, 10);
      case 2:
        return rawData.split(' ');
      case 4:
        return rawData.split(' ').map(Number);
      case 6:
        return rawData.split('');
      case 7:
        return rawData.split('').map(Number);
      case 8:
        return rawData.join(' ');
      case 9:
        return rawData.join('\n');
      case 0:
        return rawData.join('');
      default:
        // For unknown codes, return data as is, perhaps log a warning.
        // console.warn(`dataConverter: Unknown conversion code ${conversionCode}. Returning raw data.`);
        return rawData;
    }
  } catch (error) {
    // Log conversion errors but return original data to prevent crash.
    // console.error(`dataConverter: Error during conversion for code ${conversionCode}:`, error);
    return rawData;
  }
}

/** Fetches and converts the next input line to an integer. */
function fetchInt() {
  return dataConverter(inputDataProcessor.fetchNextLine(), 1);
}

/** Fetches the next raw input line. */
function fetchRawLine() {
  return inputDataProcessor.fetchNextLine();
}

// --- Utility Functions for Core Logic ---

/**
 * Generates a string consisting of '9' repeated 'count' times.
 * @param {number} count - The number of '9's.
 * @returns {string} The generated string.
 */
function createNinesString(count) {
  if (count <= 0) return "";
  return Array(count).fill('9').join('');
}

/**
 * Checks if a number (converted to string) contains the digit '0'.
 * @param {number} num - The number to check.
 * @returns {boolean} True if '0' is found, false otherwise.
 */
function stringContainsZero(num) {
  return String(num).includes('0');
}

// --- Main Calculation Logic ---

/**
 * The primary function that executes the problem's calculations.
 * It processes an input string and a window size to compute a specific count.
 */
function performAnalysis() {
  const inputSequence = fetchRawLine(); // Get the main string
  const windowSize = fetchInt(); // Get the integer window size

  // Basic validation for input parameters.
  if (windowSize <= 0 || windowSize > inputSequence.length) {
    // console.error("Error: Window size is invalid."); // Removed error for raw output
    printToConsole(0); // Output 0 for invalid input, or handle as per problem spec
    return;
  }

  let resultAccumulator = 0; // The final accumulated count

  // Pre-calculate the lower bound for the inner number iteration.
  const lowerBoundForNumbers = Math.pow(10, windowSize - 1);
  const totalIterations = inputSequence.length - windowSize + 1;

  // Iterate through all possible starting positions for the window.
  for (let currentWindowStart = 0; currentWindowStart < totalIterations; currentWindowStart++) {
    let currentNumericSegment; // The number derived from the current window.

    if (currentWindowStart === 0) {
      // For the very first window, use the actual numeric value from the input string.
      const rawSegment = inputSequence.substring(currentWindowStart, currentWindowStart + windowSize);
      currentNumericSegment = dataConverter(rawSegment, 1);
    } else {
      // For subsequent windows, the problem logic dictates using a segment of all '9's.
      // This is a specific behavior observed in the original code.
      currentNumericSegment = dataConverter(createNinesString(windowSize), 1);
    }

    // Iterate downwards from the current segment's numeric value to the lower bound.
    for (let currentNumber = currentNumericSegment; currentNumber >= lowerBoundForNumbers; currentNumber--) {
      if (stringContainsZero(currentNumber)) {
        // If the number contains a '0' digit.
        const remainingLength = inputSequence.length - (currentWindowStart + windowSize);

        // Special handling for a specific condition (K=3, number ending in 00).
        if (windowSize === 3 && currentNumber % 100 === 0) {
          // Delegate to a helper function for specific sub-problem calculation.
          resultAccumulator += computeZeroContainingNumbers(remainingLength, windowSize - 1);
        } else {
          // General case for numbers containing '0'.
          resultAccumulator += 9 * remainingLength;
        }
      } else {
        // If the number does NOT contain a '0' digit.
        resultAccumulator++;
      }
    }
  }

  printToConsole(resultAccumulator);
}


/**
 * Helper function to calculate a partial count of zero-containing numbers.
 * This function is invoked from the main calculation logic under specific conditions.
 * @param {number} totalDigits - The total number of digits to consider (length of '9's string).
 * @param {number} groupSize - The size of the numeric groups to evaluate.
 * @returns {number} The calculated partial count.
 */
function computeZeroContainingNumbers(totalDigits, groupSize) {
  // Guard clause for invalid input.
  if (groupSize <= 0 || totalDigits < groupSize) {
    return 0;
  }

  // Create a string of '9's of the specified totalDigits length.
  const allNinesString = createNinesString(totalDigits);
  let partialCount = 0;

  // Pre-calculate the lower bound for inner iteration.
  const groupLowerBound = Math.pow(10, groupSize - 1);
  const maxGroupStartIndex = totalDigits - groupSize + 1;

  // Iterate through possible starting positions for groups within the '9's string.
  for (let startPosition = 0; startPosition < maxGroupStartIndex; startPosition++) {
    let currentGroupValue; // Numeric value of the current group.

    if (startPosition === 0) {
      // For the first group, take the actual value from the '9's string.
      const rawGroup = allNinesString.substring(startPosition, startPosition + groupSize);
      currentGroupValue = dataConverter(rawGroup, 1);
    } else {
      // For subsequent groups, always use a group of '9's. (Consistent with Main's logic)
      currentGroupValue = dataConverter(createNinesString(groupSize), 1);
    }

    // Iterate downwards from the current group's value to the lower bound.
    for (let numIterator = currentGroupValue; numIterator >= groupLowerBound; numIterator--) {
      if (stringContainsZero(numIterator)) {
        // If the number contains a '0' digit.
        const remainingDigits = totalDigits - (startPosition + groupSize);
        partialCount += 9 * remainingDigits;
      } else {
        // If the number does NOT contain a '0' digit.
        partialCount++;
      }
    }
  }
  return partialCount;
}