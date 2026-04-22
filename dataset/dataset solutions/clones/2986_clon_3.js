const inputSource = require('node:fs').readFileSync(0, 'utf8');

// A custom iterator-like object to process input lines.
const dataStreamProcessor = {
  inputSegments: inputSource.trim().split('\n'),
  currentReadPos: 0,
  totalSegments: 0, // Will be initialized after the object is created

  // Checks if there are more data segments to process.
  canFetchMore: function() {
    // Ensure totalSegments is correctly set if not already.
    if (this.totalSegments === 0 && this.inputSegments) {
      this.totalSegments = this.inputSegments.length;
    }
    return (this.currentReadPos < this.totalSegments);
  },

  // Retrieves the next data segment from the stream.
  fetchNextItem: function() {
    if (!this.inputSegments || this.inputSegments.length === 0) {
      logDebugMessage("Input segments are not initialized or empty.");
      throw new Error("No input data available.");
    }
    if (!this.canFetchMore()) {
      logDebugMessage("Attempted to fetch beyond available data.");
      throw new Error("Error: No more elements available in the data stream.");
    }
    const fetchedElement = this.inputSegments[this.currentReadPos];
    this.currentReadPos += 1; // Increment the read position.
    return fetchedElement;
  }
};

// Initialize totalSegments after the input is parsed.
dataStreamProcessor.totalSegments = dataStreamProcessor.inputSegments.length;

// Main program entry point.
mainExecutionFlow();

// --- Global Utility Functions for Input/Output and Data Conversion ---

// Retrieves the next raw string segment.
function retrieveNextSegment() {
  return dataStreamProcessor.fetchNextItem();
}

// Retrieves the next segment and converts it to an integer.
function getNumericSegment() {
  return convertInputData(retrieveNextSegment(), 1);
}

// Retrieves the next segment and splits it by space into a string array.
function getDelimitedStrings() {
  return convertInputData(retrieveNextSegment(), 2);
}

// Retrieves the next segment, splits by space, and converts to a number array.
function getDelimitedNumbers() {
  return convertInputData(retrieveNextSegment(), 4);
}

// Retrieves the next segment and splits it into an array of individual characters.
function getCharacterArray() {
  return convertInputData(retrieveNextSegment(), 6);
}

// Checks if there are more segments pending in the input stream.
function hasMoreSegments() {
  return dataStreamProcessor.canFetchMore();
}

// Outputs a message to the standard output.
function outputResult(message) {
  console.log(message);
}

// Logs a message to the standard error output for debugging purposes.
function logDebugMessage(message) {
  console.error(`DEBUG: ${message}`);
}

// Comprehensive utility for various input data transformations.
// conversionKind:
//   1: Convert to integer.
//   2: Split by space into a string array.
//   4: Split by space and convert to number array.
//   6: Split into individual characters.
//   7: Split into individual characters and convert to number array.
//   8: Join array elements with space.
//   9: Join array elements with newline.
//   0: Join array elements without separator.
//   11: Convert to floating-point number.
function convertInputData(rawInput, conversionKind) {
  try {
    switch (conversionKind) {
      case 1:
        return Number(rawInput);
      case 2:
        return String(rawInput).split(' ');
      case 4:
        return String(rawInput).split(' ').map(Number);
      case 6:
        return String(rawInput).split('');
      case 7:
        return String(rawInput).split('').map(Number);
      case 8:
        return Array.isArray(rawInput) ? rawInput.join(' ') : String(rawInput);
      case 9:
        return Array.isArray(rawInput) ? rawInput.join('\n') : String(rawInput);
      case 0:
        return Array.isArray(rawInput) ? rawInput.join('') : String(rawInput);
      case 11:
        return parseFloat(rawInput); // Added new conversion type
      default:
        logDebugMessage(`Unknown conversion type: ${conversionKind}. Returning raw input.`);
        return rawInput;
    }
  } catch (err) {
    logDebugMessage(`Conversion failed for input '${rawInput}' with kind ${conversionKind}: ${err.message}`);
    return rawInput; // Return original input on error
  }
}

// --- Primary Business Logic Function ---
function mainExecutionFlow() {
  const initialValue = getNumericSegment();

  if (isNaN(initialValue) || initialValue < 1) {
    logDebugMessage("Invalid initial value provided. Exiting.");
    outputResult(0); // Output 0 for invalid input as a safe default
    return;
  }

  // Obtain all factors for the given number and sort them in descending order.
  let descendingFactors = obtainAllFactors(initialValue).sort((valA, valB) => valB - valA);

  if (descendingFactors.length === 0) {
    outputResult(0); // If no factors are found, the sum is 0.
    return;
  }

  // Calculate the sum based on the first half of the sorted divisors.
  let cumulativeSum = 0;
  // Using bitwise right shift for floor division by 2, a common optimization.
  const processingLimit = descendingFactors.length >> 1;

  for (let iterIndex = 0; iterIndex < processingLimit; ++iterIndex) {
    const currentFactor = descendingFactors[iterIndex];
    cumulativeSum += currentFactor - 1;
  }

  outputResult(cumulativeSum);
}

// Calculates all positive integer divisors for a given number.
function obtainAllFactors(targetNumber) {
  const foundFactors = [];

  // Input validation for targetNumber.
  if (!Number.isInteger(targetNumber) || targetNumber < 1) {
    logDebugMessage(`Invalid input for factor calculation: ${targetNumber}.`);
    return foundFactors; // Return empty array for invalid input.
  }

  // Loop up to the square root of the target number.
  for (let currentCandidate = 1; currentCandidate * currentCandidate <= targetNumber; ++currentCandidate) {
    // Check if currentCandidate is a divisor.
    if (targetNumber % currentCandidate === 0) {
      foundFactors.push(currentCandidate); // Add the current divisor.

      // If currentCandidate is not the square root, add its pair divisor.
      if (currentCandidate * currentCandidate !== targetNumber) {
        const otherFactor = targetNumber / currentCandidate;
        foundFactors.push(otherFactor);
      }
    }
  }

  // Sort the factors in ascending order for consistent output.
  foundFactors.sort((a, b) => a - b);
  return foundFactors;
}